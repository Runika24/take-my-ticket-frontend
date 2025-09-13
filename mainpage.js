import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";


const firebaseConfig = {
  apiKey: "AIzaSyAdXXy4jYYT9sDmmhPBHI7_3Hu0EcUSueE",
  authDomain: "login-5e8c0.firebaseapp.com",
  projectId: "login-5e8c0",
  storageBucket: "login-5e8c0.firebasestorage.app",
  messagingSenderId: "242371998320",
  appId: "1:242371998320:web:1d72af75baad90ef34bab5"
};


const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
auth.languageCode = 'en';
const provider = new GoogleAuthProvider();


let moviesData = [];
let trendingData = [];
let autoScrollInterval;


const CONFIG = {
  API_BASE_URL: 'https://json-backend-take-my-ticket.onrender.com',
  SCROLL_DISTANCE: 250,
  AUTO_SCROLL_INTERVAL: 3000,
  ERROR_DISPLAY_TIME: 5000
};


function showSpinner() {
  const spinner = document.getElementById('spinner');
  if (spinner) {
    spinner.style.display = 'flex';
  }
}

function hideSpinner() {
  const spinner = document.getElementById('spinner');
  if (spinner) {
    spinner.style.display = 'none';
  }
}

function showError(message, container = document.body) {

  const existingErrors = container.querySelectorAll('.error-message');
  existingErrors.forEach(error => error.remove());

  const errorDiv = document.createElement('div');
  errorDiv.className = 'error-message';
  errorDiv.textContent = `Error: ${message}`;
  errorDiv.style.cssText = 'color: red; font-weight: bold; margin: 10px; padding: 10px; background: #ffe6e6; border-radius: 5px; border: 1px solid #ffcccc;';
  container.appendChild(errorDiv);
  
 
  setTimeout(() => {
    if (errorDiv.parentNode) {
      errorDiv.parentNode.removeChild(errorDiv);
    }
  }, CONFIG.ERROR_DISPLAY_TIME);
}

function showSuccess(message, container = document.body) {
  const successDiv = document.createElement('div');
  successDiv.className = 'success-message';
  successDiv.textContent = message;
  successDiv.style.cssText = 'color: green; font-weight: bold; margin: 10px; padding: 10px; background: #e6ffe6; border-radius: 5px; border: 1px solid #ccffcc;';
  container.appendChild(successDiv);
  
  setTimeout(() => {
    if (successDiv.parentNode) {
      successDiv.parentNode.removeChild(successDiv);
    }
  }, CONFIG.ERROR_DISPLAY_TIME);
}


function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}


function initializeAuth() {
  const googleLogin = document.getElementById("google-login");
  
  if (!googleLogin) {
    console.warn('Google login button not found');
    return;
  }
  
  
  updateLoginUI();
  
  googleLogin.addEventListener("click", handleGoogleLogin);
  

  onAuthStateChanged(auth, handleAuthStateChange);
}

async function handleGoogleLogin() {
  const googleLogin = document.getElementById("google-login");
  
  try {
  
    if (googleLogin) {
      googleLogin.disabled = true;
      googleLogin.textContent = 'Signing in...';
    }
    
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    
    console.log('Login successful:', user.displayName);
    showSuccess("Login successful!");
    
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("userInfo", JSON.stringify({
      name: user.displayName,
      email: user.email,
      photoURL: user.photoURL
    }));
    
    updateLoginUI();
    
  } catch (error) {
    console.error('Login error:', error);
    showError("Login failed. Please try again.");
  } finally {
    
    if (googleLogin) {
      googleLogin.disabled = false;
      googleLogin.textContent = 'Login with Google';
    }
  }
}

function handleAuthStateChange(user) {
  const loginButton = document.getElementById("loginButton");
  
  if (user) {
    console.log("User is logged in:", user.displayName);
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("userInfo", JSON.stringify({
      name: user.displayName,
      email: user.email,
      photoURL: user.photoURL
    }));
    
    if (loginButton) loginButton.style.display = "none";
  } else {
    console.log("No user is logged in.");
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userInfo");
    
    if (loginButton) loginButton.style.display = "block";
  }
  
  updateLoginUI();
}

function updateLoginUI() {
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const loginBtn = document.getElementById("google-login");
  const loginButton = document.getElementById("loginButton");
  
  if (loginBtn) {
    loginBtn.style.display = isLoggedIn ? "none" : "block";
  }
  
  if (loginButton) {
    loginButton.style.display = isLoggedIn ? "none" : "block";
  }
}


