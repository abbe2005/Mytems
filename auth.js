// Initialize Firebase with your config
const firebaseConfig = {
    apiKey: "AIzaSyBYe8Oj-bTk9C_xkmeU2fb3eXo-_v0CXKg",
    authDomain: "mytems-e5043.firebaseapp.com",
    projectId: "mytems-e5043",
    storageBucket: "mytems-e5043.firebasestorage.app",
    messagingSenderId: "424810638850",
    appId: "1:424810638850:web:7b1b5bc91b5cbf1bacc11b"
};

// Initialize Supabase properly
const supabaseUrl = 'https://qlcfxifzusjobkhpgway.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsY2Z4aWZ6dXNqb2JraHBnd2F5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzYyODAwNjMsImV4cCI6MjA1MTg1NjA2M30.BNMpou6EijySSsISAbHT6I7QxW29FQhwMG2l_rZL060';
const supabase = window.supabase ? window.supabase.createClient(supabaseUrl, supabaseKey) : null;


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
    const userProfilePic = document.getElementById('user-profile-pic');

    if (user) {
        // Fetch user data to get profile picture
        db.collection('users').doc(user.uid).get().then(doc => {
            const userData = doc.data();

            // User is signed in
            if (loginLink) loginLink.style.display = 'none';
            
            // Email display
            if (userEmail) {
                userEmail.style.display = 'none'; // Hide email text
            }

            // Profile Picture Handling
            if (userProfilePic) {
                // If profile picture exists in user data, use it
                if (userData && userData.profilePicture) {
                    userProfilePic.src = userData.profilePicture;
                    userProfilePic.style.display = 'inline-block';
                } else {
                    // Set default profile picture
                    userProfilePic.src = 'default-profile.png';
                    userProfilePic.style.display = 'inline-block';
                }
                // Styling for profile picture
                userProfilePic.style.width = '40px';
                userProfilePic.style.height = '40px';
                userProfilePic.style.borderRadius = '50%';
                userProfilePic.style.objectFit = 'cover';
                userProfilePic.style.cursor = 'pointer';
                
                // Add click event to redirect to user page
                userProfilePic.onclick = () => {
                    window.location.href = 'user.html';
                }
            }

            if (logoutLink) logoutLink.style.display = 'none';
            if (addProductLink) addProductLink.style.display = 'inline-block';
        }).catch(error => {
            console.error("Error fetching user data:", error);
        });
    } else {
        // User is signed out
        if (loginLink) loginLink.style.display = 'block';
        if (userEmail) userEmail.style.display = 'none';
        if (logoutLink) logoutLink.style.display = 'none';
        if (addProductLink) addProductLink.style.display = 'none';
        
        // Reset or hide profile picture
        if (userProfilePic) {
            userProfilePic.style.display = 'none';
        }

        // Redirect from protected pages
        const protectedPages = ['sell.html', 'user.html'];
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
            
            // Send verification email
            await user.sendEmailVerification();

            // Store additional user data
            await db.collection('users').doc(user.uid).set({
                username: username,
                email: email,
                createdAt: new Date(),
                profilePicture: null,
                isVerified: false
            });

            showMessage('Registration successful! Verification email sent.');
            setTimeout(() => {
                window.location.href = 'login.html';
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
            const userCredential = await auth.signInWithEmailAndPassword(email, password);
            
            // Check email verification
            if (!userCredential.user.emailVerified) {
                showMessage('Please verify your email before logging in.', true);
                await auth.signOut();
                return;
            }

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
    console.log(user ? 'User is signed in' : 'User is signed out');
    updateUIForAuth(user);
});

// Fetch Current User Data
function fetchCurrentUserData() {
    return new Promise((resolve, reject) => {
        const user = auth.currentUser;
        if (!user) {
            resolve(null);
            return;
        }

        db.collection('users').doc(user.uid).get()
            .then((doc) => {
                if (doc.exists) {
                    resolve(doc.data());
                } else {
                    resolve(null);
                }
            })
            .catch((error) => {
                console.error('Error fetching user data:', error);
                reject(error);
            });
    });
}
// Profile Picture Update
function handleProfilePictureUpdate(e) {
    e.preventDefault();
    
    const profilePictureInput = document.getElementById('profile-picture');
    const profilePicture = profilePictureInput.files[0];

    if (!profilePicture) {
        showMessage('Please select a profile picture', true);
        return;
    }

    const user = auth.currentUser;
    
    // Upload to Supabase
    const fileExt = profilePicture.name.split('.').pop();
    const fileName = `${user.uid}_${Date.now()}.${fileExt}`;
    
    supabase.storage
        .from('item_images')
        .upload(fileName, profilePicture)
        .then(({ data, error }) => {
            if (error) throw error;

            return supabase.storage
                .from('item_images')
                .getPublicUrl(fileName);
        })
        .then(({ data, error }) => {
            if (error) throw error;

            const profilePicUrl = data.publicUrl;

            // Update Firestore
            return db.collection('users').doc(user.uid).update({
                profilePicture: profilePicUrl
            }).then(() => profilePicUrl);
        })
        .then((profilePicUrl) => {
            // Update UI
            const currentProfilePic = document.getElementById('current-profile-pic');
            if (currentProfilePic) {
                currentProfilePic.src = profilePicUrl;
            }

            const navProfilePic = document.getElementById('user-profile-pic');
            if (navProfilePic) {
                navProfilePic.src = profilePicUrl;
            }

            showMessage('Profile picture updated successfully!');
            profilePictureInput.value = '';
        })
        .catch((error) => {
            console.error('Profile picture update error:', error);
            showMessage(error.message, true);
        });
}

// Update Username
function handleUsernameUpdate(e) {
    e.preventDefault();
    
    const usernameInput = document.getElementById('username');
    const newUsername = usernameInput.value.trim();

    if (!newUsername) {
        showMessage('Please enter a valid username', true);
        return;
    }

    const user = auth.currentUser ;

    db.collection('users').doc(user.uid).update({
        username: newUsername
    })
    .then(() => {
        const currentUsername = document.getElementById('current-username');
        if (currentUsername) {
            currentUsername.textContent = newUsername;
        }

        showMessage('Username updated successfully!');
        usernameInput.value = '';
    })
    .catch((error) => {
        console.error('Username update error:', error);
        showMessage(error.message, true);
    });
}

// Change Password
function handlePasswordChange(e) {
    e.preventDefault();
    
    const currentPasswordInput = document.getElementById('current-password');
    const newPasswordInput = document.getElementById('new-password');
    const confirmPasswordInput = document.getElementById('confirm-password');

    const currentPassword = currentPasswordInput.value;
    const newPassword = newPasswordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    if (newPassword !== confirmPassword) {
        showMessage('New passwords do not match', true);
        return;
    }

    const user = auth.currentUser ;
    const credential = firebase.auth.EmailAuthProvider.credential(
        user.email, 
        currentPassword
    );

    user.reauthenticateWithCredential(credential)
        .then(() => user.updatePassword(newPassword))
        .then(() => {
            showMessage('Password updated successfully!');
            currentPasswordInput.value = '';
            newPasswordInput.value = '';
            confirmPasswordInput.value = '';
        })
        .catch((error) => {
            console.error('Password change error:', error);
            showMessage(error.message, true);
        });
}




// Resend Email Verification
function resendVerificationEmail() {
    const user = auth.currentUser ;
    user.sendEmailVerification()
        .then(() => {
            showMessage('Verification email sent!');
        })
        .catch((error) => {
            console.error('Email verification error:', error);
            showMessage(error.message, true);
        });
}

// Update Email Verification Status
function updateEmailVerificationStatus() {
    const user = auth.currentUser;
    const verificationStatus = document.getElementById('email-verification-status');
    
    if (user && verificationStatus) {
        if (user.emailVerified) {
            verificationStatus.textContent = 'Status: Verified';
            verificationStatus.style.color = 'green';
        } else {
            verificationStatus.textContent = 'Status: Not Verified';
            verificationStatus.style.color = 'red';
        }
    }
}
// Event Listeners for User Profile Page
document.addEventListener('DOMContentLoaded', () => {
    // Profile Picture Update
    const profilePictureForm = document.getElementById('profile-picture-form');
    if (profilePictureForm) {
        profilePictureForm.addEventListener('submit', handleProfilePictureUpdate);
    }

    // Username Update
    const usernameForm = document.getElementById('username-form');
    if (usernameForm) {
        usernameForm.addEventListener('submit', handleUsernameUpdate);
    }

    // Password Change
    const passwordForm = document.getElementById('password-form');
    if (passwordForm) {
        passwordForm.addEventListener('submit', handlePasswordChange);
    }

    // Email Verification
    const verifyEmailBtn = document.getElementById('verify-email');
    if (verifyEmailBtn) {
        verifyEmailBtn.addEventListener('click', resendVerificationEmail);
    }

    // Logout Button
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            auth.signOut().then(() => {
                window.location.href = 'login.html';
            }).catch((error) => {
                console.error('Error signing out:', error);
            });
        });
    }

    // User Data and Verification Status
    auth.onAuthStateChanged((user) => {
        if (user) {
            fetchCurrentUserData().then(userData => {
                if (userData) {
                    // Update profile picture
                    const currentProfilePic = document.getElementById('current-profile-pic');
                    if (currentProfilePic && userData.profilePicture) {
                        currentProfilePic.src = userData.profilePicture;
                    }

                    // Update username
                    const currentUsername = document.getElementById('current-username');
                    if (currentUsername) {
                        currentUsername.textContent = userData.username || 'Username not set';
                    }

                    // Update email
                    const currentEmail = document.getElementById('current-email');
                    if (currentEmail) {
                        currentEmail.textContent = user.email;
                    }
                }
            });

            // Update email verification status
            updateEmailVerificationStatus();
        }
    });

    auth.onAuthStateChanged((user) => {
        // Get references to elements
        const currentProfilePic = document.getElementById('current-profile-pic');
        const currentUsername = document.getElementById('current-username');
        const currentEmail = document.getElementById('current-email');
    
        if (user) {
            db.collection('users').doc(user.uid).get().then((doc) => {
                if (doc.exists) {
                    const userData = doc.data();
                    
                    // Update profile picture
                    if (currentProfilePic) {
                        if (userData.profilePicture) {
                            currentProfilePic.src = userData.profilePicture;
                        } else {
                            currentProfilePic.src = '/default-profile.png';
                        }
                    }
                    
                    // Update username
                    if (currentUsername) {
                        currentUsername.textContent = userData.username || 'Username not set';
                    }
                    
                    // Update email
                    if (currentEmail) {
                        currentEmail.textContent = user.email;
                    }
                }
            }).catch((error) => {
                console.error("Error fetching user data:", error);
            });
        }
    });
    // Forgot Password Functionality
const forgotPasswordForm = document.getElementById('forgotPasswordForm');
if (forgotPasswordForm) {
    forgotPasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;

        try {
            // Firebase method to send password reset email
            await auth.sendPasswordResetEmail(email);
            
            showMessage('Password reset email sent! Check your inbox.');
            
            // Optional: Redirect after a short delay
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 3000);
        } catch (error) {
            console.error('Password reset error:', error);
            
            // Specific error handling
            switch (error.code) {
                case 'auth/invalid-email':
                    showMessage('Invalid email address.', true);
                    break;
                case 'auth/user-not-found':
                    showMessage('No user found with this email address.', true);
                    break;
                case 'auth/too-many-requests':
                    showMessage('Too many reset attempts. Please try again later.', true);
                    break;
                default:
                    showMessage('Failed to send password reset email. Please try again.', true);
            }
        }
    });
}


});