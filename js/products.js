// Product related functions

// Get all products with optional filters
async function getProducts(filters = {}) {
    try {
      // Build query string from filters
      const queryParams = new URLSearchParams()
  
      if (filters.category) queryParams.append("category", filters.category)
      if (filters.sort) queryParams.append("sort", filters.sort)
      if (filters.price) queryParams.append("price", filters.price)
      if (filters.search) queryParams.append("search", filters.search)
      if (filters.page) queryParams.append("page", filters.page)
      if (filters.limit) queryParams.append("limit", filters.limit)
  
      const response = await fetch(`/api/products?${queryParams.toString()}`)
      const data = await response.json()
  
      if (data.success) {
        return data
      } else {
        throw new Error(data.message)
      }
    } catch (error) {
      console.error("Get products error:", error)
      throw error
    }
  }
  
  // Get a single product by ID
  async function getProduct(productId) {
    try {
      const response = await fetch(`/api/products/${productId}`)
      const data = await response.json()
  
      if (data.success) {
        return data.product
      } else {
        throw new Error(data.message)
      }
    } catch (error) {
      console.error("Get product error:", error)
      throw error
    }
  }
  
  // Create a product card element
  function createProductCard(product) {
    const card = document.createElement("div")
    card.className = "product-card"
  
    // Determine if product has any tags
    let tagHtml = ""
    if (product.is_featured) {
      tagHtml = '<div class="product-tags"><span class="tag tag-bestseller">Bestseller</span></div>'
    }
  
    // Generate rating stars
    const ratingHtml = getRatingStars(product.rating)
  
    card.innerHTML = `
      <div class="product-image">
        <img src="${product.image}" alt="${product.name}">
        ${tagHtml}
      </div>
      <div class="product-info">
        <h3>${product.name}</h3>
        <div class="product-category">${product.category}</div>
        <div class="product-rating">
          ${ratingHtml}
          <span>(${product.rating_count})</span>
        </div>
        <div class="product-price">$${Number.parseFloat(product.price).toFixed(2)}</div>
        <button class="btn btn-primary btn-sm" onclick="addToCart(${product.id})">Add to Cart</button>
      </div>
    `
  
    return card
  }
  
  // Generate rating stars HTML
  function getRatingStars(rating) {
    let stars = ""
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5
  
    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars += '<i class="fas fa-star"></i>'
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars += '<i class="fas fa-star-half-alt"></i>'
      } else {
        stars += '<i class="far fa-star"></i>'
      }
    }
  
    return stars
  }
  
  // Load products on shop page
  async function loadProducts() {
    try {
      // Get filter values
      const categorySelect = document.querySelector('select[name="category"]')
      const sortSelect = document.querySelector('select[name="sort"]')
      const priceSelect = document.querySelector('select[name="price"]')
      const searchInput = document.querySelector(".search-bar input")
  
      // Build filters object
      const filters = {
        page: 1,
        limit: 8,
      }
  
      if (categorySelect && categorySelect.value) {
        filters.category = categorySelect.value
      }
  
      if (sortSelect && sortSelect.value) {
        filters.sort = sortSelect.value
      }
  
      if (priceSelect && priceSelect.value) {
        filters.price = priceSelect.value
      }
  
      if (searchInput && searchInput.value) {
        filters.search = searchInput.value
      }
  
      // Get URL parameters for pagination
      const urlParams = new URLSearchParams(window.location.search)
      if (urlParams.has("page")) {
        filters.page = Number.parseInt(urlParams.get("page"))
      }
  
      // Fetch products
      const result = await getProducts(filters)
  
      // Get products container
      const productsContainer = document.querySelector(".products-grid")
      if (!productsContainer) return
  
      // Clear existing products
      productsContainer.innerHTML = ""
  
      // Add products to the page
      if (result.products.length === 0) {
        productsContainer.innerHTML = '<div class="no-products">No products found</div>'
      } else {
        result.products.forEach((product) => {
          const productCard = createProductCard(product)
          productsContainer.appendChild(productCard)
        })
      }
  
      // Update pagination
      updatePagination(result.currentPage, result.totalPages)
    } catch (error) {
      console.error("Failed to load products:", error)
      // Show error message
      const productsContainer = document.querySelector(".products-grid")
      if (productsContainer) {
        productsContainer.innerHTML = '<div class="error-message">Failed to load products. Please try again later.</div>'
      }
    }
  }
  
  // Update pagination controls
  function updatePagination(currentPage, totalPages) {
    const paginationContainer = document.querySelector(".pagination-numbers")
    if (!paginationContainer) return
  
    paginationContainer.innerHTML = ""
  
    // Determine range of pages to show
    let startPage = Math.max(1, currentPage - 2)
    const endPage = Math.min(totalPages, startPage + 4)
  
    if (endPage - startPage < 4) {
      startPage = Math.max(1, endPage - 4)
    }
  
    // Add page links
    for (let i = startPage; i <= endPage; i++) {
      const pageLink = document.createElement("a")
      pageLink.href = `?page=${i}`
      pageLink.textContent = i
  
      if (i === currentPage) {
        pageLink.className = "active"
      }
  
      paginationContainer.appendChild(pageLink)
    }
  
    // Update prev/next buttons
    const prevButton = document.querySelector(".pagination-prev")
    const nextButton = document.querySelector(".pagination-next")
  
    if (prevButton) {
      if (currentPage <= 1) {
        prevButton.classList.add("disabled")
        prevButton.href = "#"
      } else {
        prevButton.classList.remove("disabled")
        prevButton.href = `?page=${currentPage - 1}`
      }
    }
  
    if (nextButton) {
      if (currentPage >= totalPages) {
        nextButton.classList.add("disabled")
        nextButton.href = "#"
      } else {
        nextButton.classList.remove("disabled")
        nextButton.href = `?page=${currentPage + 1}`
      }
    }
  }
  
  // Initialize products on page load
  document.addEventListener("DOMContentLoaded", () => {
    // Check if we're on the shop page
    if (window.location.pathname.includes("shop.html")) {
      loadProducts()
  
      // Add event listeners for filters
      const filterElements = document.querySelectorAll(".filter-group select")
      filterElements.forEach((element) => {
        element.addEventListener("change", loadProducts)
      })
  
      // Add event listener for search
      const searchForm = document.querySelector(".search-bar")
      if (searchForm) {
        searchForm.addEventListener("submit", (e) => {
          e.preventDefault()
          loadProducts()
        })
      }
    }
  })
  
  