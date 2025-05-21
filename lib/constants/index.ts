import { preconnect } from "react-dom"

export const APP_NAME: string = process.env.NEXT_PUBLIC_APP_NAME || 'Prostore'
export const APP_DESCRIPTION: string = process.env.NEXT_PUBLIC_APP_DESCRIPTION || 'Modern Ecommerce Online Retailer'
export const SERVER_URL: string = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
export const LATEST_PRODUCTS_LIMIT= Number(process.env.LATEST_PRODUCTS_LIMIT) || 4;
