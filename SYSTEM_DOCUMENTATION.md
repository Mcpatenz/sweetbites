# 🍰 Sweet Bites - Online Food Ordering System

A complete, modern food ordering and management system built with **Next.js 16**, **React 19**, **TypeScript**, and **Tailwind CSS**. This system is designed for restaurants, bakeries, and food businesses to manage their online orders, inventory, customers, and sales.

## ✨ Features

### 🏪 Customer Features

- **Home Page** - Featured products, best sellers, and category browsing
- **Product Catalog** - Browse products by category with search and filtering
- **Shopping Cart** - Add/remove items, adjust quantities, view totals
- **Checkout** - Customer information, delivery options, payment methods
- **Payment Methods** - Cash on Delivery, GCash, Maya with receipt upload
- **Order Tracking** - Real-time status tracking (Pending → Confirmed → Preparing → Out for Delivery → Delivered)
- **Order History** - View past orders and receipts
- **Responsive Design** - Mobile, tablet, and desktop support

### 👨‍💼 Admin Dashboard Features

- **Dashboard** - Sales overview, orders count, inventory status
- **Sales Analytics** - Daily, weekly, monthly sales charts
- **Product Management** - Add, edit, delete, archive products
- **Order Management** - View all orders, update status, manage payments
- **Customer Management** - View customer details and order history
- **Reports** - Sales reports, best sellers, revenue analytics (Export to PDF/Excel)
- **Inventory** - Stock monitoring, low stock alerts
- **Settings** - Business information, payment details, social media links
- **Payment Verification** - Approve/reject GCash and Maya payments

## 🛠️ Tech Stack

- **Frontend Framework** - Next.js 16.2.10
- **UI Library** - React 19.2.4
- **Language** - TypeScript 5
- **Styling** - Tailwind CSS 4 with PostCSS
- **Charts** - Recharts
- **Icons** - Lucide React
- **Environment** - Node.js + npm

## 📁 Project Structure

```
sweetbites/
├── app/
│   ├── api/                    # API routes for backend logic
│   │   ├── products/           # Product API endpoints
│   │   ├── orders/             # Order API endpoints
│   │   ├── cart/               # Cart API endpoints
│   │   ├── auth/               # Authentication endpoints
│   │   └── categories/         # Categories API endpoints
│   ├── (customer)/             # Customer pages group
│   │   ├── page.tsx            # Home page
│   │   ├── products/           # Products listing
│   │   ├── cart/               # Shopping cart
│   │   ├── checkout/           # Checkout page
│   │   ├── orders/             # My orders page
│   │   ├── order-details/[id]/ # Order details page
│   │   └── layout.tsx          # Customer layout
│   ├── (admin)/                # Admin pages group
│   │   ├── login/              # Admin login
│   │   ├── dashboard/          # Dashboard with analytics
│   │   ├── products/           # Product management
│   │   ├── orders/             # Order management
│   │   ├── customers/          # Customer management
│   │   ├── reports/            # Reports and analytics
│   │   ├── settings/           # Business settings
│   │   └── layout.tsx          # Admin layout
│   ├── globals.css             # Global styles
│   └── layout.tsx              # Root layout
├── components/
│   ├── Navbar.tsx              # Navigation bar
│   ├── Footer.tsx              # Footer
│   ├── ProductCard.tsx         # Product card component
│   ├── Cart/
│   │   ├── CartItem.tsx        # Cart item component
│   │   └── CartSummary.tsx     # Cart summary
│   └── Admin/
│       ├── Sidebar.tsx         # Admin sidebar
│       ├── StatCard.tsx        # Statistics card
│       └── OrderTable.tsx      # Orders table
├── lib/
│   ├── types.ts                # TypeScript type definitions
│   ├── constants.ts            # Constants and enums
│   └── utils.ts                # Utility functions
├── public/
│   ├── products/               # Product images storage
│   └── receipts/               # Payment receipt storage
├── database/
│   └── schema.sql              # MySQL database schema
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.ts
```

## 🚀 Getting Started

### Prerequisites

- Node.js 16.x or higher
- npm or yarn
- MySQL (for database, optional for development)

### Installation

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Set up environment variables** (create `.env.local`)

   ```
   DATABASE_URL=your_mysql_connection_string
   NEXT_PUBLIC_API_URL=http://localhost:3000
   ```

3. **Run development server**

   ```bash
   npm run dev
   ```

4. **Open in browser**
   ```
   http://localhost:3000
   ```

## 📚 Key Features Explained

### Customer Flow

