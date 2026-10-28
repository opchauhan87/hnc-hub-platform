const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json({ limit: '15mb' })); // Badi images handle karne ke liye limit badha di hai
app.use(cors());

// MySQL Database Connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'hnc_user',       // Naya user
password: 'hnc123',     // Naya password
  database: 'hnc_hub_db'
});

db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err);
    return;
  }
  console.log('Connected to MySQL Database! 🚀');
});

// --- API ENDPOINTS (DAY 1 & 2 FEATURES) ---

// 1. Get All Ads
app.get('/api/ads', (req, res) => {
  db.query('SELECT * FROM ads ORDER BY id DESC', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// 2. Post New Ad (With 3-Day Expiry & Images)
// Post a new Ad
app.post('/api/ads', (req, res) => {
  const { title, price, category, location, description, seller_name, seller_phone, images } = req.body;
  
  // 3 din baad ki expiry date calculate karte hain
  const expiryTime = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

  const query = `INSERT INTO ads (title, price, category, location, description, seller_name, seller_phone, images, expiry_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  db.query(query, [title, price, category, location, description, seller_name, seller_phone, images, expiryTime], (err, result) => {
    if (err) {
      console.error('Error inserting ad:', err);
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Ad posted successfully!', adId: result.insertId });
  });
});
// 3. User Signup (Mobile + Country Code & Password)
app.post('/api/signup', (req, res) => {
  const { name, email, phone, password, location } = req.body;
  const query = `INSERT INTO users (name, email, phone, password, location) VALUES (?, ?, ?, ?, ?)`;

  db.query(query, [name, email, phone, password, location], (err, result) => {
    if (err) {
      return res.status(400).json({ error: 'User with this mobile number or email already exists!' });
    }
    res.json({ message: 'User registered successfully!' });
  });
});

// 4. User Login
app.post('/api/login', (req, res) => {
  const { phone, password } = req.body;
  const query = `SELECT * FROM users WHERE phone = ? AND password = ?`;

  db.query(query, [phone, password], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) {
      return res.status(401).json({ error: 'Invalid mobile number or password!' });
    }
    res.json({ message: 'Login successful!', user: results[0] });
  });
});

// 5. Submit Offer Price (Buyer negotiating with seller)
app.post('/api/offers', (req, res) => {
  const { ad_id, buyer_phone, buyer_name, offered_price } = req.body;
  const query = `INSERT INTO offers (ad_id, buyer_phone, buyer_name, offered_price) VALUES (?, ?, ?, ?)`;

  db.query(query, [ad_id, buyer_phone, buyer_name, offered_price], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Offer submitted successfully!' });
  });
});
// Get Chat Messages for an Ad
app.get('/api/chats/:ad_id', (req, res) => {
  const { ad_id } = req.params;
  db.query('SELECT * FROM chats WHERE ad_id = ? ORDER BY id ASC', [ad_id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Send Chat Message
app.post('/api/chats', (req, res) => {
  const { ad_id, sender_phone, sender_name, message } = req.body;
  const query = `INSERT INTO chats (ad_id, sender_phone, sender_name, message) VALUES (?, ?, ?, ?)`;

  db.query(query, [ad_id, sender_phone, sender_name, message], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Message sent successfully!' });
  });
});
// Start Server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
