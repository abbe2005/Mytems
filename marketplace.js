// Global variables for filters and search
let activeFilters = new Set();
let products = [];
let filteredProducts = [];

function createProductCard(product) {
    const imageUrl = product.imageUrls.length > 0 ? product.imageUrls[0] : 'images/default-product.jpg';
    return `
        <div class="product-card">
            <img src="${imageUrl}" alt="${product.name}" class="product-image">
            <div class="product-info">
                <div class="product-name">${product.name}</div>
                <div class="product-price">$${product.price}</div>
                <div class="product-tags">
                    <span class="tag tag-rent">${product.type}</span>
                    <span class="tag tag-delivery">
                        ${product.delivery ? 'Delivery Available' : 'No Delivery'}
                    </span>
                </div>
                <button class="view-details-btn" onclick="viewProductDetails('${product.id}')">
                    View Details
                </button>
                ${auth.currentUser  && auth.currentUser .uid === product.userId ? 
                    `<button class="delete-product-btn" onclick="deleteProduct('${product.id}')">
                        Delete Product
                    </button>` : ''}
            </div>
        </div>
    `;
}

// Function to delete product
async function deleteProduct(productId) {
    try {
        await db.collection('products').doc(productId).delete();
        showMessage('Product deleted successfully!');
        setTimeout(() => {
            window.location.href = 'shop.html';
        }, 2000);
    } catch (error) {
        console.error('Error deleting product:', error);
        showMessage(error.message, true);
    }
}
// Function to fetch products from Firestore
async function fetchProducts() {
    try {
        const snapshot = await db.collection('products').get();
        products = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        applyFiltersAndSearch();
    } catch (error) {
        console.error('Error fetching products:', error);
        showMessage('Error loading products', true);
    }
}

// Function to apply filters and search
function applyFiltersAndSearch() {
    const searchQuery = document.getElementById('searchInput').value.toLowerCase();

    filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchQuery) ||
                              product.description.toLowerCase().includes(searchQuery);

        const matchesFilters = Array.from(activeFilters).every(filter => {
            switch(filter) {
                case 'rent':
                    return product.type === 'rent';
                case 'buy':
                    return product.type === 'buy';
                case 'delivery':
                    return product.delivery;
                case 'no-delivery':
                    return !product.delivery;
                case 'my-products':
                    return auth.currentUser && auth.currentUser.uid === product.userId;
                default:
                    return true;
            }
        });

        return matchesSearch && matchesFilters;
    });

    renderProducts();
}



// Function to render products
function renderProducts() {
    const productsGrid = document.getElementById('productsGrid');
    productsGrid.innerHTML = filteredProducts.map(createProductCard).join('');
}

// Function to view product details
function viewProductDetails(productId) {
    window.location.href = `product-details.html?id=${productId}`;
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Search input handler
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', applyFiltersAndSearch);

    // Filter buttons handler
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const filter = btn.dataset .filter;
            if (activeFilters.has(filter)) {
                activeFilters.delete(filter);
                btn.classList.remove('active');
            } else {
                activeFilters.add(filter);
                btn.classList.add('active');
            }
            applyFiltersAndSearch();
        });
    });

    // Initial products fetch
    fetchProducts();
});

// Auth state observer
auth.onAuthStateChanged((user) => {
    if (!user) {
        window.location.href = 'login.html';
    }
});

// Re-use your existing showMessage function
function showMessage(message, isError = false) {
    const messageDiv = document.getElementById('message');
    if (!messageDiv) {
        const div = document.createElement('div');
        div.id = 'message';
        div.style.display = 'none';
        document.body.appendChild(div);
    }

    const msgDiv = document.getElementById('message');
    msgDiv.style.display = 'block';
    msgDiv.textContent = message;
    msgDiv.className = `alert ${isError ? 'alert-danger' : 'alert-success'}`;
    msgDiv.style.position = 'fixed';
    msgDiv.style.top = '20px';
    msgDiv.style.left = '50%';
    msgDiv.style.transform = 'translateX(-50%)';
    msgDiv.style.padding = '1rem 2rem';
    msgDiv.style.borderRadius = '10px';
    msgDiv.style.backgroundColor = isError ? 'rgba(220, 53, 69, 0.9)' : 'rgba(40, 167, 69, 0.9)';
    msgDiv.style.color = 'white';
    msgDiv.style.zIndex = '1000';
    msgDiv.style.backdropFilter = 'blur(10px)';

    setTimeout(() => {
        msgDiv.style.display = 'none';
    }, 3000);
}