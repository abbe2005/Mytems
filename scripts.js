
document.addEventListener('DOMContentLoaded', function() {
    const carousel = document.getElementById('heroCarousel');
    const carouselInstance = new bootstrap.Carousel(carousel);


// Debounce function to limit the rate of execution
function debounce(func, delay) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), delay);
    };
}

function handleWheel(event) {
    event.preventDefault();
    console.log("Wheel event triggered"); // Debugging line

    if (event.deltaY > 0) {
        console.log("Scrolling down"); // Debugging line
        const carouselInstance = new bootstrap.Carousel(carousel);
        carouselInstance.next();
    } else if (event.deltaY < 0) {
        console.log("Scrolling up"); // Debugging line
        const carouselInstance = new bootstrap.Carousel(carousel);
        carouselInstance.prev();
    }
}
// Add debounced wheel event listener with a shorter delay
carousel.addEventListener('wheel', debounce(handleWheel, 100));


});