/* ============================================
   GLOBALS
============================================ */
let currentCity = "Jakarta";
let currentUnit = "C";
let favoriteCities = [];
let autoRefreshInterval = null;

/* ============================================
   POPULAR CITIES (AUTOCOMPLETE)
============================================ */
const popularCities = [
  "Jakarta", "Bandung", "Surabaya", "Medan", "Semarang",
  "Makassar", "Palembang", "Tangerang", "Depok", "Bekasi",
  "London", "Tokyo", "Dubai", "New York", "Singapore",
  "Paris", "Seoul", "Bangkok",
];

/* ============================================
   LOAD INIT
============================================ */
window.onload = () => {
  loadFavorites();
  document.getElementById("cityInput").value = currentCity;
  searchWeather();
  startAutoRefresh();
};

/* ============================================
   AUTO REFRESH SETIAP 5 MENIT
============================================ */
function startAutoRefresh() {
  if (autoRefreshInterval) clearInterval(autoRefreshInterval);
  autoRefreshInterval = setInterval(() => {
    console.log("Auto-refreshing weather data...");
    fetchWeather(currentCity);
  }, 5 * 60 * 1000);
}

/* ============================================
   AUTOCOMPLETE
============================================ */
function handleSearch(e) {
  const val = e.target.value.toLowerCase();
  const res = document.getElementById("autocompleteResults");

  if (val.length < 2) return res.classList.add("hidden");

  const matches = popularCities.filter((c) =>
    c.toLowerCase().includes(val)
  );

  res.innerHTML = matches
    .map(
      (c) =>
        `<div onclick="selectCity('${c}')" class="px-4 md:px-6 py-3 md:py-4 hover:bg-purple-600/30 cursor-pointer transition-all font-semibold border-b border-purple-500/20 last:border-b-0 text-sm md:text-base">${c}</div>`
    )
    .join("");

  res.classList.remove("hidden");
}

function handleEnterKey(e) {
  if (e.key === "Enter") {
    searchWeather();
  }
}

function selectCity(city) {
  document.getElementById("cityInput").value = city;
  document.getElementById("autocompleteResults").classList.add("hidden");
  searchWeather();
}

/* ============================================
   LOAD CITY WEATHER (OPEN-METEO)
============================================ */
async function searchWeather() {
  const city = document.getElementById("cityInput").value.trim();
  if (!city) {
    showError("Please enter a city name!");
    return;
  }

  currentCity = city;
  fetchWeather(city);
}

async function fetchWeather(city) {
  showLoading(true);
  hideError();

  try {
    const geo = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1&language=en`
    );
    const geoData = await geo.json();

    if (!geoData.results || geoData.results.length === 0) {
      showLoading(false);
      showError(`City "${city}" not found`);
      showDashboard(false);
      return;
    }

    const result = geoData.results[0];
    const { latitude, longitude, country } = result;

    currentCity = result.name;
    document.getElementById("cityInput").value = result.name;

    const tempUnit = currentUnit === "C" ? "celsius" : "fahrenheit";
    const weatherRes = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&temperature_unit=${tempUnit}&hourly=visibility,pressure_msl,cloudcover,relativehumidity_2m&daily=temperature_2m_max,temperature_2m_min,weathercode&forecast_days=5&timezone=auto`
    );

    const data = await weatherRes.json();

    updateCurrentWeather(data, result.name, country);
    updateForecast(data);

    showLoading(false);
    hideError();
    showDashboard(true);
  } catch (err) {
    showError("Error loading weather data: " + err.message);
    showLoading(false);
    showDashboard(false);
  }
}

/* ============================================
   UPDATE CURRENT WEATHER
============================================ */
function updateCurrentWeather(data, city, country) {
  const w = data.current_weather;

  document.getElementById("locationInfo").textContent = `${city}, ${country}`;
  document.getElementById("currentTempValue").textContent = Math.round(w.temperature) + "°";
  document.getElementById("feelsLike").textContent = Math.round(w.temperature) + "°";
  document.getElementById("weatherCondition").textContent = weatherDescription(w.weathercode);
  document.getElementById("currentEmoji").textContent = weatherEmoji(w.weathercode);
  document.getElementById("humidity").textContent = data.hourly.relativehumidity_2m[0] + "%";

  const windSpeedKmh = currentUnit === "C" ? w.windspeed : (w.windspeed * 0.621371).toFixed(1);
  const windUnit = currentUnit === "C" ? "km/h" : "mph";
  document.getElementById("windSpeed").textContent = windSpeedKmh + " " + windUnit;

  const windDirection = w.winddirection !== undefined ? getWindDirection(w.winddirection) : "N/A";
  document.getElementById("windDir").textContent = windDirection;

  const visibilityKm = data.hourly.visibility[0] ? (data.hourly.visibility[0] / 1000).toFixed(1) : "N/A";
  document.getElementById("visibility").textContent = visibilityKm + " km";

  document.getElementById("pressure").textContent = data.hourly.pressure_msl[0] + " mb";
  document.getElementById("cloudCover").textContent = data.hourly.cloudcover[0] + "%";

  const now = new Date();
  document.getElementById("lastUpdate").textContent =
    "Last updated: " +
    now.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
}

/* ============================================
   WIND DIRECTION
============================================ */
function getWindDirection(deg) {
  const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const index = Math.round(deg / 45) % 8;
  return directions[index];
}

