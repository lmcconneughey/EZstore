'use server'

import { prisma } from "../../db/prisma";
import { convertPrismaObjToJSObj } from "../utils";
import { LATEST_PRODUCTS_LIMIT, PAGE_SIZE } from "../constants";
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
        skip: (page -1) * limit,
        take: limit  
    });

    const dataCount = await prisma.product.count();

    return {
        data,
        totalPages: Math.ceil(dataCount / limit)
    }
}

