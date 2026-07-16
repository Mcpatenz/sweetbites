-- Sweet Bites Database Schema

-- Users Table (Admin, Staff, Cashier)
CREATE TABLE users (
  id VARCHAR(255) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'staff', 'cashier', 'customer') DEFAULT 'customer',
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Categories Table
CREATE TABLE categories (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products Table
CREATE TABLE products (
  id VARCHAR(255) PRIMARY KEY,
  category_id VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  stock INT DEFAULT 0,
  image VARCHAR(255),
  rating DECIMAL(3, 2),
  reviews INT DEFAULT 0,
  archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- Customers Table
CREATE TABLE customers (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20) NOT NULL,
  address TEXT NOT NULL,
  landmark VARCHAR(255),
  total_orders INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders Table
CREATE TABLE orders (
  id VARCHAR(255) PRIMARY KEY,
  customer_id VARCHAR(255) NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  delivery_fee DECIMAL(10, 2) DEFAULT 50,
  total DECIMAL(10, 2) NOT NULL,
  status ENUM('Pending', 'Confirmed', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled') DEFAULT 'Pending',
  payment_method ENUM('Cash on Delivery', 'GCash', 'Maya') NOT NULL,
  payment_status ENUM('Pending', 'Verified', 'Rejected') DEFAULT 'Pending',
  delivery_type ENUM('Pickup', 'Delivery') DEFAULT 'Delivery',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id)
);

-- Order Items Table
CREATE TABLE order_items (
  id VARCHAR(255) PRIMARY KEY,
  order_id VARCHAR(255) NOT NULL,
  product_id VARCHAR(255) NOT NULL,
  quantity INT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Payments Table
CREATE TABLE payments (
  id VARCHAR(255) PRIMARY KEY,
  order_id VARCHAR(255) NOT NULL UNIQUE,
  method ENUM('Cash on Delivery', 'GCash', 'Maya') NOT NULL,
  receipt VARCHAR(255),
  reference_number VARCHAR(255),
  amount DECIMAL(10, 2) NOT NULL,
  status ENUM('Pending', 'Verified', 'Rejected') DEFAULT 'Pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id)
);

-- Promos Table
CREATE TABLE promos (
  id VARCHAR(255) PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  discount DECIMAL(10, 2) NOT NULL,
  discount_type ENUM('fixed', 'percentage') DEFAULT 'percentage',
  expiry_date DATETIME NOT NULL,
  max_uses INT,
  current_uses INT DEFAULT 0,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Business Settings Table
CREATE TABLE business_settings (
  id INT PRIMARY KEY DEFAULT 1,
  business_name VARCHAR(255),
  logo VARCHAR(255),
  contact_number VARCHAR(20),
  facebook VARCHAR(255),
  instagram VARCHAR(255),
  address TEXT,
  gcash_qr VARCHAR(255),
  maya_qr VARCHAR(255),
  bank_account VARCHAR(255),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert Default Categories
INSERT INTO categories (id, name, description) VALUES
('cat-1', 'Cakes', 'Delicious homemade cakes'),
('cat-2', 'Cupcakes', 'Fresh baked cupcakes'),
('cat-3', 'Cheesecakes', 'Creamy cheesecakes'),
('cat-4', 'Cookies', 'Homemade cookies'),
('cat-5', 'Desserts', 'Various desserts'),
('cat-6', 'Drinks', 'Beverages'),
('cat-7', 'Snacks', 'Light snacks'),
('cat-8', 'Meals', 'Full meals');

-- Insert Sample Products
INSERT INTO products (id, category_id, name, description, price, stock, image, archived) VALUES
('prod-1', 'cat-1', 'Chocolate Moist Cake', 'Rich and moist chocolate cake, perfect for celebrations', 350, 10, '/products/08260f21-ae52-414a-8698-8fa16bd59362.jpg', FALSE),
('prod-2', 'cat-2', 'Strawberry Cupcakes', 'Fresh strawberry cupcakes with cream cheese frosting', 180, 15, '/products/558af3e8-3a45-4456-97de-bc65e1b10313.jpg', FALSE),
('prod-3', 'cat-3', 'Cheesecake Slice', 'Creamy New York style cheesecake', 200, 8, '/products/7a1571e3-28e5-4d39-90ca-a63a8721d32f.jpg', FALSE),
('prod-4', 'cat-6', 'Iced Coffee', 'Cold brew coffee with vanilla syrup', 120, 3, '/products/bb1a354b-1c96-4075-a846-ddaaf2703af4.jpg', FALSE),
('prod-5', 'cat-4', 'Chocolate Chip Cookies', 'Homemade chocolate chip cookies', 80, 25, '/products/d02f46b3-ea3d-4fbe-a362-cad97452b013.jpg', FALSE),
('prod-6', 'cat-7', 'Banana Bread', 'Moist and delicious banana bread', 150, 12, '/products/ef012d2f-85c4-4ad2-a32c-809a56574efa.jpg', FALSE);

-- Insert Default Business Settings
INSERT INTO business_settings (id, business_name, contact_number, address) VALUES
(1, 'Sweet Bites Bakery', '+63 912 345 6789', '123 Main Street, City, Province');
