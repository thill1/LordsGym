# Lord's Gym Store — Architecture Deep Dive

**Admin CRUD and Customer Retail Flow**

---

## 1. Architecture Overview

### Dual StoreProvider Instances

The app uses **two separate `StoreProvider` instances** (see `App.tsx`):

| Route        | StoreProvider | Notes                                       |
|--------------|---------------|---------------------------------------------|
| `/admin`     | Instance A    | Wraps Admin only; no Layout                  |
| All others   | Instance B    | Wraps Layout (Shop, Home, Checkout, etc.)  |

When navigating from Admin → Shop, Instance A unmounts and Instance B mounts. **They do not share React state.** Sync happens only via:

1. **Supabase** (when configured) — single source of truth
2. **localStorage** (`shop_products`) — fallback when Supabase is not configured

---

## 2. Data Flow: Admin Store CRUD

### 2.1 Product Model (`types.ts`)

```typescript
interface Product {
  id: string;
  title: string;
  price: number;
  image: string;
  category: string;
  featured?: boolean;
  imageComingSoon?: boolean;
  description?: string;
  inventory?: Record<string, number>;
  variants?: Record<string, any>;
}
```

### 2.2 Admin Store UI (`pages/Admin.tsx`)

| Feature | Implementation |
|---------|-----------------|
| **Store tab** | `activeTab === 'store'` renders Store Manager |
| **Add product** | `openProductModal()` → modal form → `handleSaveProduct` → `addProduct(newProduct)` |
| **Edit product** | `openProductModal(product)` → pre-fills form → `handleSaveProduct` → `updateProduct(newProduct)` |
| **Delete product** | Row Delete button → `confirmDialog` → `deleteProduct(product.id)` |
| **Bulk operations** | `ProductBulkOperations` — bulk delete, bulk edit (category, featured) |

**Product form fields:**
- Title, Description, Price, Category
- Inventory by size (S–2XL) for Apparel
- Color variants (inventory keys like `color_black`, etc.)
- Featured checkbox (“Feature this product on homepage”)
- Image: URL input + file upload + “Image coming soon” toggle

### 2.3 ProductBulkOperations (`components/admin/ProductBulkOperations.tsx`)

- Row selection via checkboxes
- **Bulk Edit** modal: change category and/or featured for selected products
- **Bulk Delete**: calls `onBulkDelete(ids)` for each id
- Uses `ConfirmDialog` for delete confirmation

### 2.4 StoreContext CRUD Actions (`context/StoreContext.tsx`)

| Action | State Update | Supabase (if configured) |
|--------|--------------|---------------------------|
| `addProduct(p)` | `setProducts(prev => [...prev, p])` | `insert` into `products` |
| `updateProduct(p)` | `setProducts(prev => prev.map(...))` | `upsert` into `products` |
| `deleteProduct(id)` | `setProducts(prev => prev.filter(...))` | `delete` from `products` where `id` |

**Persistence effect** (runs on `products` change):

- Writes to `localStorage` (`shop_products`)
- Upserts each product to Supabase `products` table (id, title, price, category, image, image_coming_soon, description, inventory, featured)

---

## 3. Data Flow: Product Loading

### 3.1 Initial State

```typescript
// StoreContext.tsx — useState initializer
const [products, setProducts] = useState<Product[]>(() => {
  const savedProducts = safeGet<Product[] | null>('shop_products', null);
  if (savedProducts && savedProducts.length === ALL_PRODUCTS.length) {
    // Merge: keep admin customizations, update image/title from constants
    return merged;
  }
  return ALL_PRODUCTS;
});
```

### 3.2 Supabase Load (`loadFromSupabase`)

When `isSupabaseConfigured()`:

1. `supabase.from('products').select('*').order('created_at', { ascending: false })`
2. If `productsData !== null && productsData !== undefined`:
   - Map rows → `Product` (id, title, price, category, image, imageComingSoon, description, inventory, featured)
   - `setProducts(mapped)` — **including empty array**
   - Set `productsLoadedFromSupabaseRef.current = true`

### 3.3 Sync from Constants (No Supabase)

When Supabase is **not** configured:

- `syncProductsFromConstants(prevProducts, ALL_PRODUCTS)` runs after load
- Adds products from `ALL_PRODUCTS` that are not already in `prevProducts`
- **Never removes** products (avoids re-adding deleted ones when Supabase is source)