async function fetchMovies() {
  try {
    showSpinner();
    const response = await fetch(`${CONFIG.API_BASE_URL}/movies`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const movies = await response.json();
    
    if (!Array.isArray(movies)) {
      throw new Error('Invalid movies data format');
    }
    
    moviesData = movies;
    renderMovieCards(movies);
    setupAutoScroll();
    
  } catch (error) {
    console.error('Error fetching movies:', error);
    showError('Failed to load movies. Please check if the server is running.');
    
    
    const fallbackMovies = [
      {
        id: 1,
        title: "Sample Movie 1",
        image: "https://via.placeholder.com/200x200?text=Movie+1",
        genre: "Action",
        language: "English",
        duration: 120
      },
      {
        id: 2,
        title: "Sample Movie 2", 
        image: "https://via.placeholder.com/200x200?text=Movie+2",
        genre: "Comedy",
        language: "Hindi",
        duration: 140
      }
    ];
    
    moviesData = fallbackMovies;
    renderMovieCards(fallbackMovies);
    setupAutoScroll();
    
  } finally {
    hideSpinner();
  }
}

async function fetchTrending() {
  try {
    const response = await fetch(`${CONFIG.API_BASE_URL}/trending`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const trending = await response.json();
    
    if (!Array.isArray(trending)) {
      throw new Error('Invalid trending data format');
    }
    
    trendingData = trending;
    return trending;
    
  } catch (error) {
    console.error('Error fetching trending:', error);
    showError('Failed to load trending events. Please check if the server is running.');
    
    
    const fallbackData = [
      {
        id: 1,
        title: "Sample Event",
        image: "https://via.placeholder.com/200x200?text=Event",
        venue: "Sample Venue",
        date: "2025-07-01",
        time: "7:00 PM",
        availableTickets: 50,
        price: 25
      }
    ];
    
    trendingData = fallbackData;
    return fallbackData;
  }
}


function renderMovieCards(movies) {
  const scrollContainer = document.querySelector('.categories');
  if (!scrollContainer) {
    console.error('Categories container not found');
    return;
  }
  
  scrollContainer.innerHTML = '';
  
  if (!movies || movies.length === 0) {
    scrollContainer.innerHTML = '<p style="text-align: center; padding: 20px; color: #666;">No movies available</p>';
    return;
  }
  
  movies.forEach(movie => {
    const card = document.createElement('div');
    card.className = 'movie-card';
    card.style.cursor = 'pointer';
    
    card.innerHTML = `
      <img src="${movie.image || 'https://via.placeholder.com/200x200?text=No+Image'}" 
           alt="${movie.title || 'Movie'}" 
           onerror="this.src='https://via.placeholder.com/200x200?text=Error'" />
      <div class="movie-card-content">
        <div class="movie-card-title">${movie.title || 'Unknown Title'}</div>
        <div class="movie-card-small">
          ${movie.genre || 'Unknown'} | ${movie.language || 'Unknown'} | ${movie.duration || 0} min
        </div>
      </div>
    `;
    
   
    card.addEventListener('click', () => {
      console.log('Movie clicked:', movie.title);
      showEventDetails(movie.id || movie.title);
    });
    card.addEventListener('mouseenter', () => {
      card.style.transform = 'scale(1.05)';
      card.style.transition = 'transform 0.3s ease';
    });
    
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'scale(1)';
    });
    
    scrollContainer.appendChild(card);
  });
}

function renderTrending(trending) {
  const container = document.getElementById('trendings-list');
  if (!container) {
    console.error('Trending list container not found');
    return;
  }
  
  container.innerHTML = '';
  
  if (!trending || trending.length === 0) {
    container.innerHTML = '<p style="text-align: center; padding: 20px; color: #666;">No trending events available</p>';
    return;
  }
  
  trending.forEach(item => {
    const card = document.createElement('div');
    card.className = 'card';
    card.style.cursor = 'pointer';
    
    if (item.title && !item.venue) {
     
      card.innerHTML = `
        <img src="${item.image || 'https://via.placeholder.com/200x200?text=No+Image'}" 
             alt="${item.title}" 
             onerror="this.src='https://via.placeholder.com/200x200?text=Error'" />
        <div class="card-content">
          <div class="card-title">${item.title}</div>
          <div class="card-small">${item.genre || 'Unknown'} | ${item.language || 'Unknown'} | ${item.duration || 0} min</div>
        </div>
      `;
    } else {
      
      card.innerHTML = `
        <img src="${item.image || 'https://via.placeholder.com/200x200?text=Event'}" 
             alt="Event Image" 
             onerror="this.src='https://via.placeholder.com/200x200?text=Error'" />
        <div class="card-content">
          <div class="card-title">${item.venue || item.title || 'Unknown Event'}</div>
          <div class="card-small">${item.date || 'TBD'} @ ${item.time || 'TBD'}</div>
          <div class="card-small">Tickets: ${item.availableTickets || 0} | $${item.price || 0}</div>
        </div>
      `;
    }
    
    card.addEventListener('click', () => {
      console.log('Trending item clicked:', item);
      if (item.title && !item.venue) {
        showEventDetails(item.id || item.title);
      } else {
        showEventDetails(item.id || item.venue);
      }
    });
    
    
    card.addEventListener('mouseenter', () => {
      card.style.transform = 'scale(1.02)';
      card.style.transition = 'transform 0.3s ease';
    });
    
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'scale(1)';
    });
    
    container.appendChild(card);
  });
}