1. Customer visits home page → Browses products
2. Filters by category and searches for items
3. Adds items to cart
4. Proceeds to checkout
5. Fills in delivery information
6. Selects delivery type (Pickup/Delivery)
7. Chooses payment method
8. For GCash/Maya: Uploads payment receipt
9. Places order and receives confirmation
10. Tracks order status in real-time

### Admin Flow

1. Admin logs in with credentials
2. Views dashboard with sales analytics
3. Manages products (CRUD operations)
4. Views and updates order status
5. Verifies payments for digital methods
6. Monitors inventory and stock levels
7. Generates sales reports
8. Configures business settings

## 🗄️ Database Schema

The system uses MySQL with the following main tables:

- **users** - Admin staff credentials
- **customers** - Customer information
- **products** - Product catalog
- **categories** - Product categories
- **orders** - Customer orders
- **order_items** - Individual items in orders
- **payments** - Payment records
- **promos** - Discount codes and promotions
- **business_settings** - Business configuration

See `database/schema.sql` for complete schema.

## 💳 Payment Methods

### Cash on Delivery

- No upfront payment required
- Customer pays upon delivery

### GCash / Maya

- Customer sends payment via mobile app
- Uploads payment receipt
- Admin verifies payment receipt
- Order confirmed after verification

## 📊 Admin Dashboard Metrics

- **Today's Sales** - Total sales for current day
- **Today's Orders** - Number of orders received
- **Total Products** - Available products in catalog
- **Pending Orders** - Orders awaiting processing
- **Daily Sales Chart** - Visual representation of sales trends
- **Best Sellers** - Top performing products
- **Customer Statistics** - Total customers and order metrics

## 🎨 UI Components

All components are built with Tailwind CSS and feature:

- Responsive design (mobile-first)
- Consistent color scheme (Pink/Gray theme)
- Accessibility best practices
- Smooth transitions and hover effects
- Icon integration with Lucide React

## 🔐 Security Considerations

For production deployment, implement:

- JWT authentication for sessions
- Password hashing (bcrypt)
- HTTPS/SSL encryption
- Rate limiting on API endpoints
- Input validation and sanitization
- CORS configuration
- Database query parameterization

## 📱 Responsive Breakpoints

- **Mobile**: < 640px
- **Tablet**: 641px - 1024px
- **Desktop**: > 1024px

## 🌐 API Endpoints

### Products

- `GET /api/products` - Get all products
- `GET /api/products/[id]` - Get product by ID
- `POST /api/products` - Create product
- `PUT /api/products/[id]` - Update product
- `DELETE /api/products/[id]` - Delete product

### Orders

- `GET /api/orders` - Get all orders
- `GET /api/orders/[id]` - Get order by ID
- `POST /api/orders` - Create order

### Categories

- `GET /api/categories` - Get all categories

_Note: API routes are partially implemented. Full backend implementation requires database connection._

## 📝 Constants

Key constants are defined in `lib/constants.ts`:

- Categories: Cakes, Cupcakes, Cheesecakes, Cookies, Desserts, Drinks, Snacks, Meals
- Order Statuses: Pending, Confirmed, Preparing, Out for Delivery, Delivered, Cancelled
- Delivery Types: Pickup, Delivery
- Delivery Fee: ₱50

## 🎯 Future Enhancements

- [ ] Email notifications for orders
- [ ] SMS notifications
- [ ] Push notifications
- [ ] Loyalty points system
- [ ] Customer ratings and reviews
- [ ] Product recommendations (AI)
- [ ] Delivery rider management
- [ ] Live chat support
- [ ] Multi-language support
- [ ] Dark mode toggle
- [ ] Advanced filtering and sorting
- [ ] Wishlist/Favorites feature
- [ ] Subscription/Recurring orders
- [ ] Inventory automation

## 🐛 Troubleshooting

**Issue: Chart not displaying in admin dashboard**

- Ensure `recharts` is installed: `npm install recharts`
- Check that the component is wrapped with `'use client'`

**Issue: Images not loading**

- Place images in `/public` directory
- Use Next.js `Image` component for optimization

**Issue: Styles not applying**

- Verify Tailwind CSS is properly configured
- Check `globals.css` imports `@import "tailwindcss"`
- Restart dev server after changes

## 📄 License

This project is open source and available under the MIT License.

## 👨‍💻 Development Notes

- All type definitions are in `lib/types.ts`
- Utility functions in `lib/utils.ts` handle formatting and calculations
- Components use TypeScript for type safety
- API routes follow REST conventions
- Mock data is used for development; replace with real database calls

## 🚢 Deployment

To deploy on Vercel:

```bash
npm run build
# Push to GitHub and connect to Vercel
```

For other platforms, ensure Node.js 16+ is available and set:

```bash
npm run build
npm start
```

---

Built with ❤️ for Sweet Bites Bakery
