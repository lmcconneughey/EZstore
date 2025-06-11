import {z} from "zod"
import { formatNumberWithDecimal } from "./utils"
import { PAYMENT_METHODS } from "./constants"

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
    // images: z.array(z.string()).min(1, "Product must have at least one image"),
    // isFeatured: z.boolean(),
    // banner: z.string().nullable(),
    price: currency,
});

// Update product schema
export const updateProductSchema = insertProductSchema.extend({
    id: z.string().min(1, 'Id is reqired'),
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
// Cart Schema
export const cartItemSchema = z.object({
    productId: z.string().min(1, 'Product required'),
    name: z.string().min(1, 'Name required'),
    slug: z.string().min(1, 'Slug required'),
    qty: z.number().int().nonnegative('Quantity must be a positive number'),
    image: z.string().min(1, 'Image required'),
    price: currency// dry
});

// insert Cart Schema
export const insertCartSchema = z.object({
    items: z.array(cartItemSchema),
    itemsPrice: currency,
    totalPrice: currency,
    shippingPrice: currency,
    taxPrice: currency,
    sessionCartId: z.string().min(1, 'Session cart Id required'),
    userId: z.string().optional().nullable(),
})

// Shipping address schema

export const shippingAddressSchema = z.object({
    fullName: z.string().min(3, 'Name must be at least 3 characters'),
    streetAddress: z.string().min(3, 'Address must be at least 3 characters'),
    city: z.string().min(3, 'City must be at least 3 characters'),
    postalCode: z.string().min(3, 'Postal code must be at least 3 characters'),
    country: z.string().min(3, 'Country must be at least 3 characters'),
    lat: z.number().optional(),
    lng: z.number().optional(),
})

// Payment method schema

export const paymentMethodSchema = z.object({
    type: z.string().min(1, 'Payment method reqired')
}).refine((data) => PAYMENT_METHODS.includes(data.type), {
    path: ['type'],
    message: 'Invalid payment method',
});

// Insert order schema

export const insertOrderSchema = z.object({
    userId: z.string().min(1, 'User is required'),
    itemsPrice: currency,
    shippingPrice: currency,
    taxPrice: currency,
    totalPrice: currency,
    paymentMethod: z.string().refine((data) => PAYMENT_METHODS.includes(data), {
        message: 'Invalid payment method'
    }),
    shippingAddress: shippingAddressSchema,
});

// Insert order item schema

export const insertOrderItemSchema = z.object({
    productId: z.string(),
    slug: z.string(),
    image: z.string(),
    name: z.string(),
    price: currency,
    qty: z.number(),
})

// Payment result schema
export const paymentResultSchema = z.object({
    id: z.string(),
    status: z.string(),
    email_address: z.string(),
    pricePaid: z.string(),
})

// Update user profile schema
export const updateProfileSchema = z.object({
    name: z.string().min(3,'Name must have at least 3 characters'),
    email: z.string().min(3,'Email must have at least 3 characters'),
    
})