async function searchFunction() {
  const searchInput = document.getElementById('searchInput');
  const searchTerm = searchInput ? searchInput.value.trim() : '';
  
  console.log('Search triggered with term:', searchTerm);
  
  
  const dataDisplay = document.getElementById("data_display");
  const displayContent = document.getElementById("display_content");
  
  if (dataDisplay) dataDisplay.style.display = "block";
  if (displayContent) displayContent.style.display = "none";
  
  try {
    
    const trending = await fetchTrending();
    
   
    let filteredData = trending;
    if (searchTerm) {
      filteredData = trending.filter(item => {
        const title = (item.title || item.venue || '').toLowerCase();
        const genre = (item.genre || '').toLowerCase();
        const venue = (item.venue || '').toLowerCase();
        const language = (item.language || '').toLowerCase();
        
        const searchLower = searchTerm.toLowerCase();
        
        return title.includes(searchLower) ||
               genre.includes(searchLower) ||
               venue.includes(searchLower) ||
               language.includes(searchLower);
      });
    }
    
    renderTrending(filteredData);
    
   
    const heading = document.querySelector('#data_display h2');
    if (heading) {
      if (searchTerm) {
        heading.textContent = `🔍 Search Results for "${searchTerm}" (${filteredData.length} found)`;
      } else {
        heading.textContent = `🔥 Trending Events (${filteredData.length} events)`;
      }
    }
    
   
    if (filteredData.length === 0 && searchTerm) {
      const container = document.getElementById('trendings-list');
      if (container) {
        container.innerHTML = `
          <div style="text-align: center; padding: 40px; color: #666;">
            <h3>No results found for "${searchTerm}"</h3>
            <p>Try searching with different keywords or browse our trending events.</p>
            <button onclick="clearSearch()" style="margin-top: 10px; padding: 10px 20px; background: #ff1659; color: white; border: none; border-radius: 5px; cursor: pointer;">
              Show All Events
            </button>
          </div>
        `;
      }
    }
    
  } catch (error) {
    console.error('Search error:', error);
    showError('Failed to perform search. Please try again.');
  }
}


window.clearSearch = function() {
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.value = '';
    searchFunction();
  }
};


function setupScrollButtons() {
  const scrollContainer = document.querySelector('.categories');
  const leftBtn = document.querySelector('.scroll-btn.left');
  const rightBtn = document.querySelector('.scroll-btn.right');
  
  if (!leftBtn || !rightBtn || !scrollContainer) {
    console.warn('Scroll elements not found');
    return;
  }
  
  leftBtn.addEventListener('click', () => {
    scrollContainer.scrollBy({ left: -CONFIG.SCROLL_DISTANCE, behavior: 'smooth' });
  });
  
  rightBtn.addEventListener('click', () => {
    scrollContainer.scrollBy({ left: CONFIG.SCROLL_DISTANCE, behavior: 'smooth' });
  });
  

  function updateScrollButtons() {
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainer;
    
    leftBtn.style.opacity = scrollLeft <= 0 ? '0.5' : '1';
    leftBtn.disabled = scrollLeft <= 0;
    
    rightBtn.style.opacity = scrollLeft + clientWidth >= scrollWidth - 1 ? '0.5' : '1';
    rightBtn.disabled = scrollLeft + clientWidth >= scrollWidth - 1;
  }
  
  scrollContainer.addEventListener('scroll', updateScrollButtons);
  updateScrollButtons(); 
  
  
  scrollContainer.addEventListener('wheel', (e) => {
    if (e.deltaY !== 0) {
      e.preventDefault();
      scrollContainer.scrollBy({ left: e.deltaY > 0 ? 100 : -100, behavior: 'smooth' });
    }
  });
}

