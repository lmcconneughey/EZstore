import { DefaultSession } from "next-auth";

// extend user object to include role
declare module 'next-auth' {
    export interface Session {
        user: {
            role: string
        } & DefaultSession['user']
    }
}