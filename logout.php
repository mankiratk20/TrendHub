<?php
session_start();

// Unset all session variables
$_SESSION = [];

// Destroy session
session_destroy();

header("Location: trendhub.html");
exit();
?>