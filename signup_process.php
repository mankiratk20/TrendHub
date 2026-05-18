<?php
include 'config.php'; // Include database connection

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Get form data and sanitize
    $name = isset($_POST['name']) ? trim(mysqli_real_escape_string($conn, $_POST['name'])) : '';
    $email = isset($_POST['email']) ? trim(mysqli_real_escape_string($conn, $_POST['email'])) : '';
    $password = isset($_POST['password']) ? $_POST['password'] : '';
    $phone = isset($_POST['phone']) ? trim(mysqli_real_escape_string($conn, $_POST['phone'])) : '';
    $address = isset($_POST['address']) ? trim(mysqli_real_escape_string($conn, $_POST['address'])) : '';

    // Validation: Check if all fields are filled
    if (empty($name)) {
        echo "Name is required.";
        exit;
    }
    if (empty($email)) {
        echo "Email is required.";
        exit;
    }
    if (empty($password)) {
        echo "Password is required.";
        exit;
    }
    if (empty($phone)) {
        echo "Phone is required.";
        exit;
    }
    if (empty($address)) {
        echo "Address is required.";
        exit;
    }

    // Validation: Check name length
    if (strlen($name) < 3) {
        echo "Name must be at least 3 characters.";
        exit;
    }

    // Validation: Check email format
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo "Invalid email format.";
        exit;
    }

    // Validation: Check password strength (minimum 6 characters)
    if (strlen($password) < 6) {
        echo "Password must be at least 6 characters.";
        exit;
    }

    // Validation: Check phone format (10 digits)
    if (!preg_match('/^[0-9]{10}$/', $phone)) {
        echo "Phone must be a valid 10-digit number.";
        exit;
    }

    // Hash the password for security
    $hashed_password = password_hash($password, PASSWORD_DEFAULT);

    // Check if email already exists
    $check_email = "SELECT id FROM users WHERE email = '$email'";
    $result = $conn->query($check_email);

    if ($result->num_rows > 0) {
        echo "Email already exists. Please use a different email.";
    } else {
        // Insert user data
        $sql = "INSERT INTO users (name, email, password, phone, address, created_at)
                VALUES ('$name', '$email', '$hashed_password', '$phone', '$address', NOW())";

        if ($conn->query($sql) === TRUE) {
            echo "Registration successful! You can now login.";
        } else {
            echo "Error: " . $sql . "<br>" . $conn->error;
        }
    }

    $conn->close();
}
?>