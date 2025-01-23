// Toggle Navbar Visibility
const hamburgerMenu = document.getElementById('hamburger-menu');
const navLinksContainer = document.getElementById('nav-links-container');

hamburgerMenu.addEventListener('click', () => {
    navLinksContainer.classList.toggle('active');
});