function setupAutoScroll() {
 
  if (autoScrollInterval) {
    clearInterval(autoScrollInterval);
  }
  
  const container = document.querySelector('.categories');
  if (!container) return;
  
  autoScrollInterval = setInterval(() => {
    const { scrollLeft, scrollWidth, clientWidth } = container;
    
    if (scrollLeft + clientWidth >= scrollWidth - 1) {
      
      container.scrollTo({ left: 0, behavior: 'smooth' });
    } else {
      container.scrollBy({ left: 220, behavior: 'smooth' });
    }
  }, CONFIG.AUTO_SCROLL_INTERVAL);
}


function stopAutoScroll() {
  if (autoScrollInterval) {
    clearInterval(autoScrollInterval);
    autoScrollInterval = null;
  }
}


function setupEventHandlers() {
 
  const searchInput = document.getElementById('searchInput');
  const searchForm = document.getElementById("search-form");
  
  if (searchInput) {
    
    const debouncedSearch = debounce(searchFunction, 500);
    searchInput.addEventListener('input', debouncedSearch);
    
    
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        searchFunction();
      }
    });
  }
  
  if (searchForm) {
    searchForm.addEventListener("submit", function(event) {
      event.preventDefault();
      searchFunction();
    });
  }
  

  const categoriesContainer = document.querySelector('.categories');
  if (categoriesContainer) {
    categoriesContainer.addEventListener('mouseenter', stopAutoScroll);
    categoriesContainer.addEventListener('mouseleave', setupAutoScroll);
    categoriesContainer.addEventListener('touchstart', stopAutoScroll);
  }
}

window.searchFunction = searchFunction;

window.createEvent = function() {
  console.log('Create event clicked');
  window.location.href = './landing.html';
};

window.viewEvents = function() {
  console.log('View events clicked');
  searchFunction();
};

window.viewResaleEvents = function() {
  console.log('View resale events clicked');
 
  searchByCategory('resale');
};

window.hoverBtn = function(btn) {
  btn.style.backgroundColor = '#d91448';
  btn.style.transform = 'scale(1.05)';
  btn.style.transition = 'all 0.3s ease';
};

window.unhoverBtn = function(btn) {
  btn.style.backgroundColor = '#ff1659';
  btn.style.transform = 'scale(1)';
};


window.showEventDetails = function(eventId) {
  console.log(`Showing details for event: ${eventId}`);
 
  if (eventId) {
    window.location.href = `./event-details.html?id=${encodeURIComponent(eventId)}`;
  } else {
    showError('Event details not available');
  }
};

window.bookTicket = function(eventId, ticketType = 'regular') {
  console.log(`Booking ticket for event: ${eventId}, type: ${ticketType}`);
  
  const isLoggedIn = localStorage.getItem("isLoggedIn");
  if (isLoggedIn !== "true") {
    showError("Please login to book tickets");
    return;
  }
  
  if (!eventId) {
    showError("Invalid event selected");
    return;
  }
  
  window.location.href = `./booking.html?event=${encodeURIComponent(eventId)}&type=${encodeURIComponent(ticketType)}`;
};

window.logout = function() {
  console.log('Logging out user...');
  
  try {
    
    auth.signOut().then(() => {
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("userInfo");
      
      updateLoginUI();
      showSuccess('You have been logged out successfully');
      
      
      setTimeout(() => {
        window.location.reload();
      }, 1500);
      
    }).catch((error) => {
      console.error('Logout error:', error);
      showError('Error logging out. Please try again.');
    });
    
  } catch (error) {
    console.error('Logout error:', error);
   
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userInfo");
    updateLoginUI();
    showSuccess('You have been logged out successfully');
  }
};

window.searchByCategory = function(category) {
  console.log(`Searching by category: ${category}`);
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.value = category;
    searchFunction();
  }
};


document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded, initializing...');
  
  try {
   
    initializeAuth();
    
    
    setupScrollButtons();
    
    
    setupEventHandlers();
    
   
    fetchMovies();
    
    console.log('Initialization complete');
    
  } catch (error) {
    console.error('Initialization error:', error);
    showError('Failed to initialize the application properly.');
  }
});


document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    console.log('Page became visible, refreshing data...');
   
    if (moviesData.length === 0) {
      fetchMovies();
    }
  } else {
    
    stopAutoScroll();
  }
});


window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  showError('An unexpected error occurred. Please refresh the page.');
  event.preventDefault();
});


window.addEventListener('online', () => {
  showSuccess('Connection restored');
 
});

window.addEventListener('offline', () => {
  showError('No internet connection. Some features may not work.');
});

console.log('Enhanced mainpage.js loaded successfully');