<?php
session_set_cookie_params([
    'lifetime' => 86400,
    'path' => '/',
    'domain' => 'localhost',
    'secure' => false,
    'httponly' => true
]);
session_start();
include 'config.php';


// Debug logging
error_log("Order processing started");
error_log("User ID: " . (isset($_SESSION['u_id']) ? $_SESSION['u_id'] : "NOT SET"));
if (!isset($_SESSION['u_id'])) {
    $_SESSION['u_id'] = 1; // temporary fix for demo
}

//Check if user is logged in
// Temporarily allow orders without login for demo
if (!isset($_SESSION['u_id'])) {
    $_SESSION['u_id'] = 1; // temporary fix for demo
}

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Get POST data
    $u_id = $_SESSION['u_id'];
    $cart_data = isset($_POST['cart_data']) ? $_POST['cart_data'] : '';
    $total_amount = isset($_POST['total_amount']) ? floatval($_POST['total_amount']) : 0;
    $shipping_address = isset($_POST['shipping_address']) ? $_POST['shipping_address'] : '';
    $payment_method = isset($_POST['payment_method']) ? $_POST['payment_method'] : '';

    // Validate data
    if (empty($cart_data) || $cart_data === "[]") {
        http_response_code(400);
        echo "Error: Cart is empty.";
        error_log("Error: Cart is empty");
        exit;
    }

    if ($total_amount <= 0) {
        http_response_code(400);
        echo "Error: Invalid order amount.";
        error_log("Error: Invalid amount: $total_amount");
        exit;
    }

    if (empty($shipping_address)) {
        http_response_code(400);
        echo "Error: Shipping address is required.";
        error_log("Error: Shipping address missing");
        exit;
    }

    if (empty($payment_method)) {
        http_response_code(400);
        echo "Error: Payment method is required.";
        error_log("Error: Payment method missing");
        exit;
    }

    // Sanitize data
    $cart_data = mysqli_real_escape_string($conn, $cart_data);
    $shipping_address = mysqli_real_escape_string($conn, $shipping_address);
    $payment_method = mysqli_real_escape_string($conn, $payment_method);

    error_log("Inserting order for user: $u_id, amount: $total_amount, method: $payment_method");

    // Insert order into database
    $sql = "INSERT INTO orders (u_id, order_data, total_amount, shipping_address, payment_method, order_status)
            VALUES ('$u_id', '$cart_data', '$total_amount', '$shipping_address', '$payment_method', 'confirmed')";

    error_log("SQL Query: $sql");

    if ($conn->query($sql) === TRUE) {
        $o_id = $conn->insert_id;
        http_response_code(200);
        echo "Order placed successfully! Order ID: " . $o_id;
        error_log("Order created successfully. Order ID: $o_id");
    } else {
        http_response_code(500);
        echo "Error: " . $conn->error;
        error_log("Database error: " . $conn->error);
    }

    $conn->close();
} else {
    http_response_code(405);
    echo "Error: Invalid request method.";
}
?>
