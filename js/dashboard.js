// User dashboard related functions

// Helper functions (assuming these are defined elsewhere or imported)
function isLoggedIn() {
    // Replace with your actual implementation to check if the user is logged in
    // For example, check if a token exists in localStorage
    return localStorage.getItem("token") !== null
  }
  
  function getCurrentUser() {
    // Replace with your actual implementation to get the current user
    // For example, retrieve user data from localStorage
    const user = localStorage.getItem("user")
    return user ? JSON.parse(user) : null
  }
  
  // Get user profile
  async function getUserProfile() {
    try {
      // Check if user is logged in
      if (!isLoggedIn()) {
        return null
      }
  
      // Get token
      const token = localStorage.getItem("token")
  
      // Send request
      const response = await fetch("/api/users/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
  
      const data = await response.json()
  
      if (data.success) {
        return data.user
      } else {
        throw new Error(data.message)
      }
    } catch (error) {
      console.error("Get profile error:", error)
      throw error
    }
  }
  
  // Update user profile
  async function updateUserProfile(profileData) {
    try {
      // Check if user is logged in
      if (!isLoggedIn()) {
        return null
      }
  
      // Get token
      const token = localStorage.getItem("token")
  
      // Send request
      const response = await fetch("/api/users/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      })
  
      const data = await response.json()
  
      if (data.success) {
        // Update user in localStorage if name or email was updated
        if (profileData.name || profileData.email) {
          const user = getCurrentUser()
          if (profileData.name) user.name = profileData.name
          if (profileData.email) user.email = profileData.email
          localStorage.setItem("user", JSON.stringify(user))
        }
  
        return data
      } else {
        throw new Error(data.message)
      }
    } catch (error) {
      console.error("Update profile error:", error)
      throw error
    }
  }
  
  // Get user purchases
  async function getUserPurchases() {
    try {
      // Check if user is logged in
      if (!isLoggedIn()) {
        return []
      }
  
      // Get token
      const token = localStorage.getItem("token")
  
      // Send request
      const response = await fetch("/api/users/purchases", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
  
      const data = await response.json()
  
      if (data.success) {
        return data.purchases
      } else {
        throw new Error(data.message)
      }
    } catch (error) {
      console.error("Get purchases error:", error)
      throw error
    }
  }
  
  // Format date for display
  function formatDate(dateString) {
    const options = { year: "numeric", month: "long", day: "numeric" }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }
  
  // Load user dashboard data
  async function loadDashboard() {
    try {
      // Check if user is logged in
      if (!isLoggedIn()) {
        window.location.href = "/signup.html?returnUrl=/user-dashboard.html"
        return
      }
  
      // Get user data
      const user = getCurrentUser()
  
      // Update user info in the sidebar
      const userNameElement = document.querySelector(".user-info h3")
      if (userNameElement) {
        userNameElement.textContent = user.name
      }
  
      const memberSinceElement = document.querySelector(".user-info p")
      if (memberSinceElement) {
        memberSinceElement.textContent = `Member since ${formatDate(user.created_at || new Date())}`
      }
  
      // Get purchases
      const purchases = await getUserPurchases()
  
      // Update stats
      updateDashboardStats(purchases)
  
      // Render purchases list
      renderPurchasesList(purchases)
    } catch (error) {
      console.error("Load dashboard error:", error)
      alert("Failed to load dashboard data. Please try again later.")
    }
  }
  
  // Update dashboard stats
  function updateDashboardStats(purchases) {
    // Calculate stats
    const totalPurchases = purchases.length
    const totalDownloads = purchases.filter((purchase) => purchase.items.some((item) => item.downloaded)).length
  
    const totalSpent = purchases.reduce((total, purchase) => total + Number.parseFloat(purchase.total_amount), 0)
  
    // Update UI
    const purchasesCountElement = document.querySelector(".stat-card:nth-child(1) .stat-info h3")
    if (purchasesCountElement) {
      purchasesCountElement.textContent = totalPurchases
    }
  
    const downloadsCountElement = document.querySelector(".stat-card:nth-child(2) .stat-info h3")
    if (downloadsCountElement) {
      downloadsCountElement.textContent = totalDownloads
    }
  
    const totalSpentElement = document.querySelector(".stat-card:nth-child(3) .stat-info h3")
    if (totalSpentElement) {
      totalSpentElement.textContent = `$${totalSpent.toFixed(2)}`
    }
  }
  
  // Render purchases list
  function renderPurchasesList(purchases) {
    const purchasesContainer = document.querySelector(".purchases-list")
    if (!purchasesContainer) return
  
    // Clear container
    purchasesContainer.innerHTML = ""
  
    if (purchases.length === 0) {
      purchasesContainer.innerHTML = '<div class="empty-purchases">You have no purchases yet</div>'
      return
    }
  
    // Add purchases
    purchases.forEach((purchase) => {
      // For each purchase, render the first item as the main item
      const mainItem = purchase.items[0]
  
      const purchaseElement = document.createElement("div")
      purchaseElement.className = "purchase-item"
  
      if (mainItem.downloaded) {
        purchaseElement.classList.add("downloaded")
      }
  
      purchaseElement.innerHTML = `
        <div class="purchase-image">
          <img src="${mainItem.product_image}" alt="${mainItem.product_name}">
        </div>
        <div class="purchase-details">
          <h3>${mainItem.product_name}</h3>
          <div class="purchase-meta">
            <span class="purchase-date"><i class="far fa-calendar-alt"></i> Purchased on: ${formatDate(purchase.created_at)}</span>
            <span class="purchase-price"><i class="fas fa-tag"></i> $${Number.parseFloat(mainItem.price).toFixed(2)}</span>
          </div>
          <div class="purchase-category">Category: ${mainItem.category}</div>
          ${
            mainItem.downloaded
              ? `<div class="download-status">
              <i class="fas fa-check-circle"></i> Downloaded on ${formatDate(mainItem.download_date || purchase.created_at)}
            </div>`
              : ""
          }
        </div>
        <div class="purchase-actions">
          <a href="#" class="btn btn-primary btn-sm" onclick="downloadProduct(${mainItem.product_id}, ${purchase.id}); return false;">
            <i class="fas fa-download"></i> ${mainItem.downloaded ? "Download Again" : "Download"}
          </a>
          <a href="/product.html?id=${mainItem.product_id}" class="btn btn-secondary btn-sm">
            <i class="fas fa-eye"></i> View
          </a>
        </div>
      `
  
      purchasesContainer.appendChild(purchaseElement)
    })
  }
  
  // Download a product
  async function downloadProduct(productId, orderId) {
    try {
      // In a real application, this would make an API call to record the download
      // and then redirect to the actual file download
  
      alert("Your download is starting...")
  
      // Simulate download recording
      const token = localStorage.getItem("token")
  
      // This endpoint would need to be implemented in the backend
      await fetch(`/api/downloads`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          product_id: productId,
          order_id: orderId,
        }),
      })
  
      // In a real application, this would redirect to the file
      // window.location.href = `/api/downloads/${productId}`;
  
      // For demo purposes, just reload the dashboard
      loadDashboard()
    } catch (error) {
      console.error("Download error:", error)
      alert("Failed to start download. Please try again.")
    }
  }
  
  // Initialize dashboard on page load
  document.addEventListener("DOMContentLoaded", () => {
    // Check if we're on the dashboard page
    if (window.location.pathname.includes("user-dashboard.html")) {
      loadDashboard()
    }
  })
  
  