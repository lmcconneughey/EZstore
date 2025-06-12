'use server'

import { prisma } from "../../db/prisma";
import { convertPrismaObjToJSObj, formatError } from "../utils";
import { LATEST_PRODUCTS_LIMIT, PAGE_SIZE } from "../constants";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { insertProductSchema, updateProductSchema } from "../validators";

// Get latest products
export async function getLatestProducts() {
    const data = await prisma.product.findMany({
        take: LATEST_PRODUCTS_LIMIT,//<< will get 4 products at a time
        orderBy: {createdAt: 'desc'},
    })

    return convertPrismaObjToJSObj(data)
}
// Get single product by slug
export async function getProductBySlug(slug: string) {
    return await prisma.product.findFirst({
        where: {slug: slug}
    })
}

// Get single product by Id
export async function getProductById(productId: string) {
    const data = await prisma.product.findFirst({
        where: {id: productId}
    });
    return convertPrismaObjToJSObj(data)
}

// Get all products
export async function getAllProducts({
    query,
    limit = PAGE_SIZE,
    page,
    category
}: {
    query: string;
    limit?: number;
    page: number;
    category?: string
}) {
    const data = await prisma.product.findMany({
        orderBy: {createdAt: 'desc'},
        skip: (page -1) * limit,
        take: limit  
    });

    const dataCount = await prisma.product.count();

    return {
        data,
        totalPages: Math.ceil(dataCount / limit)
    }
}

// Delete product
export async function deleteProduct(id: string) {
    try {
        const productExists = await prisma.product.findFirst({
            where: {id},
        })
        if(!productExists) throw new Error('Product not found');

        await prisma.product.delete({
            where: {id}
        })

        revalidatePath('/admin/products');

        return {
            success: true,
            message: 'Product deleted successfully',
        }

    } catch (error) {
        return {
            success: false,
            message: formatError(error)
        }
    }
   
}

// Create product
export async function createProduct(data: z.infer<typeof insertProductSchema>) {
    try {
        const product = insertProductSchema.parse(data)// validate using zod schema
        await prisma.product.create({
            data: product
        });

        revalidatePath('/admin/products');

        return {
            success: true,
            message: 'Product created successfully'
        }
        
    } catch (error) {
        return {
            success: false,
            message: formatError(error),
        }
    }
}
// Update product
export async function updateProduct(data: z.infer<typeof updateProductSchema>) {
    try {
        const product = updateProductSchema.parse(data)// validate using zod schema
        const productExists = await prisma.product.findFirst({
            where: {id: product.id}
        })

        if(!productExists) {
            throw new Error('Product not found')
        }

        await prisma.product.update({
            where: {id: product.id},
            data: product
        })

        revalidatePath('/admin/products');

        return {
            success: true,
            message: 'Product updated successfully'
        }
        
    } catch (error) {
        return {
            success: false,
            message: formatError(error),
        }
    }
    
}
