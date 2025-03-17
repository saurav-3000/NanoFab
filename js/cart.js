// Cart and order related functions

// Initialize cart in localStorage if it doesn't exist
function initCart() {
    if (!localStorage.getItem("cart")) {
      localStorage.setItem("cart", JSON.stringify([]))
    }
  }
  
  // Get cart items
  function getCart() {
    return JSON.parse(localStorage.getItem("cart") || "[]")
  }
  
  // Mock getProduct function (replace with actual implementation)
  async function getProduct(productId) {
    // In a real application, this would fetch product data from an API
    // For this example, we'll return a mock product
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockProducts = {
          1: { product_id: "1", name: "Product 1", price: 10, image: "product1.jpg" },
          2: { product_id: "2", name: "Product 2", price: 20, image: "product2.jpg" },
          3: { product_id: "3", name: "Product 3", price: 30, image: "product3.jpg" },
        }
        resolve(
          mockProducts[productId] || { product_id: productId, name: "Unknown Product", price: 0, image: "unknown.jpg" },
        )
      }, 50) // Simulate network latency
    })
  }
  
  // Mock isLoggedIn function (replace with actual implementation)
  function isLoggedIn() {
    // In a real application, this would check if the user is logged in based on session or token
    // For this example, we'll just return true
    return localStorage.getItem("token") !== null
  }
  
  // Add item to cart
  async function addToCart(productId, quantity = 1) {
    try {
      // Get product details
      const product = await getProduct(productId)
  
      // Get current cart
      const cart = getCart()
  
      // Check if product already in cart
      const existingItemIndex = cart.findIndex((item) => item.product_id === productId)
  
      if (existingItemIndex >= 0) {
        // Update quantity
        cart[existingItemIndex].quantity += quantity
      } else {
        // Add new item
        cart.push({
          product_id: productId,
          name: product.name,
          price: product.price,
          image: product.image,
          quantity: quantity,
        })
      }
  
      // Save updated cart
      localStorage.setItem("cart", JSON.stringify(cart))
  
      // Show success message
      alert("Product added to cart!")
  
      // Update cart count
      updateCartCount()
    } catch (error) {
      console.error("Add to cart error:", error)
      alert("Failed to add product to cart. Please try again.")
    }
  }
  
  // Remove item from cart
  function removeFromCart(productId) {
    // Get current cart
    const cart = getCart()
  
    // Filter out the item
    const updatedCart = cart.filter((item) => item.product_id !== productId)
  
    // Save updated cart
    localStorage.setItem("cart", JSON.stringify(updatedCart))
  
    // Update cart UI if on cart page
    if (window.location.pathname.includes("cart.html")) {
      renderCart()
    }
  
    // Update cart count
    updateCartCount()
  }
  
  // Update item quantity in cart
  function updateCartItemQuantity(productId, quantity) {
    // Get current cart
    const cart = getCart()
  
    // Find the item
    const itemIndex = cart.findIndex((item) => item.product_id === productId)
  
    if (itemIndex >= 0) {
      // Update quantity
      cart[itemIndex].quantity = quantity
  
      // Remove item if quantity is 0
      if (quantity <= 0) {
        cart.splice(itemIndex, 1)
      }
  
      // Save updated cart
      localStorage.setItem("cart", JSON.stringify(cart))
  
      // Update cart UI if on cart page
      if (window.location.pathname.includes("cart.html")) {
        renderCart()
      }
  
      // Update cart count
      updateCartCount()
    }
  }
  
  // Calculate cart total
  function calculateCartTotal() {
    const cart = getCart()
    return cart.reduce((total, item) => total + item.price * item.quantity, 0)
  }
  
  // Update cart count in header
  function updateCartCount() {
    const cart = getCart()
    const cartCount = cart.reduce((count, item) => count + item.quantity, 0)
  
    // Update UI element if it exists
    const cartCountElement = document.getElementById("cart-count")
    if (cartCountElement) {
      cartCountElement.textContent = cartCount
      cartCountElement.style.display = cartCount > 0 ? "block" : "none"
    }
  }
  
  // Render cart on cart page
  function renderCart() {
    const cartContainer = document.getElementById("cart-items")
    if (!cartContainer) return
  
    const cart = getCart()
  
    if (cart.length === 0) {
      cartContainer.innerHTML = '<div class="empty-cart">Your cart is empty</div>'
  
      // Hide checkout button
      const checkoutButton = document.getElementById("checkout-button")
      if (checkoutButton) {
        checkoutButton.style.display = "none"
      }
  
      return
    }
  
    // Clear container
    cartContainer.innerHTML = ""
  
    // Add cart items
    cart.forEach((item) => {
      const cartItem = document.createElement("div")
      cartItem.className = "cart-item"
  
      cartItem.innerHTML = `
        <div class="cart-item-image">
          <img src="${item.image}" alt="${item.name}">
        </div>
        <div class="cart-item-details">
          <h3>${item.name}</h3>
          <div class="cart-item-price">$${Number.parseFloat(item.price).toFixed(2)}</div>
        </div>
        <div class="cart-item-quantity">
          <button class="quantity-btn" onclick="updateCartItemQuantity(${item.product_id}, ${item.quantity - 1})">-</button>
          <span>${item.quantity}</span>
          <button class="quantity-btn" onclick="updateCartItemQuantity(${item.product_id}, ${item.quantity + 1})">+</button>
        </div>
        <div class="cart-item-total">$${(item.price * item.quantity).toFixed(2)}</div>
        <button class="remove-btn" onclick="removeFromCart(${item.product_id})">
          <i class="fas fa-trash"></i>
        </button>
      `
  
      cartContainer.appendChild(cartItem)
    })
  
    // Update cart total
    const totalElement = document.getElementById("cart-total")
    if (totalElement) {
      totalElement.textContent = `$${calculateCartTotal().toFixed(2)}`
    }
  
    // Show checkout button
    const checkoutButton = document.getElementById("checkout-button")
    if (checkoutButton) {
      checkoutButton.style.display = "block"
    }
  }
  
  // Create an order
  async function createOrder(shippingAddress, paymentMethod) {
    try {
      // Check if user is logged in
      if (!isLoggedIn()) {
        window.location.href = "/signup.html?returnUrl=/cart.html"
        return
      }
  
      const cart = getCart()
  
      if (cart.length === 0) {
        alert("Your cart is empty")
        return
      }
  
      // Prepare order data
      const orderData = {
        items: cart.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
        })),
        shipping_address: shippingAddress,
        payment_method: paymentMethod,
      }
  
      // Get token
      const token = localStorage.getItem("token")
  
      // Send request
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
      })
  
      const data = await response.json()
  
      if (data.success) {
        // Clear cart
        localStorage.setItem("cart", JSON.stringify([]))
  
        // Update cart count
        updateCartCount()
  
        // Show success message
        alert("Order placed successfully!")
  
        // Redirect to user dashboard
        window.location.href = "/user-dashboard.html"
  
        return data.order
      } else {
        throw new Error(data.message)
      }
    } catch (error) {
      console.error("Create order error:", error)
      alert("Failed to place order. Please try again.")
      throw error
    }
  }
  
  // Get user orders
  async function getUserOrders() {
    try {
      // Check if user is logged in
      if (!isLoggedIn()) {
        return []
      }
  
      // Get token
      const token = localStorage.getItem("token")
  
      // Send request
      const response = await fetch("/api/orders", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
  
      const data = await response.json()
  
      if (data.success) {
        return data.orders
      } else {
        throw new Error(data.message)
      }
    } catch (error) {
      console.error("Get orders error:", error)
      throw error
    }
  }
  
  // Initialize cart on page load
  document.addEventListener("DOMContentLoaded", () => {
    initCart()
    updateCartCount()
  
    // Render cart if on cart page
    if (window.location.pathname.includes("cart.html")) {
      renderCart()
    }
  })
  
  