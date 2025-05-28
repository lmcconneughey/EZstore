import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/db/prisma"
import  CredentialsProvider from "next-auth/providers/credentials"
import { compareSync } from "bcrypt-ts-edge"
import type { NextAuthConfig } from "next-auth"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"


// add google social log in future update
export const config = {
    pages: {
        signIn: '/sign-in',
        error: '/sign-in' 
    },
    session: {
        strategy: 'jwt',// json web token
        maxAge: 30 * 24 * 60 * 60,// session will last 30 days
    },
    adapter: PrismaAdapter(prisma),
    providers: [
        CredentialsProvider({
            credentials: {
                email: {type: 'email'},
                password: {type: 'password'}
            },
            async authorize(credentials) {
                if(credentials == null) return null;

                // find user in DB
                const user = await prisma.user.findFirst({
                    where: {
                        email: credentials.email as string //<< for TS
                    }
                });

                // check if user exists & if password match
                if(user && user.password) {
                    const isMatch = compareSync(credentials.password as string, user.password)

                    // if password is correct, return user
                    if(isMatch) {
                        return {
                            id: user.id,
                            name: user.name,
                            email: user.email,
                            role: user.role
                        }
                    }
                }
                // if user does not exit | password does not match return null
                return null
            },
        })
    ],
    callbacks: {
        async session({ session, user, trigger, token }: any) { //<< any temporary will update
            // set user from token sub property
            session.user.id = token.sub
            session.user.role = token.role
            session.user.name = token.name
            //console.log(token)
            // update name is session and db
            if(trigger === 'update') {
                session.user.name = user.name
            }

            return session
        },
        async jwt({token, user, trigger, session}: any) {
            // Assign user fields to token
            if(user) {
                token.id = user.id

                // if user has no name, use email
                if(user.name === 'NO_NAME') {
                    token.name = user.email!.split('@')[0]

                    // Update database to reflect token name
                    await prisma.user.update({
                        where: {id: user.id},
                        data: {name: token.name}
                    })
                }
            
            }
            return token
        },
        authorized({request, auth}: any) {
            // Array of regex paths to protect
            const protectedPaths =[
                /\/shipping-address/,
                /\/payment-method/,
                /\/place-order/,
                /\/profile/,
                /\/user\/(.*)/,
                /\/order\/(.*)/,
                /\/admin/,
            ]
            // Get pathname from request Url Obj
            const { pathname } = request.nextUrl

            // Check if user is accessing a protected path
            if(!auth && protectedPaths.some((path) => path.test(pathname))) return false 

            // Check session cart cookie 
            if(!request.cookies.get('sessionCartId')) {
               // Generate new session cart id cookie session start
               const sessionCartId = crypto.randomUUID()
               
               // Clone request headers
               const newRequestHeaders = new Headers(request.headers)

               // Create new response and add new headers
                const response = NextResponse.next({
                    request: {
                        headers: newRequestHeaders
                    }
                })

                // Set new sessionCartId in response cookies
                response.cookies.set('sessionCartId', sessionCartId)

                return response

            } else {
                return true
            }
        }
    }

} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(config)//<< NextAuthConfig will fix config ts type error