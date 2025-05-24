'use server'

import { cookies } from "next/headers"
import { CartItem } from "@/types"
import { formatError, convertPrismaObjToJSObj } from "../utils"

import { auth } from "@/auth"
import { prisma } from "../../db/prisma"
import { cartItemSchema } from "../validators"



export async function addItemToCart( data: CartItem ) {
    try {
        // Check for cart cookie
        const sessionCartId = (await cookies()).get('sessionCartId')?.value
        if(!sessionCartId) throw new Error('Cart Session Not Found');

        // Get session and user Id
        const session = await auth()
        const userId = session?.user?.id ? (session.user.id as string) : undefined;

        // Get cart
        const cart = await getMyCart()

        // Parse and validate item
        const item = cartItemSchema.parse(data)

        
           //TEST
           console.log({
            'session Cart Id': sessionCartId,
            'user Id': userId,
            'Item requested': item
        }) //works


        return {
            success: true,
            message: 'Item added to cart'
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