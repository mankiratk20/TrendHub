<?php
// Database configuration
$servername = "localhost";  // Usually localhost for local development
$username = "root";         // Default MySQL username in XAMPP/WAMP
$password = "password";             // Your MySQL root password
$dbname = "dbname";    // Your database name

// Create connection without database first
$conn = new mysqli($servername, $username, $password);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Create database if not exists
$sql = "CREATE DATABASE IF NOT EXISTS $dbname";
if ($conn->query($sql) === TRUE) {
    // Database created or already exists
} else {
    die("Error creating database: " . $conn->error);
}

// Select the database
$conn->select_db($dbname);

// Create users table if not exists
$users_table = "CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(15),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)";
if ($conn->query($users_table) !== TRUE) {
    die("Error creating users table: " . $conn->error);
}

// Create orders table if not exists
$orders_table = "CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    order_data TEXT NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    shipping_address TEXT,
    payment_method VARCHAR(50),
    order_status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
)";
if ($conn->query($orders_table) !== TRUE) {
    die("Error creating orders table: " . $conn->error);
}

// Optional: Set charset to utf8
$conn->set_charset("utf8");
?>
