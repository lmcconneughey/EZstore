'use server'

import { signInFormSchema, signUpFormSchema } from "../validators"
import {signIn, signOut} from "@/auth"
import { isRedirectError } from "next/dist/client/components/redirect-error"
import { hashSync } from "bcrypt-ts-edge"
import { prisma } from "@/db/prisma"
import { formatError } from "../utils"

// credentials sign in

export async function signInWithCredentials(prevState: unknown, formData: FormData) {
    try {
        const user = signInFormSchema.parse({
            email: formData.get('email'),
            password: formData.get('password')
        })

        await signIn('credentials', user)

        return {success: true, message: 'Signed in successfully'}
    } catch (error) {
        if(isRedirectError(error)) {
            throw error//<< next handle redirect
        }
        return {success: false, message: "Invalid email or/and password"}
    }
}

// sign out user
export async  function signOutUser() {
    await signOut()
}

// sign up/rigister user
export async function signUpUser(prevState: unknown, forData: FormData) {
    try {
        const user = signUpFormSchema.parse({
            name: forData.get('name'),
            email: forData.get('email'),
            password: forData.get('password'),
            confirmPassword: forData.get('confirmPassword'),
        });

        const plainPassword = user.password // before hash 

        user.password = hashSync(user.password, 10)//<< before it goes into the db

        await prisma.user.create({
            data: {
                name: user.name,
                email: user.email,
                password: user.password
            }
        })
        // sign in after user is created
        await signIn('credentials', {
            email: user.email,
            password: plainPassword,
        });

        return {
            success: true,
            message: "User registered successfully"
        }
    } catch (error) {
        // console.log(error.name);
        // console.log(error.code);
        // console.log(error.errors);
        // console.log(error.meta?.target);
        
        if(isRedirectError(error)) {
            throw error//<< next handle redirect
        }
        return {success: false, message: formatError(error)}
    }
}