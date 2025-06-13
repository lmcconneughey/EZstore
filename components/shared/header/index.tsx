import Image from "next/image";
import Link from "next/link";
import { APP_NAME } from "@/lib/constants";
import Menu from "./menu";
import CategoryDrawer from "./category-drawer";

const Header = () => {
    return  <header className="flex flex-col w-full border-b">
        <div className="flex flex-between h-16 px-4 wrapper">
            <div className="flex-start">
                <CategoryDrawer />
                <Link href='/' className="flex-start ml-2">
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