---

## 4. Customer Retail Flow

### 4.1 Shop Page (`pages/Shop.tsx`)

- `useStore()` → `products`
- Category filter: All Products | Men's Apparel | Women's Apparel | Accessories
- `filteredProducts` → `ShopifyProduct` grid (responsive, 1–3 columns)

### 4.2 ShopifyProduct (`components/ShopifyProduct.tsx`)

- Product card with image (or “Coming soon: Lord's Gym merch”)
- Title, category, price
- Size selector (S–2XL) for Apparel; “One Size” for Accessories
- **Add to Cart** → `addToCart(product, selectedSize)`

### 4.3 Cart (`context/StoreContext.tsx`)

| Function | Behavior |
|----------|----------|
| `addToCart(product, size)` | Creates `CartItem` with `cartId = ${product.id}-${size}`, quantity 1, or increments existing |
| `removeFromCart(cartId)` | Removes item |
| `updateQuantity(cartId, delta)` | Adjusts quantity; **removes item when quantity ≤ 0** |
| `clearCart()` | Empties cart |

`CartItem` extends `Product` with `cartId`, `quantity`, `selectedSize`.

### 4.4 CartDrawer (`components/CartDrawer.tsx`)

- Slide-out panel (right)
- Lists cart items with thumbnail, title, size, quantity controls, line total
- Size label: `item.selectedSize` (e.g. “One Size” for accessories)
- **Checkout Now** → `onCheckout()` → `onNavigate('/checkout')`

### 4.5 Checkout (`pages/Checkout.tsx`)

- Uses `cart`, `cartTotal`, `closeCart`, `clearCart`
- Empty cart → “Your cart is empty” + “Return to Shop”
- Form: Contact, Billing, Payment (mock Stripe)
- **Pay** → `handleSubmit` → 2s delay → `clearCart()` → `onSuccess()` → Order Confirmation

### 4.6 Layout & Cart Access

- `Layout` renders `CartDrawer` and passes `onCheckout` → `onNavigate('/checkout')`
- Cart icon in header uses `cartCount` from `useStore()`
- Cart drawer opens via `openCart()` (from header or Add to Cart)

---

## 5. Home Page Integration

### New Arrivals Section (`pages/Home.tsx`)

- Uses `products` from `useStore()`
- Logic:
  - If `products.length > 0`:
    - Featured products first
    - If ≥ 4 featured: show up to 8 featured
    - If &lt; 4 featured: show featured + non-featured up to 4
    - If 0 featured: show first 4 non-featured
  - If `products.length === 0`: fallback to `FEATURED_PRODUCTS` constant

---

## 6. Supabase Schema

**`products` table:**
- `id` (TEXT PK), `title`, `price`, `category`, `image`, `description`, `inventory` (JSONB), `featured` (BOOLEAN), `image_coming_soon` (BOOLEAN)
- `created_at`, `updated_at`

---

## 7. File Reference

| File | Role |
|------|------|
| `context/StoreContext.tsx` | Products state, load/save, CRUD, cart |
| `pages/Admin.tsx` | Store Manager UI, product modal, bulk ops wiring |
| `components/admin/ProductBulkOperations.tsx` | Bulk edit/delete UI |
| `pages/Shop.tsx` | Product grid, category filter |
| `components/ShopifyProduct.tsx` | Product card, add to cart |
| `components/CartDrawer.tsx` | Cart slide-out |
| `pages/Checkout.tsx` | Checkout form and order summary |
| `components/Layout.tsx` | Header, nav, CartDrawer, footer |
| `lib/store-products.ts` | `syncProductsFromConstants` |
| `constants.ts` | `ALL_PRODUCTS`, `FEATURED_PRODUCTS` |

---

## 8. Notable Behaviors

1. **Admin vs retail isolation**: Admin and retail use separate StoreProviders; sync is via Supabase/localStorage only.
2. **Quantity = 0**: `updateQuantity` removes the item when quantity goes to 0.
3. **Accessories size**: Non-apparel uses `"One Size"` instead of a size selector.
4. **Image coming soon**: `imageComingSoon` shows “Coming soon: Lord's Gym merch” instead of image in cards, drawer, checkout.
