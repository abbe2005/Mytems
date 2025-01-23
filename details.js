// Fetch product details based on the ID in the URL
const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get('id');

let product; // Declare the product variable outside the fetch scope

if (productId) {
    // Fetch product details from Firestore
    db.collection('products').doc(productId).get()
        .then(doc => {
            if (doc.exists) {
                product = doc.data(); // Assign the fetched product data to the variable
                document.getElementById('productDetails').innerHTML = `
                    <br>
                    <br>
                    <br>
                    <br>
                    <br>
                    <br>
                    <br>
                    <br>
                    <h1 style="color:white; padding:0rem 1rem;">Product Details :</h1>
                    <div class="product-name">${product.name}</div>
                    <div class="product-price">${product.price} DA</div>
                    <div class="product-description">${product.description}</div>
                    <div class="product-contact">
                        <p><strong>Phone : </strong> ${product.phone}</p>
                        <p><strong>Email : </strong> ${product.email}</p>
                        <br>
                    </div>
                    <img src="${product.imageUrls[0]}" alt="${product.name}" class="product-image">
                `;

                // Fetch seller info
                fetchSellerInfo(product.userId); // Fetch seller info after product is defined

            } else {
                document.getElementById('productDetails').innerHTML = '<p>Product not found.</p>';
            }
        })
        .catch(error => {
            console.error('Error fetching product:', error);
            document.getElementById('productDetails').innerHTML = '<p>Error loading product details.</p>';
        });
} else {
    document.getElementById('productDetails').innerHTML = '<p>No product ID provided.</p>';
}
// Function to fetch seller info and initialize chat
async function fetchSellerInfo(sellerId) {
    try {
        const sellerDoc = await db.collection('users').doc(sellerId).get();
        if (sellerDoc.exists) {
            const sellerData = sellerDoc.data();

            // Update the seller info in the UI
            document.getElementById('seller-username').textContent = sellerData.username || 'Unknown Seller';
            document.getElementById('seller-profile-pic').src = sellerData.profilePicture || 'default-profile.png';

        } else {
            console.error('Seller not found.');
        }
    } catch (error) {
        console.error('Error fetching seller info:', error);
    }
}

if (productId) {
    // Fetch product details from Firestore
    db.collection('products').doc(productId).get()
        .then(doc => {
            if (doc.exists) {
                const product = doc.data();
                // Fetch seller info
                fetchSellerInfo(product.userId);
            } else {
                console.error('Product not found.');
            }
        })
        .catch(error => {
            console.error('Error fetching product:', error);
        });
}