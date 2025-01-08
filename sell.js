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

// Initialize Supabase properly
const supabaseUrl = 'https://qlcfxifzusjobkhpgway.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsY2Z4aWZ6dXNqb2JraHBnd2F5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzYyODAwNjMsImV4cCI6MjA1MTg1NjA2M30.BNMpou6EijySSsISAbHT6I7QxW29FQhwMG2l_rZL060';
const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);

// Get references to auth and firestore
const auth = firebase.auth();
const db = firebase.firestore();

// Handle image preview
const imagesInput = document.getElementById('images');
const imagePreview = document.getElementById('imagePreview');
const uploadedImages = new Set();

imagesInput.addEventListener('change', (e) => {
    imagePreview.innerHTML = '';
    const files = Array.from(e.target.files);

    files.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = document.createElement('img');
            img.src = e.target.result;
            img.style.width = '100px'; // Add styling for preview
            img.style.height = 'auto';
            img.style.margin = '5px';
            imagePreview.appendChild(img);
        };
        reader.readAsDataURL(file);
    });
});

// Handle form submission
sellForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    submitBtn.disabled = true;

    try {
        const user = auth.currentUser ;
        if (!user) {
            throw new Error('You must be logged in to sell products');
        }

        // Upload images to Supabase
        const files = Array.from(imagesInput.files);
        const imageUrls = await uploadImages(files);

        // Create product in Firestore
        const productData = {
            name: document.getElementById('name').value,
            price: parseFloat(document.getElementById('price').value),
            description: document.getElementById('description').value,
            type: document.getElementById('type').value,
            delivery: document.getElementById('delivery').checked,
            phone: document.getElementById('phone').value, // Add phone number
            email: document.getElementById('email').value, // Add email address
            imageUrls: imageUrls, // Array of image URLs
            userId: user.uid,
            createdAt: new Date().toISOString()
        };

        await db.collection('products').add(productData);

        showMessage('Product listed successfully!');
        setTimeout(() => {
            window.location.href = 'shop.html';
        }, 2000);

    } catch (error) {
        console.error('Error listing product:', error);
        showMessage(error.message, true);
        submitBtn.disabled = false;
    }
});

// Function to upload images to Supabase
async function uploadImages(files) {
    const imageUrls = [];

    for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;

        // Upload the file directly (no need for anonymous auth if bucket is public)
        const { data: uploadData, error: uploadError } = await supabaseClient.storage
            .from('item_images')
            .upload(`images/${fileName}`, file);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabaseClient.storage
            .from('item_images')
            .getPublicUrl(`images/${fileName}`);

        imageUrls.push(publicUrl);
    }

    return imageUrls;
}

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

// Auth state observer
auth.onAuthStateChanged((user) => {
    if (!user) {
        window.location.href = 'login.html';
    }
});