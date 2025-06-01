'use server'

import { cookies } from "next/headers"
import { CartItem } from "@/types"
import { formatError, convertPrismaObjToJSObj, round2 } from "../utils"

import { auth } from "@/auth"
import { prisma } from "../../db/prisma"
import { cartItemSchema, insertCartSchema } from "../validators"
import { revalidatePath } from "next/cache"

// Calculate cart prices
const calcPrice = (items: CartItem[]) => {
   const itemsPrice = round2(
    items.reduce((acc, item) => acc + Number(item.price) * item.qty, 0)
   ),
   shippingPrice = round2(itemsPrice > 100 ? 0 : 10),
   taxPrice = round2(0.15 * itemsPrice),// 15% tax sheesh
   totalPrice = round2(itemsPrice + taxPrice + shippingPrice)

   return {
        itemsPrice: itemsPrice.toFixed(2),//<- 2 decimal places
        shippingPrice: shippingPrice.toFixed(2),
        taxPrice: taxPrice.toFixed(2),
        totalPrice: totalPrice.toFixed(2),

   }
}

export async function addItemToCart( data: CartItem ) {
    try {
        // Check for cart cookie
        const sessionCartId = (await cookies()).get('sessionCartId')?.value
        if(!sessionCartId) throw new Error('Cart Session Not Found');

        // Get session and user Id
        const session = await auth()
        const userId = session?.user?.id ? (session.user.id as string) : undefined;

        // Get cart
        const cart = await getMyCart()//<<<<

        // Parse and validate item
        const item = cartItemSchema.parse(data)

        // Find product in db

        const product = await prisma.product.findFirst({
            where: {
                id: item.productId
            }
        });

        if(!product) throw new Error('Product not found');

        if(!cart){
            // create new cart object
            const newCart = insertCartSchema.parse({
                userId: userId,
                items: [item],
                sessionCartId: sessionCartId,
                ...calcPrice([item])
            });
            
            // Add to db

            await prisma.cart.create({
                data: newCart
            })

            // Revalidate product page
            revalidatePath(`/product/${product.slug}`)     

            return {
                success: true,
                message: `${product.name} added to cart`
            }
            
        } else {
            // Handle item quantity
            // Check if item exists in cart
            const existItem = (cart.items as CartItem[]).find((x) => x.productId === item.productId)

            if (existItem) {
                // check stock
                if(product.stock < existItem.qty + 1) {
                    throw new Error('Not enough stock')
                };
                //increase quantity
                (cart.items as CartItem[]).find(
                    (x) => x.productId === item.productId
                )!.qty = existItem.qty + 1;

            } else {
                // Check stock
                if(product.stock < 1) throw new Error('Not enough stock');
                // Add item to cart.items
                cart.items.push(item)
            }
            // Update db
            await prisma.cart.update({
                
                where: { id: cart.id },
                data: {
                  items: cart.items as CartItem[],
                  ...calcPrice(cart.items as CartItem[]),
                },
              });
        
            revalidatePath(`/product/${product.slug}`);

            return {
                success: true,
                message: `${product.name} ${existItem ? 'updated in' : 'added to'} cart`
            }
        }
        
        
    } catch (error) {
        return {
            success: false,
            message: formatError(error)
        }
    }
   
}

export async function getMyCart() {
      // Check for cart cookie
      const sessionCartId = (await cookies()).get('sessionCartId')?.value
      if(!sessionCartId) throw new Error('Cart Session Not Found');

      // Get session and user Id
      const session = await auth()
      const userId = session?.user?.id ? (session.user.id as string) : undefined;

      // Get user cart from db
      const cart = await prisma.cart.findFirst({
        where: userId ? {userId: userId} : {sessionCartId: sessionCartId}
      })
      if (!cart) return undefined;

      // CONVERT DECIMALS AND RETURN
      return convertPrismaObjToJSObj({
        ...cart,
        items: cart.items as CartItem[],
        itemsPrice: cart.itemsPrice.toString(),
        totalPrice: cart.totalPrice.toString(),
        shippingPrice: cart.shippingPrice.toString(),
        taxPrice: cart.taxPrice.toString()
      })
      
}

export async function removeItemFromCart(productId: string) {
    try {
         // Check for cart cookie
      const sessionCartId = (await cookies()).get('sessionCartId')?.value
      if(!sessionCartId) throw new Error('Cart Session Not Found');

        // Get Product
        const product = await prisma.product.findFirst({
            where: {id: productId}
        })
        if(!product) throw new Error('Product not found')
        
        // Get user Cart
        const cart = await getMyCart();

        if(!cart) throw new Error('Cart not found');

        // Check for item
        const exist = (cart.items as CartItem[]).find((x) => x.productId === productId);
        if(!exist) throw new Error('Item not found')

        // Check if 1 item

    if(exist.qty === 1) {
        // remove from cart
        cart.items = (cart.items as CartItem[]).filter((x) => x.productId !== exist.productId)
    } else {
        // Decrease qty
        (cart.items as CartItem[]).find((x) => x.productId === productId)!.qty = exist.qty - 1;
    }
    // Updates cart in db
    await prisma.cart.update({
        where: {id: cart.id},
        data: {
            items: cart.items as CartItem[],
            ...calcPrice(cart.items as CartItem[])
        }
    })

    revalidatePath(`/product/${product.slug}`)

    return {
        seccess: true,
        message: `${product.name} was removed from cart `
    }

    } catch (error) {
        return {success: false,
        message: formatError(error)}
    }
}