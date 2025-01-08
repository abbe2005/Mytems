// Initialize Firebase with your config
const firebaseConfig = {
    apiKey: "AIzaSyBYe8Oj-bTk9C_xkmeU2fb3eXo-_v0CXKg",
    authDomain: "mytems-e5043.firebaseapp.com",
    projectId: "mytems-e5043",
    storageBucket: "mytems-e5043.firebasestorage.app",
    messagingSenderId: "424810638850",
    appId: "1:424810638850:web:7b1b5bc91b5cbf1bacc11b"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Get references to auth and firestore
const auth = firebase.auth();
const db = firebase.firestore();

// Function to show messages
function showMessage(message, isError = false) {
    const messageDiv = document.getElementById('message');
    if (!messageDiv) {
        // Create message div if it doesn't exist
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

// Update UI based on auth state
function updateUIForAuth(user) {
    const loginLink = document.getElementById('login-link');
    const userEmail = document.getElementById('user-email');
    const logoutLink = document.getElementById('logout-link');
    const addProductLink = document.getElementById('add-product-link');

    if (user) {
        // User is signed in
        if (loginLink) loginLink.style.display = 'none';
        if (userEmail) {
            userEmail.style.display = 'inline-block';
            userEmail.textContent = user.email.split('@')[0]; // Remove everything after "@"
            userEmail.addEventListener('click', () => {
                window.location.href = 'user.html'; // Redirect to user page
            });
        }
        if (logoutLink) logoutLink.style.display = 'none'; // Hide logout button
        if (addProductLink) addProductLink.style.display = 'inline-block';
    } 
    if (!user) {
        // User is signed out
        if (loginLink) loginLink.style.display = 'block';
        if (userEmail) userEmail.style.display = 'none';
        if (logoutLink) logoutLink.style.display = 'none';
        if (addProductLink) addProductLink.style.display = 'none';

        // Redirect from protected pages
        const protectedPages = ['sell.html'];
        const currentPath = window.location.pathname;
        if (protectedPages.some(page => currentPath.includes(page))) {
            window.location.href = 'login.html';
        }
    }
}
// Handle Registration
const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const username = document.getElementById('username').value;

        if (password !== confirmPassword) {
            showMessage('Passwords do not match!', true);
            return;
        }

        try {
            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;
            
            // Store additional user data
            await db.collection('users').doc(user.uid).set({
                username: username,
                email: email,
                createdAt: new Date()
            });

            showMessage('Registration successful! Redirecting...');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
        } catch (error) {
            console.error('Registration error:', error);
            showMessage(error.message, true);
        }
    });
}

// Handle Login
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            await auth.signInWithEmailAndPassword(email, password);
            showMessage('Login successful! Redirecting...');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
        } catch (error) {
            console.error('Login error:', error);
            showMessage(error.message, true);
        }
    });
}

// Handle Logout
if (document.getElementById('logout-button')) {
    document.getElementById('logout-button').addEventListener('click', () => {
        auth.signOut().then(() => {
            window.location.href = 'login.html';
        }).catch((error) => {
            console.error('Error signing out:', error);
        });
    });
}
// Auth state observer
auth.onAuthStateChanged((user) => {
    console.log(user ? 'User  is signed in' : 'User  is signed out');
    updateUIForAuth(user);
});

// Add Product Functionality
const addProductForm = document.getElementById('add-product-form');
if (addProductForm) {
    addProductForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const name = document.getElementById('name').value;
        const price = document.getElementById('price').value;
        const description = document.getElementById('description').value;
        const image = document.getElementById('image').files[0];

        try {
            // Upload image to Firebase Storage
            const storageRef = firebase.storage().ref(`images/${image.name}`);
            await storageRef.put(image);
            const imageUrl = await storageRef.getDownloadURL();

            // Add product to Firestore
            await db.collection('products').add({
                name: name,
                price: price,
                description: description,
                imageUrl: imageUrl,
                createdAt: new Date()
            });

            showMessage('Product added successfully!');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
        } catch (error) {
            console.error('Error adding product:', error);
            showMessage(error.message, true);
        }
    });
}