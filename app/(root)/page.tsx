import ProductList from "@/components/shared/product/product-list";
import { getLatestProducts, getFeaturedProducts } from "@/lib/actions/product-actions";
import ProductCarousel from "@/components/shared/product/product-carousel";
import ViewAllProductsButton from "@/components/view-all-products-button";

export const metadata = {
  title: 'home'
}

const Homepage = async () => {
  const latestProducts = await getLatestProducts()
  // implement a limit of 4 products on screen
  const featuredProducts = await getFeaturedProducts()


  return ( 
  <div>
      { 
          featuredProducts.length > 0 && 
          <ProductCarousel data={featuredProducts} /> 
      }
      <ProductList 
          data={latestProducts} 
          title="Newest Arrivals" 
          limit={4}
      />
      <ViewAllProductsButton />
  </div> );
}
 
export default Homepage;