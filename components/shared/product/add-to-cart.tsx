'use client'
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { CartItem } from "@/types";
import { addItemToCart } from "@/lib/actions/cart.actions";

const AddToCart = ({item}: {item: CartItem}) => {
    const router = useRouter()
    

    const handleAddToCart = async () => {
        const res = await addItemToCart(item)
        if (!res.success) {
            toast.error(res.message); // Changed to use toast.error (dot notation)
            return;
          }
      
        toast.success(`${item.name} added to cart`, { // Changed to use toast.success (dot notation)
            action: {
              label: "Go to Cart",
              onClick: () => router.push("/cart"),
            },
        });
      
    };
    

    return ( <Button className="w-full" type='button' onClick={handleAddToCart}>
            <Plus/> Add To Cart
        </Button>);
}
 
export default AddToCart;