# Quick Start Guide - Sweet Bites System

## Prerequisites ✅

- Node.js 16.x or higher
- npm 8 or higher

## Installation & Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Create a `.env.local` file in the root directory:

```
DATABASE_URL=mysql://user:password@localhost:3306/sweetbites
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### 3. Start Development Server

```bash
npm run dev
```

Or use the quick start script:

- **Windows**: `start.bat`
- **Mac/Linux**: `bash start.sh`

### 4. Open in Browser

```
http://localhost:3000
```

## 🌐 Available Routes

### Customer Routes

| Route                 | Description                      |
| --------------------- | -------------------------------- |
| `/`                   | Home page with featured products |
| `/products`           | Full product catalog             |
| `/cart`               | Shopping cart                    |
| `/checkout`           | Checkout & payment               |
| `/orders`             | Order history                    |
| `/order-details/[id]` | Order tracking                   |

### Admin Routes

| Route              | Description                   |
| ------------------ | ----------------------------- |
| `/admin/login`     | Admin login page              |
| `/admin/dashboard` | Main dashboard with analytics |
| `/admin/products`  | Product management            |
| `/admin/orders`    | Order management              |
| `/admin/customers` | Customer directory            |
| `/admin/reports`   | Sales reports                 |
| `/admin/settings`  | Business settings             |

## 🔐 Demo Credentials

**Admin Login:**

- Email: `admin@sweetbites.com`
- Password: `password`

_Note: Implement proper authentication before production_

## 📝 Common Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Format code (if configured)
npm run format
```

## 🗄️ Database Setup

1. Create MySQL database:

   ```sql
   CREATE DATABASE sweetbites;
   ```

2. Import schema:

   ```bash
   mysql -u root -p sweetbites < database/schema.sql
   ```

3. Update `.env.local` with database URL

## 📦 Key Dependencies

- **Next.js 16.2.10** - React framework
- **React 19.2.4** - UI library
- **TypeScript 5** - Type safety
- **Tailwind CSS 4** - Styling
- **Recharts** - Charts & analytics
- **Lucide React** - Icons

## 🎯 Next Steps

1. **Connect Database** - Replace mock data with real database queries
2. **Implement Authentication** - Add JWT-based authentication
3. **Add Validations** - Implement input validation
4. **Payment Integration** - Integrate GCash/Maya APIs
5. **Email Notifications** - Set up order notifications
6. **Testing** - Add unit and integration tests

## 🐛 Troubleshooting

### Port 3000 already in use

```bash
# Use a different port
npm run dev -- -p 3001
```

### Module not found errors

```bash
# Reinstall node_modules
rm -rf node_modules package-lock.json
npm install
```

### Tailwind CSS not working

- Restart dev server: `npm run dev`
- Check `app/globals.css` has `@import "tailwindcss"`

## 📚 Documentation

- See `SYSTEM_DOCUMENTATION.md` for full system documentation
- See `README.md` for project overview
- See `database/schema.sql` for database structure

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel settings
4. Deploy automatically on push

### Deploy to Other Platforms

1. Build the project

   ```bash
   npm run build
   ```

2. Deploy the `.next` folder along with `node_modules` and files

## 💡 Tips

- Use `'use client'` directive for interactive components
- Use TypeScript types for better code quality
- Check `lib/constants.ts` for all constants
- Use `lib/utils.ts` for common functions
- Tailwind CSS is fully configured - use utility classes

## ❓ Need Help?

1. Check `SYSTEM_DOCUMENTATION.md` for detailed information
2. Review component examples in `components/` folder
3. Check API route examples in `app/api/` folder
4. Refer to Next.js documentation: https://nextjs.org/docs

---

Happy coding! 🎉
