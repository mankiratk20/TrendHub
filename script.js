/* ==========================================================
   script.js — TrendHub Frontend Logic
   Handles: Signup, Login, Logout, Cart, Page Navigation
   Storage: localStorage only (no backend required)
   ========================================================== */


/* ----------------------------------------------------------
   SECTION 1 — HELPER UTILITIES
   ---------------------------------------------------------- */

/* Check if an email address looks valid */
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/* Check if a phone number is exactly 10 digits */
function isValidPhone(phone) {
  return /^[0-9]{10}$/.test(phone);
}

/* Show a red error message below an input field */
function showError(inputId, errorId, message) {
  var input = document.getElementById(inputId);
  var error = document.getElementById(errorId);
  if (input)  input.classList.add("invalid");
  if (error) {
    error.textContent = message;
    error.classList.add("show");
  }
}

/* Remove all error highlights from the form */
function clearErrors() {
  var inputs = document.querySelectorAll("input, textarea");
  var errors = document.querySelectorAll(".error-msg");
  for (var i = 0; i < inputs.length; i++) {
    inputs[i].classList.remove("invalid");
  }
  for (var j = 0; j < errors.length; j++) {
    errors[j].classList.remove("show");
    errors[j].textContent = "";
  }
}

/* Show a short toast notification at the bottom of the screen */
function showToast(message, type) {
  var toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = message;
  toast.className = "toast " + (type || "");
  toast.classList.add("show");
  setTimeout(function () {
    toast.classList.remove("show");
  }, 3000);
}

/* Toggle password field between visible and hidden */
function togglePw(inputId, btn) {
  var input = document.getElementById(inputId);
  if (!input) return;
  if (input.type === "password") {
    input.type = "text";
    btn.textContent = "🙈";
  } else {
    input.type = "password";
    btn.textContent = "👁️";
  }
}


/* ----------------------------------------------------------
   SECTION 2 — USER STORAGE HELPERS
   localStorage key: "trendhub_users"  → array of user objects
   Each user: { name, email, password, phone, address }
   ---------------------------------------------------------- */

/* Get the full list of registered users from localStorage */
function getUsers() {
  var data = localStorage.getItem("trendhub_users");
  if (data) {
    return JSON.parse(data);   // parse the JSON string back into an array
  }
  return [];                   // return empty array if no users yet
}

/* Save the updated users array back to localStorage */
function saveUsers(users) {
  localStorage.setItem("trendhub_users", JSON.stringify(users));
}

/* Find a user by their email address */
function findUserByEmail(email) {
  var users = getUsers();
  for (var i = 0; i < users.length; i++) {
    if (users[i].email === email) {
      return users[i];
    }
  }
  return null; // not found
}


/* ----------------------------------------------------------
   SECTION 3 — SIGNUP FORM HANDLING
   Validates all fields, saves user, redirects to login.html
   ---------------------------------------------------------- */

