
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
};

export const PAYMENT_METHODS = process.env.PAYMENT_METHODS ? process.env.
PAYMENT_METHODS.split(", ") : ['PayPal', 'Stripe', 'CashOnDelivery'];

export const DEFFAULT_PAYMENT_METHOD = process.env.DEFAULT_PAYMENT_METHOD || 'PayPal';

// User orders pagination max orders dispalyed

export const PAGE_SIZE = Number(process.env.PAGE_SIZE) || 10;

export const productDefaultValues = {
    name: '',
    slug: '',
    category: '',
    images: [],
    brand: '',
    description: '',
    price: '0',
    stock: 0,
    rating: '0',
    numReviews: '0',
    isFeatured: false,
    banner: null,
}