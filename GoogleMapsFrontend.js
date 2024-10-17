let map, service, infowindow, marker, busyChart; // Declare globally to manage map elements
const mobileWidth = window.matchMedia("(max-width: 37.5em)"); // Match media query for mobile devices

function initMap() {
    // Initialize Google Map
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 12.967308, lng: 77.587831 }, // Default map center
        zoom: 12, // Default zoom level
    });

    // Initialize InfoWindow and Marker
    infowindow = new google.maps.InfoWindow({ disableAutoPan: true, minWidth: 200 });
    marker = new google.maps.Marker({ map: map });

    // Add Autocomplete for places input
    const input = document.getElementById("pac-input");
    const autocomplete = new google.maps.places.Autocomplete(input, {
        fields: ["place_id", "geometry", "formatted_address", "name", "rating", "price_level", "user_ratings_total", "photos"]
    });

    // Adjust map controls based on device type
    if (mobileWidth.matches) {
        map.controls[google.maps.ControlPosition.LEFT].push(input);
    } else {
        map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
    }

    // Event listener for place selection from autocomplete
    autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (place.geometry && place.geometry.location) {
            map.setZoom(15);
            adjustMapCenterForInfoWindow(place.geometry.location, map, 200); // Adjust for visibility
            marker.setPosition(place.geometry.location); // Update marker position
            marker.setVisible(true); // Ensure marker is visible
            displayPlaceDetails(place); // Display selected place details
        }
    });

    // Click event listener to fetch place details
    map.addListener("click", (event) => {
        if (event.placeId) {
            getPlaceDetails(event.placeId);
            event.stop();
        }
    });

    // Test with a default place ID for debugging
    getPlaceDetails2("ChIJDZDp46EVrjsRgObcqyJbfyA");
}

// Function to adjust map center for visibility of InfoWindow
function adjustMapCenterForInfoWindow(location, map, offsetPx) {
    const scale = Math.pow(2, map.getZoom());
    const worldCoordinateCenter = map.getProjection().fromLatLngToPoint(location);
    const pixelOffset = new google.maps.Point(0, offsetPx / scale);

    const worldCoordinateNewCenter = new google.maps.Point(
        worldCoordinateCenter.x,
        worldCoordinateCenter.y - pixelOffset.y
    );

    const newCenter = map.getProjection().fromPointToLatLng(worldCoordinateNewCenter);
    map.setCenter(newCenter);
}

// Fetch place details from Google Places API
function getPlaceDetails(placeId) {
    service = new google.maps.places.PlacesService(map);
    const request = {
        placeId: placeId,
        fields: ["place_id", "geometry.location", "formatted_address", "name", "rating", "price_level", "user_ratings_total", "photos"]
    };
    service.getDetails(request, (place, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            map.setZoom(15);
            adjustMapCenterForInfoWindow(place.geometry.location, map, 200); // Adjust center for InfoWindow
            marker.setPosition(place.geometry.location); // Update marker
            marker.setVisible(true); // Ensure marker is visible
            displayPlaceDetails(place); // Show place details
        } else {
            console.error("Place details request failed: " + status);
        }
    });
}
// Fetch detailed place information and handle the wait time estimation
async function getWaitTime(place) {
    const placeId = place.place_id;
    const url = 'https://your-server-url/projects/api2/'; // Update this to your server endpoint

    const data = {
        place_id: placeId
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const result = await response.json(); // Get the wait time and converted data
        return {
            converted_data: result.converted_data,
            wait_time: result.wait_time
        };
    } catch (error) {
        console.error('Error fetching wait time:', error);
        return {
            converted_data: null,
            wait_time: null
        };
    }
}

