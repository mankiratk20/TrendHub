<?php
session_set_cookie_params([
    'lifetime' => 86400,
    'path' => '/',
    'domain' => '',
    'secure' => false,
    'httponly' => true
]);
session_start();
include 'config.php'; // Include database connection

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Get form data and sanitize
    $email = isset($_POST['email']) ? trim(mysqli_real_escape_string($conn, $_POST['email'])) : '';
    $password = isset($_POST['password']) ? $_POST['password'] : '';

    // Validation: Check if email is empty
    if (empty($email)) {
        echo "Email is required.";
        exit;
    }

    // Validation: Check if password is empty
    if (empty($password)) {
        echo "Password is required.";
        exit;
    }

    // Validation: Check if email is valid format
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo "Invalid email format.";
        exit;
    }

    // Validation: Check if password is at least 6 characters
    if (strlen($password) < 6) {
        echo "Password must be at least 6 characters.";
        exit;
    }

    // Check if user exists
    $sql = "SELECT id, name, email, password FROM users WHERE email = '$email'";
    $result = $conn->query($sql);

    if ($result->num_rows == 1) {
        $user = $result->fetch_assoc();

        // Verify password
        if (password_verify($password, $user['password'])) {
            // Password is correct, create session
            $_SESSION['u_id'] = $user['id'];
            $_SESSION['name'] = $user['name'];
            $_SESSION['email'] = $user['email'];
            echo "Login successful! Welcome back, " . $user['name'] . ".";
           
        } else {
            echo "Invalid password.";
        }
    } else {
        echo "No account found with this email address.";
    }
    

    $conn->close();
}
?>