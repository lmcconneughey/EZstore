import Image from "next/image";
import Link from "next/link";
import { APP_NAME } from "@/lib/constants";
import Menu from "./menu";

const Header = () => {
    return  <header className="w-full border-b">
        <div className="wrapper flex-betweeen">
            <div className="flex-start">
                <Link href='/' className="flex-start absolute pt-7 ml-2">
                    <Image 
                        src='/images/ez-store-logo.png' 
                        alt={`${APP_NAME} logo`} 
                        height={48}
                        width={48}
                        className='rounded-md'
                        priority={true}
                    />
                    <span className="hidden lg:block font-bold text-2x1 ml-3">
                        {APP_NAME}
                    </span>                   
                </Link>
            </div>
            <Menu />
        </div>
    </header> 
}
 
export default Header;