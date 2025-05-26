
export const APP_NAME: string = process.env.NEXT_PUBLIC_APP_NAME || 'Ez Store'
export const APP_DESCRIPTION: string = process.env.NEXT_PUBLIC_APP_DESCRIPTION || 'Modern Ecommerce Online Retailer'
export const SERVER_URL: string = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
export const LATEST_PRODUCTS_LIMIT= Number(process.env.LATEST_PRODUCTS_LIMIT) || 4;
//--- default values
export const signInDefaultValues = {
    email: '',
    password: ''
}
export const signUpDefaultValues = {
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
}

export const shippingAddressDefaultValues = {
    fullName: '',
    streetAddress: '',
    city: '',
    postalCode: '',
    country: '',
}