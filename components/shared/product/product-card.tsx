import Link from "next/link";
import Image from "next/image";
import ProductPrice from "./product-price";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Product } from "../../../types/index";
import Rating from "./rating";

const ProductCard = ({product}: {product: Product}) => {
    return ( <Card className="w-full max-w-sm">
       <CardHeader className="p-0 items-center">
            <Link href={`/product/${product.slug}`}>
                <Image 
                    src={product.images[0]}
                    alt={product.name}
                    width={300}
                    height={300}
                />
            </Link>
        </CardHeader> 
        <CardContent className="p-4 grid gap-4">
            <div className="text-xs">
               {product.brand}
            </div>
            <Link href={`/product/${product.slug}`}>
                <h2 className="text-sm font-medium">
                    {product.name}
                </h2>
            </Link>
            <div className="flex-between gap-4">
                <Rating value={Number(product.rating)} />
                {product.stock > 0 ? (
                    <ProductPrice 
                        value={Number(product.price)}
                        /* dyn change class className="text-red-500" */ />
                ) : (
                    <p className="text-destructive">
                        Out Of Stock
                    </p>
                ) }
            </div>
        </CardContent>
    </Card> );
}
 
export default ProductCard;