// Display detailed place information and wait time in the InfoWindow
async function displayPlaceDetails(place) {
    const infowindowContent = document.getElementById("infowindow-content");
    const ratingContent = document.getElementById("rating-content");
    const starContainer = document.getElementById("star-rating");
    const typeContainer = document.getElementById("type-content");

    // Fetch estimated wait time from the backend
    const waitTimeData = await getWaitTime(place);

    // Update InfoWindow with place details
    infowindowContent.querySelector("#place-name").textContent = place.name || "Unknown";
    ratingContent.querySelector("#place-rating").textContent = place.rating || "No rating";
    typeContainer.querySelector("#waiting-time").textContent = waitTimeData.wait_time || "No waiting time data";
    document.getElementById("waiting-time2").textContent = waitTimeData.wait_time || "No waiting time data";
    ratingContent.querySelector("#user_ratings_total").textContent = `(${place.user_ratings_total})`;
    ratingContent.querySelector("#place-price-level").textContent = place.price_level ? `${"₹".repeat(place.price_level)}` : "No price info";

    // Display the photos associated with the place (if any)
    if (place.photos && place.photos.length > 0) {
        const width = 400;
        const height = 600; // Set desired image dimensions
        for (let i = 0; i < 10; i++) {
            const photoUrl = place.photos[i].getUrl({ maxWidth: width, maxHeight: height });
            const photoElement = document.getElementById("place-photo" + (i + 1));
            if (photoElement) {
                photoElement.src = photoUrl;
            } else {
                console.error(`Element with id place-photo${i + 1} not found.`);
            }
        }
    } else {
        const fallbackImage = document.getElementById("place-photo1"); // Use fallback image
        if (fallbackImage) {
            fallbackImage.src = ""; // Provide a fallback image or default image
        }
    }

    generateStars(place.rating, starContainer); // Display stars based on rating

    infowindow.setContent(infowindowContent);
    infowindow.open(map, marker);

    globalThis.chartData = waitTimeData.converted_data; // Save chart data for use in graph
    const ctx = document.getElementById('busyChart').getContext('2d');

    manageDayButtons(chartData); // Manage buttons for days
    displayPlaceDetailsGraph(chartData, ctx); // Show graph for busy times
}

// Function to generate star rating based on the place rating
function generateStars(rating, starContainer) {
    starContainer.innerHTML = ""; // Clear previous stars
    const fullStarImg = "https://maps.gstatic.com/consumer/images/icons/2x/ic_star_rate_14.png";
    const halfStarImg = "https://maps.gstatic.com/consumer/images/icons/2x/ic_star_rate_half_14.png";
    const emptyStarImg = "https://your-server/assets/star_rating_blank_img.png";

    for (let i = 1; i <= 5; i++) {
        const starImg = document.createElement("img");
        if (rating >= i) {
            starImg.src = fullStarImg;
        } else if (rating >= i - 0.7) {
            starImg.src = halfStarImg;
        } else {
            starImg.src = emptyStarImg;
        }
        starContainer.appendChild(starImg);
    }
}

// Function to show a slideshow of place images
let slideIndex = 0;
let slideTimer;

function showSlides() {
    const slides = document.getElementsByClassName("mySlides");
    for (let i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
    }

    slideIndex++;
    if (slideIndex > slides.length) {
        slideIndex = 1;
    }

    slides[slideIndex - 1].style.display = "block";
    slideTimer = setTimeout(showSlides, 4000); // Change image every 4 seconds
}

// Manually control the slideshow
function plusSlides(n) {
    clearTimeout(slideTimer); // Stop automatic slideshow
    slideIndex += n;
    showSlidesManually(); // Manually show slides
}

function showSlidesManually() {
    const slides = document.getElementsByClassName("mySlides");
    for (let i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
    }

    if (slideIndex > slides.length) {
        slideIndex = 1;
    } else if (slideIndex < 1) {
        slideIndex = slides.length;
    }

    slides[slideIndex - 1].style.display = "block";
    slideTimer = setTimeout(showSlides, 4000); // Restart automatic slideshow
}

// Render the wait time chart using Chart.js
function displayPlaceDetailsGraph(chartData, ctx) {
    if (busyChart) {
        busyChart.destroy(); // Destroy the old chart if it exists
    }

    const daysOfWeek = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    const today = new Date();
    const dayName = daysOfWeek[today.getDay()]; // Get today's day (e.g., 'mon')

    busyChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['12a', '1a', '2a', '3a', '4a', '5a', '6a', '7a', '8a', '9a', '10a', '11a', '12p', '1p', '2p', '3p', '4p', '5p', '6p', '7p', '8p', '9p', '10p', '11p'],
            datasets: [{
                label: 'Waiting Time',
                data: chartData[dayName], // Data for the current day
                backgroundColor: 'rgba(249, 84, 84, 0.6)', // Bar color
                borderColor: 'rgba(249, 84, 84, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 5, // Maximum wait time level (based on mapping function)
                    ticks: {
                        stepSize: 1,
                        callback: function(value) {
                            const labels = ['0-5 min', '5-10 min', '10-20 min', '20-40 min', '40-60 min', '60-90 min'];
                            return labels[value];
                        }
                    }
                }
            }
        }
    });
}

// Function to update the chart when a different day is selected
function showChart(day) {
    busyChart.data.datasets[0].data = chartData[day] || [];
    busyChart.update();
}

// Dynamically insert day buttons and show chart container if data exists
function manageDayButtons(chartData) {
    const daySelector = document.querySelector('.day-selector');
    const chartContainer = document.querySelector('.chart-container');
    
    if (chartData) {
        daySelector.style.display = 'flex'; // Show buttons if data exists
        chartContainer.style.display = 'block'; // Show chart
    } else {
        daySelector.style.display = 'none';
        chartContainer.style.display = 'none';
    }
}
