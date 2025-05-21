import NextAuth from "next-auth"
import {PrismaAdapter} from "@auth/prisma-adapter"
import { prisma } from "@/db/prisma"
import  CredentialsProvider from "next-auth/providers/credentials"
import { compareSync } from "bcrypt-ts-edge"
import type { NextAuthConfig } from "next-auth"

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
            // update name is session and db
            if(trigger === 'update') {
                session.user.name = user.name
            }

            return session
        },
    }

} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(config)//<< NextAuthConfig will fix config ts type error