function handleSignup(event) {
  event.preventDefault(); // stop the form from reloading the page
  clearErrors();

  /* Read field values */
  var name     = document.getElementById("name").value.trim();
  var email    = document.getElementById("email").value.trim();
  var password = document.getElementById("password").value;
  var phone    = document.getElementById("phone").value.trim();
  var address  = document.getElementById("address").value.trim();

  var valid = true;

  /* Validate: Name must not be empty */
  if (!name) {
    showError("name", "err-name", "Name is required.");
    valid = false;
  }

  /* Validate: Email must be a proper format */
  if (!email || !isValidEmail(email)) {
    showError("email", "err-email", "Please enter a valid email address.");
    valid = false;
  }

  /* Validate: Password must be at least 6 characters */
  if (!password || password.length < 6) {
    showError("password", "err-password", "Password must be at least 6 characters.");
    valid = false;
  }

  /* Validate: Phone must be exactly 10 digits */
  if (!phone || !isValidPhone(phone)) {
    showError("phone", "err-phone", "Enter a valid 10-digit phone number.");
    valid = false;
  }

  /* Validate: Address must not be empty */
  if (!address) {
    showError("address", "err-address", "Address is required.");
    valid = false;
  }

  /* Stop here if any validation failed */
  if (!valid) {
    showToast("⚠️ Please fix the errors above.", "error");
    return;
  }

  /* Submit form data to PHP via AJAX */
  var xhr = new XMLHttpRequest();
  xhr.open("POST", "signup_process.php", true);
  xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

  xhr.onreadystatechange = function() {
    console.log("ReadyState:", xhr.readyState, "Status:", xhr.status);
    if (xhr.readyState === 4) {
      console.log("Final Status:", xhr.status, "Response:", xhr.responseText);
      if (xhr.status === 200) {
        var response = xhr.responseText.trim();
        if (response.includes("Registration successful")) {
          showToast("🎉 " + response, "success");
          setTimeout(function () {
            window.location.href = "login.html";
          }, 1500);
        } else {
          showToast("❌ " + response, "error");
        }
      } else {
        showToast("❌ Error submitting form. Status: " + xhr.status + " - " + xhr.statusText, "error");
        console.log("AJAX Error Details:", {
          status: xhr.status,
          statusText: xhr.statusText,
          responseText: xhr.responseText,
          readyState: xhr.readyState
        });
      }
    }
  };

  xhr.onerror = function() {
    console.log("Network Error occurred");
    showToast("❌ Network error - check if you're accessing via http://localhost", "error");
  };

  xhr.ontimeout = function() {
    console.log("Request timed out");
    showToast("❌ Request timed out", "error");
  };

  var data = "name=" + encodeURIComponent(name) +
             "&email=" + encodeURIComponent(email) +
             "&password=" + encodeURIComponent(password) +
             "&phone=" + encodeURIComponent(phone) +
             "&address=" + encodeURIComponent(address);

  console.log("Sending data:", data);
  xhr.send(data);
}


/* ----------------------------------------------------------
   SECTION 4 — LOGIN FORM HANDLING
   Validates fields, checks credentials, redirects to index.html
   ---------------------------------------------------------- */
   function updateNavbar() {
    var isLoggedIn = localStorage.getItem("user_logged_in");
    var loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
    var loginBtn = document.getElementById("nav-login-btn");
    var userSpan = document.getElementById("nav-user");
    var usernameText = document.getElementById("nav-user");

    if (isLoggedIn === "true" && loggedInUser && loggedInUser.name) {
        if (loginBtn) loginBtn.style.display = "none";
        if (userSpan) userSpan.style.display = "inline";
        if (usernameText) usernameText.textContent = loggedInUser.name;
    } else {
        if (loginBtn) loginBtn.style.display = "inline";
        if (userSpan) userSpan.style.display = "none";
    }
}

function handleLogout() {
    localStorage.removeItem("user_logged_in");
    localStorage.removeItem("loggedInUser");
    window.location.href = "http://localhost/php1/myProjects/login.html";
}

function handleLogin(event) {
  event.preventDefault(); // stop page reload
  clearErrors();

  /* Read field values */
  var email    = document.getElementById("email").value.trim();
  var password = document.getElementById("password").value;

  var valid = true;

  /* Validate: Email format */
  if (!email || !isValidEmail(email)) {
    showError("email", "err-email", "Please enter a valid email address.");
    valid = false;
  }

  /* Validate: Password not empty */
  if (!password || password.length < 6) {
    showError("password", "err-password", "Password must be at least 6 characters.");
    valid = false;
  }

  if (!valid) {
    showToast("⚠️ Please fix the errors above.", "error");
    return;
  }

  /* Submit login data to PHP via AJAX */
  var xhr = new XMLHttpRequest();
  xhr.open("POST", "login_process.php", true);
  xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

  xhr.onreadystatechange = function() {
    console.log("Login ReadyState:", xhr.readyState, "Status:", xhr.status);
    if (xhr.readyState === 4) {
      console.log("Login Final Status:", xhr.status, "Response:", xhr.responseText);
      if (xhr.status === 200) {
        var response = xhr.responseText.trim();
       if (response.includes("Login successful")) {
    var parts = response.split("Welcome back, ");
var name = parts.length > 1 ? parts[1].replace(".", "").trim() : "";
var userObj = { name: name };
localStorage.setItem("loggedInUser", JSON.stringify(userObj));
    showToast("✓ " + response, "success");
    setTimeout(function() {
        window.location.href = "http://localhost/php1/myProjects/trendhub.html";
    }, 1200);
} else {
          showToast("❌ " + response, "error");
        }
      } else {
        showToast("❌ Error submitting form. Status: " + xhr.status + " - " + xhr.statusText, "error");
        console.log("Login AJAX Error Details:", {
          status: xhr.status,
          statusText: xhr.statusText,
          responseText: xhr.responseText,
          readyState: xhr.readyState
        });
      }
    }
  };

  xhr.onerror = function() {
    console.log("Login Network Error occurred");
    showToast("❌ Network error - check if you're accessing via http://localhost", "error");
  };

  xhr.ontimeout = function() {
    console.log("Login Request timed out");
    showToast("❌ Request timed out", "error");
  };

  var data = "email=" + encodeURIComponent(email) +
             "&password=" + encodeURIComponent(password);

  console.log("Sending login data:", data);
  xhr.send(data);
}


