const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Database configuration
const dbConfig = {
  host: 'sql12.freesqldatabase.com',
  user: 'sql12803515',
  password: 'Cg7PuIGG3q', 
  database: 'sql12803515'
};

// Create database connection pool
const pool = mysql.createPool(dbConfig);

// Initialize database
async function initDatabase() {
  try {
    const connection = await pool.getConnection();
    
    // Create table if not exists
    await connection.query(`
      CREATE TABLE IF NOT EXISTS feedbacks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        comment TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    console.log('Database initialized successfully');
    connection.release();
  } catch (err) {
    console.error('Database initialization error:', err);
  }
}

// Routes

// Get all feedbacks
app.get('/api/feedbacks', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM feedbacks ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (err) {
    console.error('Error fetching feedbacks:', err);
    res.status(500).json({ error: 'Failed to fetch feedbacks' });
  }
});

// Create new feedback
app.post('/api/feedbacks', async (req, res) => {
  const { name, comment } = req.body;
  
  if (!name || !comment) {
    return res.status(400).json({ error: 'Name and comment are required' });
  }
  
  try {
    const [result] = await pool.query(
      'INSERT INTO feedbacks (name, comment) VALUES (?, ?)',
      [name, comment]
    );
    
    const [newFeedback] = await pool.query(
      'SELECT * FROM feedbacks WHERE id = ?',
      [result.insertId]
    );
    
    res.status(201).json(newFeedback[0]);
  } catch (err) {
    console.error('Error creating feedback:', err);
    res.status(500).json({ error: 'Failed to create feedback' });
  }
});


// Start server
app.listen(PORT, async () => {
  await initDatabase();
  console.log(`Server running on http://localhost:${PORT}`);
});