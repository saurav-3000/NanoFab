// Authentication related functions

// Check if user is logged in
function isLoggedIn() {
    return localStorage.getItem("token") !== null
  }
  
  // Get current user data
  function getCurrentUser() {
    const user = localStorage.getItem("user")
    return user ? JSON.parse(user) : null
  }
  
  // Register a new user
  async function registerUser(userData) {
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      })
  
      const data = await response.json()
  
      if (data.success) {
        // Save token and user data to localStorage
        localStorage.setItem("token", data.token)
        localStorage.setItem("user", JSON.stringify(data.user))
        return data
      } else {
        throw new Error(data.message)
      }
    } catch (error) {
      console.error("Registration error:", error)
      throw error
    }
  }
  
  // Login user
  async function loginUser(credentials) {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      })
  
      const data = await response.json()
  
      if (data.success) {
        // Save token and user data to localStorage
        localStorage.setItem("token", data.token)
        localStorage.setItem("user", JSON.stringify(data.user))
        return data
      } else {
        throw new Error(data.message)
      }
    } catch (error) {
      console.error("Login error:", error)
      throw error
    }
  }
  
  // Logout user
  function logoutUser() {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    // Redirect to home page
    window.location.href = "/index.html"
  }
  
  // Update UI based on authentication status
  function updateAuthUI() {
    const headerButtons = document.querySelector(".header-buttons")
    const isAuthenticated = isLoggedIn()
  
    if (headerButtons) {
      if (isAuthenticated) {
        const user = getCurrentUser()
        headerButtons.innerHTML = `
          <a href="/user-dashboard.html" class="btn btn-secondary">My Account</a>
          <button onclick="logoutUser()" class="btn btn-primary">Log Out</button>
        `
      } else {
        headerButtons.innerHTML = `
          <a href="/signup.html" class="btn btn-primary">Sign Up</a>
        `
      }
    }
  }
  
  // Check authentication status on protected pages
  function checkAuth() {
    const protectedPages = ["user-dashboard.html"]
    const currentPage = window.location.pathname.split("/").pop()
  
    if (protectedPages.includes(currentPage) && !isLoggedIn()) {
      // Redirect to signup page with a return URL
      window.location.href = `/signup.html?returnUrl=${encodeURIComponent(window.location.pathname)}`
      return false
    }
  
    return true
  }
  
  // Initialize auth on page load
  document.addEventListener("DOMContentLoaded", () => {
    updateAuthUI()
    checkAuth()
  })
  
  