/* ----------------------------------------------------------
   SECTION 5 — LOGOUT
   Clears the logged-in session and returns to login page
   ---------------------------------------------------------- */

function logout() {
  localStorage.removeItem("loggedInUser"); // clear the session
  showToast("👋 Logged out. See you soon!", "success");
  setTimeout(function () {
    window.location.href = "login.html";
  }, 1000);
}


/* ----------------------------------------------------------
   SECTION 6 — LOGGED-IN USER HELPERS
   ---------------------------------------------------------- */

/* Get the currently logged-in user object (or null if not logged in) */
function getLoggedInUser() {
  var data = localStorage.getItem("loggedInUser");
  if (data) return JSON.parse(data);
  return null;
}

/* If NO user is logged in, redirect to login page */
function requireLogin() {
  if (!getLoggedInUser()) {
    window.location.href = "login.html";
  }
}

/* Update the navbar to show the user's name and a logout button */
function updateNavbar() {
  var user        = getLoggedInUser();
  var userDisplay = document.getElementById("nav-user");  // optional element
  var logoutBtn   = document.getElementById("nav-logout"); // optional element

  if (user && userDisplay) {
    userDisplay.textContent = "Hi, " + user.name + " 👋";
  }
  if (user && logoutBtn) {
    logoutBtn.style.display = "inline-block";
  }
}


/* ----------------------------------------------------------
   SECTION 7 — CART SYSTEM
   localStorage key: "trendhub_cart" → array of cart items
   Each item: { name, price, qty }
   ---------------------------------------------------------- */

/* Get the current cart array from localStorage */
function getCart() {
  var data = localStorage.getItem("trendhub_cart");
  if (data) return JSON.parse(data);
  return [];
}

/* Save the cart array back to localStorage */
function saveCart(cart) {
  localStorage.setItem("trendhub_cart", JSON.stringify(cart));
}

/* Add a product to the cart (or increase qty if already there) */
function addToCart(productName, price) {
  var cart  = getCart();
  var found = false;

  /* Check if the product already exists in the cart */
  for (var i = 0; i < cart.length; i++) {
    if (cart[i].name === productName) {
      cart[i].qty = cart[i].qty + 1; // increase quantity
      found = true;
      break;
    }
  }

  /* If not found, add a new item */
  if (!found) {
    cart.push({ name: productName, price: price, qty: 1 });
  }

  saveCart(cart);
  updateCartCount(); // refresh the navbar badge
  showToast("🛒 " + productName + " added to cart!", "success");
}

/* Remove an item from the cart by its index in the array */
function removeFromCart(index) {
  var cart = getCart();
  cart.splice(index, 1); // remove 1 item at the given index
  saveCart(cart);
  displayCart();         // refresh the cart display
  updateCartCount();     // refresh the navbar badge
  showToast("🗑 Item removed from cart.", "");
}

/* Update the cart item count shown in the navbar */
function updateCartCount() {
  var cart      = getCart();
  var countEl   = document.getElementById("nav-cart-count");
  var totalItems = 0;

  for (var i = 0; i < cart.length; i++) {
    totalItems = totalItems + cart[i].qty;
  }

  if (countEl) {
    countEl.textContent = totalItems;
  }

  /* Also update any cart badge text like "Cart (3)" */
  var cartBadge = document.getElementById("nav-count");
  if (cartBadge) {
    cartBadge.textContent = "🛒 Cart (" + totalItems + ")";
  }
}

