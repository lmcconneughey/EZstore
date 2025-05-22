import {z} from "zod"
import { formatNumberWithDecimal } from "./utils"

const currency = z.string().refine((value) => {
    return /^\d+(\.\d{2})?$/.test(formatNumberWithDecimal(Number(value))), 
     "Price must have at least two decimal places"
 })
// schema for inserting products
export const insertProductSchema = z.object({
    name: z.string().min(3, "Name must be at least 3 characters"),
    slug: z.string().min(3, "Slug must be at least 3 characters"),
    category: z.string().min(3, "Category must be at least 3 characters"),
    brand: z.string().min(3, "Brand must be at least 3 characters"),
    description: z.string().min(3, "Description must be at least 3 characters"),
    stock: z.coerce.number(),//<< stock may come in as a string
    images: z.array(z.string()).min(1, "Product must have at least one image"),
    isFeatured: z.boolean(),
    banner: z.string().nullable(),
    price: currency,

})

// user sign in schema
export const signInFormSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "password must be at least 6 characters")
})
// user register in schema
export const signUpFormSchema = z.object({
    name: z.string().min(3, "Name must be at least 3 Characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Confirm password must be at least 6 characters"),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",//<< if ^ false
    path: ['confirmPassword'],
});