/* ============================================
   FORECAST 5 DAYS
============================================ */
function updateForecast(data) {
  const container = document.getElementById("forecastGrid");
  container.innerHTML = "";

  data.daily.time.slice(0, 5).forEach((date, i) => {
    const dayName = new Date(date).toLocaleDateString("en-US", {
      weekday: "short",
    });

    container.innerHTML += `
      <div class="glass-card rounded-xl md:rounded-2xl p-4 md:p-6 text-center forecast-card">
        <div class="font-bold text-sm md:text-lg mb-2 md:mb-3">${dayName}</div>
        <div class="text-4xl md:text-6xl mb-2 md:mb-3">${weatherEmoji(data.daily.weathercode[i])}</div>
        <div class="text-xs md:text-sm text-white/70 mb-2 md:mb-3">${weatherDescription(data.daily.weathercode[i])}</div>
        <div class="space-y-1">
          <div class="text-xs md:text-sm">Max: <span class="font-bold text-lg md:text-xl">${Math.round(data.daily.temperature_2m_max[i])}°</span></div>
          <div class="text-xs md:text-sm">Min: <span class="font-bold text-lg md:text-xl">${Math.round(data.daily.temperature_2m_min[i])}°</span></div>
        </div>
      </div>
    `;
  });
}

/* ============================================
   WEATHER CODE → DESCRIPTION / EMOJI
============================================ */
function weatherEmoji(code) {
  if (code === 0) return "☀️";
  if ([1, 2].includes(code)) return "⛅";
  if ([3].includes(code)) return "☁️";
  if ([51, 61, 80].includes(code)) return "🌦️";
  if ([63, 65, 81].includes(code)) return "🌧️";
  if (code >= 95) return "⛈️";
  return "☁️";
}

function weatherDescription(code) {
  if (code === 0) return "Sunny";
  if ([1, 2].includes(code)) return "Partly Cloudy";
  if ([3].includes(code)) return "Cloudy";
  if ([51, 61, 80].includes(code)) return "Light Rain";
  if ([63, 65, 81].includes(code)) return "Rain";
  if (code >= 95) return "Thunderstorm";
  return "Unknown";
}

/* ============================================
   FAVORITES
============================================ */
function loadFavorites() {
  favoriteCities = JSON.parse(localStorage.getItem("favoriteCities") || "[]");
  renderFavorites();
}

function saveFavorites() {
  localStorage.setItem("favoriteCities", JSON.stringify(favoriteCities));
}

function renderFavorites() {
  const container = document.getElementById("favoriteCities");
  const noFavMsg = document.getElementById("noFavorites");

  if (favoriteCities.length === 0) {
    container.innerHTML = "";
    noFavMsg.classList.remove("hidden");
  } else {
    noFavMsg.classList.add("hidden");
    container.innerHTML = favoriteCities
      .map(
        (c) => `
          <div class="flex items-center gap-2 px-3 md:px-4 py-2 bg-purple-600/40 rounded-lg md:rounded-xl hover:bg-purple-500/50 transition-all border border-purple-400/30">
            <button onclick="selectCity('${c}')" class="font-semibold hover:text-purple-200 transition-colors text-sm md:text-base truncate">
              ${c}
            </button>
            <button onclick="removeFavorite('${c}')" class="text-red-400 hover:text-red-300 font-bold text-lg md:text-xl transition-all hover:scale-125 flex-shrink-0" title="Remove">
              ×
            </button>
          </div>
        `
      )
      .join("");
  }
}

function addCurrentToFavorite() {
  if (!currentCity) {
    showError("Please search for a city first!");
    return;
  }

  if (favoriteCities.includes(currentCity)) {
    showError(`${currentCity} is already in your favorites!`);
    return;
  }

  favoriteCities.push(currentCity);
  saveFavorites();
  renderFavorites();
  hideError();

  const btn = document.getElementById("addFavBtn");
  btn.style.transform = "scale(1.3)";
  setTimeout(() => {
    btn.style.transform = "scale(1)";
  }, 300);
}

function removeFavorite(city) {
  favoriteCities = favoriteCities.filter((c) => c !== city);
  saveFavorites();
  renderFavorites();
}

/* ============================================
   TOGGLE UNIT
============================================ */
function toggleUnit() {
  currentUnit = currentUnit === "C" ? "F" : "C";
  fetchWeather(currentCity);
}

/* ============================================
   TOOLS
============================================ */
function showLoading(isLoading) {
  document.getElementById("loadingIndicator").classList.toggle("hidden", !isLoading);
}

function showDashboard(show) {
  document.getElementById("weatherDashboard").classList.toggle("hidden", !show);
}

function showError(message) {
  document.getElementById("errorText").textContent = message;
  document.getElementById("errorMessage").classList.remove("hidden");
}

function hideError() {
  document.getElementById("errorMessage").classList.add("hidden");
}

function toggleTheme() {
  document.documentElement.classList.toggle("dark");
  localStorage.setItem(
    "theme",
    document.documentElement.classList.contains("dark") ? "dark" : "light"
  );
}

function refreshWeather() {
  searchWeather();
}

// Load saved theme
if (localStorage.getItem("theme") === "dark") {
  document.documentElement.classList.add("dark");
}