/* Render the cart items into a container on the cart page */
function displayCart() {
  var cart      = getCart();
  var container = document.getElementById("cart-list");
  var emptyMsg  = document.getElementById("cart-empty");
  var summary   = document.getElementById("cart-summary");

  /* If the cart container doesn't exist on this page, do nothing */
  if (!container) return;

  /* Empty cart state */
  if (cart.length === 0) {
    container.style.display = "none";
    if (emptyMsg) emptyMsg.style.display = "block";
    if (summary)  summary.style.display  = "none";
    return;
  }

  /* Show cart items, hide empty state */
  container.style.display = "flex";
  if (emptyMsg) emptyMsg.style.display = "none";
  if (summary)  summary.style.display  = "block";

  /* Build the HTML list of cart items */
  var html     = "";
  var subtotal = 0;

  for (var i = 0; i < cart.length; i++) {
    var item      = cart[i];
    var itemTotal = item.price * item.qty;
    subtotal      = subtotal + itemTotal;

    html += '<li class="cart-item">';
    html +=   '<div class="item-info">';
    html +=     '<div class="item-name">'  + item.name + '</div>';
    html +=     '<div class="item-price">₹' + itemTotal.toLocaleString() + ' (x' + item.qty + ')</div>';
    html +=   '</div>';
    html +=   '<button class="qty-btn" onclick="removeFromCart(' + i + ')">✕</button>';
    html += '</li>';
  }

  container.innerHTML = html;

  /* Update totals */
  var shipping  = subtotal >= 999 ? 0 : 99;
  var grandTotal = subtotal + shipping;

  var subtotalEl  = document.getElementById("subtotal");
  var shippingEl  = document.getElementById("shipping");
  var grandTotalEl = document.getElementById("grand-total");

  if (subtotalEl)   subtotalEl.textContent  = "₹" + subtotal.toLocaleString();
  if (shippingEl)   shippingEl.textContent  = shipping === 0 ? "FREE 🎉" : "₹" + shipping;
  if (grandTotalEl) grandTotalEl.textContent = "₹" + grandTotal.toLocaleString();
}

/* Clear all items from the cart */
function clearCart() {
  localStorage.removeItem("trendhub_cart");
  displayCart();
  updateCartCount();
  showToast("🗑 Cart cleared!", "");
}

/* Simulate a checkout action */
function checkout() {
  window.location.href = "http://localhost/php1/myProjects/checkout.html"; // go to checkout page
  showToast("🎉 Order placed! Thank you for shopping with TrendHub!", "success");
 
}


/* ----------------------------------------------------------
   SECTION 8 — PAGE NAVIGATION HELPERS
   Simple wrappers around window.location.href
   ---------------------------------------------------------- */

/* Go to the login page */
function goToLogin() {
  window.location.href = "http://localhost/php1/myProjects/login.html";
}

/* Go to the signup page */
function goToSignup() {
  window.location.href = "http://localhost/php1/myProjects/signup.html";
}

/* Go to the homepage */
function goToHome() {
  window.location.href = "http://localhost/php1/myProjects/trendhub.html";
}


/* ----------------------------------------------------------
   SECTION 9 — AUTO-INIT ON PAGE LOAD
   Runs the right setup code depending on which page is open
   ---------------------------------------------------------- */

window.addEventListener("load", function () {

  /* ── SIGNUP PAGE ── */
  var signupForm = document.getElementById("signup-form");
  if (signupForm) {
    signupForm.addEventListener("submit", handleSignup);

    /* Auto-strip non-digit characters from phone field */
    var phoneInput = document.getElementById("phone");
    if (phoneInput) {
      phoneInput.addEventListener("input", function () {
        this.value = this.value.replace(/[^0-9]/g, "");
      });
    }
  }

  /* ── LOGIN PAGE ── */
 var loginForm = document.getElementById("login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", handleLogin);
    updateNavbar(); // show user name + logout if already logged in
  }

  /* ── HOMEPAGE (index.html) ── */
  if (document.getElementById("product-grid")) {
    requireLogin();   // bounce to login if not logged in
    updateNavbar();   // show user name + logout button
    updateCartCount(); // show correct cart count
  }

  /* ── CART PAGE ── */
  if (document.getElementById("cart-list")) {
    requireLogin();
    updateNavbar();
    displayCart();
    updateCartCount();
  }

  /* Always update cart count on every page that has a navbar badge */
  updateNavbar();
  updateCartCount();
});


