// Enhanced Express.js server with authentication and user management
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// In-memory storage for demo (use a database in production)
let users = [
  {
    id: '1',
    email: 'admin@demo.com',
    password: bcrypt.hashSync('admin123', 10),
    name: 'Admin User',
    role: 'admin',
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    email: 'user@demo.com',
    password: bcrypt.hashSync('demo123', 10),
    name: 'Demo User',
    role: 'user',
    createdAt: new Date().toISOString()
  }
];
let orders = [];
let refunds = [];

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Admin middleware
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }
  next();
};

// Auth Routes
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password, name, role = 'user' } = req.body;

    // Check if user already exists
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = {
      id: Date.now().toString(),
      email,
      password: hashedPassword,
      name,
      role,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);

    // Generate JWT token
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Return user data without password
    const { password: _, ...userWithoutPassword } = newUser;

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating user'
    });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Return user data without password
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error logging in'
    });
  }
});

app.get('/api/auth/verify', authenticateToken, (req, res) => {
  const user = users.find(u => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  const { password: _, ...userWithoutPassword } = user;
  res.json({
    success: true,
    user: userWithoutPassword
  });
});

// Order form submission endpoint
app.post('/api/orders', authenticateToken, upload.single('screenshot'), (req, res) => {
  try {
    const orderData = {
      id: Date.now().toString(),
      orderId: req.body.orderId,
      price: req.body.price,
      date: req.body.date,
      productName: req.body.productName,
      address: req.body.address,
      reviewerName: req.body.reviewerName,
      mediatorName: req.body.mediatorName,
      screenshot: req.file ? req.file.filename : null,
      submittedAt: new Date().toISOString(),
      userId: req.user.id,
      userName: req.body.userName || req.user.name,
      userEmail: req.body.userEmail || req.user.email
    };

    orders.push(orderData);

    console.log('New order received:', orderData);

    res.status(200).json({
      success: true,
      message: 'Order form submitted successfully',
      orderId: orderData.id
    });
  } catch (error) {
    console.error('Error processing order:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing order form'
    });
  }
});

// Refund form submission endpoint
app.post('/api/refunds', authenticateToken, upload.single('screenshot'), (req, res) => {
  try {
    const refundData = {
      id: Date.now().toString(),
      orderId: req.body.orderId,
      refundAmount: req.body.refundAmount,
      reason: req.body.reason,
      productName: req.body.productName,
      originalOrderDate: req.body.originalOrderDate,
      customerName: req.body.customerName,
      mediatorName: req.body.mediatorName,
      screenshot: req.file ? req.file.filename : null,
      submittedAt: new Date().toISOString(),
      status: 'pending',
      userId: req.user.id,
      userName: req.body.userName || req.user.name,
      userEmail: req.body.userEmail || req.user.email
    };

    refunds.push(refundData);

    console.log('New refund request received:', refundData);

    res.status(200).json({
      success: true,
      message: 'Refund request submitted successfully',
      refundId: refundData.id
    });
  } catch (error) {
    console.error('Error processing refund:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing refund request'
    });
  }
});

// User endpoints
app.get('/api/user/orders', authenticateToken, (req, res) => {
  const userOrders = orders.filter(order => order.userId === req.user.id);
  res.json({
    success: true,
    orders: userOrders
  });
});

app.get('/api/user/refunds', authenticateToken, (req, res) => {
  const userRefunds = refunds.filter(refund => refund.userId === req.user.id);
  res.json({
    success: true,
    refunds: userRefunds
  });
});

// Admin endpoints
app.get('/api/admin/users', authenticateToken, requireAdmin, (req, res) => {
  const usersWithoutPasswords = users.map(({ password, ...user }) => user);
  res.json({
    success: true,
    users: usersWithoutPasswords
  });
});

app.get('/api/admin/orders', authenticateToken, requireAdmin, (req, res) => {
  res.json({
    success: true,
    orders: orders
  });
});

app.get('/api/admin/refunds', authenticateToken, requireAdmin, (req, res) => {
  res.json({
    success: true,
    refunds: refunds
  });
});

// Legacy endpoints (for backward compatibility)
app.get('/api/orders', (req, res) => {
  res.json({
    success: true,
    orders: orders
  });
});

app.get('/api/refunds', (req, res) => {
  res.json({
    success: true,
    refunds: refunds
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 10MB.'
      });
    }
  }
  
  console.error('Server error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  console.log('Demo accounts:');
  console.log('Admin: admin@demo.com / admin123');
  console.log('User: user@demo.com / demo123');
});

module.exports = app;