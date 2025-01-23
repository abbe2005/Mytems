// Initialize Supabase client
const supabaseClient = supabase;

// Handle image preview
const imagesInput = document.getElementById('images');
const imagePreview = document.getElementById('imagePreview');
const sellForm = document.getElementById('sellForm');
const submitBtn = document.getElementById('submitBtn');

imagesInput.addEventListener('change', (e) => {
    imagePreview.innerHTML = '';
    const files = Array.from(e.target.files);

    files.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = document.createElement('img');
            img.src = e.target.result;
            img.style.width = '100px';
            img.style.height = 'auto';
            img.style.margin = '5px';
            imagePreview.appendChild(img);
        };
        reader.readAsDataURL(file);
    });
});

// Function to upload images to Supabase
async function uploadImages(files) {
    const imageUrls = [];

    for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;

        try {
            // Upload the file directly
            const { data: uploadData, error: uploadError } = await supabaseClient.storage
                .from('item_images')
                .upload(`images/${fileName}`, file);

            if (uploadError) throw uploadError;

            // Get public URL
            const { data } = supabaseClient.storage
                .from('item_images')
                .getPublicUrl(`images/${fileName}`);

            imageUrls.push(data.publicUrl);
        } catch (error) {
            console.error('Image upload error:', error);
            throw error;
        }
    }

    return imageUrls;
}

// Handle form submission
sellForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    submitBtn.disabled = true;

    try {
        const user = auth.currentUser;
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
            phone: document.getElementById('phone').value,
            email: document.getElementById('email').value,
            imageUrls: imageUrls,
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

// Show Message Function
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

// Loading Indicator for Submit Button
const submitButton = document.getElementById('submitBtn');
const observer = new MutationObserver(function(mutations) {
    if (submitButton.disabled) {
        const template = `
            <div class="wrapper">
                <div class="circle"></div>
                <div class="circle"></div>
                <div class="circle"></div>
                <div class="shadow"></div>
                <div class="shadow"></div>
                <div class="shadow"></div>
            </div>
        `;
        submitButton.innerHTML = template;
    }
});

observer.observe(submitButton, {
    attributes: true,
    attributeFilter: ['disabled']
});