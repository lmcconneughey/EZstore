'use server'

import { isRedirectError } from "next/dist/client/components/redirect-error"
import { convertPrismaObjToJSObj, formatError } from "../utils"
import { auth } from "@/auth"
import { getMyCart } from "./cart.actions"
import { getUserById } from "./user.actions"
import { insertOrderSchema } from "../validators"
import { prisma } from "@/db/prisma"
import { CartItem, PaymentResult } from "@/types"
import { paypal } from "../paypal"
import { revalidatePath } from "next/cache"// order page revalidate and refresh once paid
import { PAGE_SIZE } from "../constants"

// Create  order and create order items
export async function createOrder() {
    try {
        const session = await auth()
        if(!session) throw new Error('User not authenticated')

        const cart = await getMyCart()
        const userId = session?.user?.id
        if(!userId) throw new Error('User not found')

        const user = await getUserById(userId);

        if(!cart || cart?.items.length === 0) {
            return {
                success: false,
                message: 'Cart is Empty',
                redirectTo: '/cart'
            }
        }
        if(!user.address) {
            return {
                success: false,
                message: 'No shipping address',
                redirectTo: '/shiiping-address'
            }
        }
        if(!user.paymentMethod) {
            return {
                success: false,
                message: 'No Payment Method',
                redirectTo: '/payment-method'
            }
        }

        // Create order object // Order to be submited
        const order = insertOrderSchema.parse({
            userId: user.id,
            shippingAddress: user.address,
            paymentMethod: user.paymentMethod,
            itemsPrice: cart.itemsPrice,
            shippingPrice: cart.shippingPrice,
            taxPrice: cart.taxPrice,
            totalPrice: cart.totalPrice,
        })

        // Create a transaction to create order & order items in db
        const insertedOrderId = await prisma.$transaction(async (tx) => {
            // Create order
            const insertedOrder = await tx.order.create({ data: order }) 
            //Create order items from cart items  
            for (const item of cart.items as CartItem[]) {
                await tx.orderItem.create({
                    data: {
                        ...item,
                        price: item.price,
                        orderId: insertedOrder.id
                    }
                })
            }  
            
            // Clear cart
            await tx.cart.update({
                where: {id: cart.id},
                data: {
                    items: [],
                    totalPrice: 0,
                    taxPrice: 0,
                    shippingPrice: 0,
                    itemsPrice: 0,
                },
            });

            return insertedOrder.id
        })

        if(!insertedOrderId) throw new Error('Order not created');

        return {
            success: true,
            message: 'Order created',
            redirectTo: `/order/${insertedOrderId}`
        }

    } catch (error) {
        if(isRedirectError(error)) throw error
        return{
            success: false,
            message: formatError(error)
        }
    }
}

// Get order by id

export async function getOrderById(orderId: string) {
    const data = await prisma.order.findFirst({
        where: {
            id: orderId
        },
        include: {
            orderitems: true,//<< items included when we get the order
            user: {select: { name: true, email: true } }// include user name and email
        },
    })

    return convertPrismaObjToJSObj(data)
}

// Create new paypal order
export async function createPayPalOrder(orderId: string) {
                                      //^^paypal orderId
    try {
        // get order from db
        const order = await prisma.order.findFirst({
            where: {
                id: orderId
            }
        });

        if(order) {
            // Create paypal order
            const paypalOrder = await paypal.createOrder(Number(order.totalPrice));

            // Update order with paypal order id
            await prisma.order.update({
                where: {
                    id: orderId
                },
                data: {
                    paymentResult: {
                        id: paypalOrder.id,
                        email_address: '',
                        status: '',
                        pricePaid: 0,
                    }
                }
            });
            return {
                success: true,
                message: 'Item order created Successfully',
                data: paypalOrder.id,
            }
        } else {
            throw new Error('Order not found')
        }
        
    } catch (error) {
        return {
            success: false,
            message: formatError(error)
        };
    }
}

// Approve paypal order & update order 
export async function approvePayPalOrder(
    orderId: string,//<< order UUID
    data: { orderID: string }//<< PAYPAL orderID
) {
    try {
        // Get order from db
        const order = await prisma.order.findFirst({
            where: {
                id: orderId
            }
        });
        if(!order) throw new Error("Order not found")

        const captureData = await paypal.capturePayment(data.orderID);
        if(!captureData || captureData.id !== (order.paymentResult as PaymentResult)?.id || captureData.status !== 'COMPLETED') {
            throw new Error('Error in PayPal payment');
        }
        
        // Update oder to paid
        await updateOrderToPaid({
            orderId,
            paymentResult: {
                id: captureData.id,
                status: captureData.status,
                email_address: captureData.payer.email_address,
                pricePaid: captureData.purchase_units[0]?.payments?.captures[0]?.amount?.value
            }
        })

        revalidatePath(`/order/${orderId}`)

        return {
            success: true,
            message: 'Order Successfull',
        }

    } catch (error) {
        return {
            success: false,
            message: formatError(error)
        }
    }
}

// Update order to paid
async function updateOrderToPaid({
    orderId,
    paymentResult
}: {
    orderId: string;
    paymentResult?: PaymentResult
}) {
    const order = await prisma.order.findFirst({
        where: {
            id: orderId
        },
        include: {
           orderitems: true 
        }
    });
    if(!order) throw new Error("Order not found");
    
    // check if order is already paid 
    if(order.isPaid) throw new Error('Order is already paid')

    // Transaction to update order and product stock
    await prisma.$transaction(async (tx) => {
        // iterate over products and update stock
        for(const item of order.orderitems) {
            await tx.product.update({
                where: { id: item.productId },
                data: { stock: { increment: -item.qty} },
            });
        }

        // Change order to Paid
        await tx.order.update({
            where: {id: orderId},
            data: {
                isPaid: true,
                paidAt: new Date(),
                paymentResult 
            }
        })
    });

    // Get updated order after Transaction
    const updatedOrder = await prisma.order.findFirst({
        where: {id: orderId},
        include: {
            orderitems: true,
            user: {select: {
                name: true,
                email: true
            } },
        }
    });

    if(!updatedOrder) throw new Error('Order not found')

}

// Get user's orders
export async function getMyOrders({
    limit = PAGE_SIZE,
    page
}: {
    limit?: number;
    page: number;
}) {
    const session = await auth()
    if(!session) throw new Error('User is not authorized')

    const data = await prisma.order.findMany({
        where: {userId: session?.user?.id!},
        orderBy: {createdAt: 'desc'},
        take: limit,
        skip: (page - 1) * limit
    });
    const dataCount = await prisma.order.count({
        where: {userId: session?.user?.id!}
    });
    return {
        data,
        totalPages: Math.ceil(dataCount /limit)
    }
}