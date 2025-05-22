'use client'
import { APP_NAME } from "@/lib/constants";
import Image from "next/image";
import { Button } from "@/components/ui/button";

const notFounfPage = () => {
    
    return ( <div className="flex flex-col items-center justify-center min-h-screen ">
        <Image
            src="/Images/logo.svg"
            alt={`${APP_NAME} Logo`}
            width={48}
            height={48}
            priority={true}
        />
        <div className="p-6 w-1/3 rounded-lg shadow-md text center">
            <h1 className="text-3xl text-center font-bold mb-4">Not Found</h1>
            <p className="text-destructive text-center">Could Not Find Requested Page</p>
            <Button variant={"outline"} className="mt-4 w-full items-center" onClick={() => (window.location.href = '/')}>
                Back To Home
            </Button>
        </div>
    </div> );
}
 
export default notFounfPage;