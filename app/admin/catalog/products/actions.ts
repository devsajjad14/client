import { db } from '@/lib/db'
import { products } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function getProducts() {
  try {
    const products = await db.query.products.findMany({
      with: {
        variations: true,
        alternateImages: true,
      },
    });
    return products;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw new Error('Failed to fetch products');
  }
}

export async function deleteProduct(id: number) {
  try {
    await db.delete(products).where(eq(products.id, id));
  } catch (error) {
    console.error('Error deleting product:', error);
    throw new Error('Failed to delete product');
  }
} 