const userTab = document.querySelector("[data-userWeather]");
const searchTab = document.querySelector("[data-searchWeather]");
const userContainer = document.querySelector("[weather-container]");
const grantAccessContainer = document.querySelector(
  ".grant-location-container"
);
const searchForm = document.querySelector("[data-searchForm]");
const loadingScreen = document.querySelector(".loading-container");
const userInfoContainer = document.querySelector(".user-info-container");
const apiErrorContainer = document.querySelector(".api-error-container");
const apiErrorImg = document.querySelector("[data-notFoundImg]");
const apiErrorMessage = document.querySelector("[data-apiErrorText]");
const grantAccessButton = document.querySelector("[data-grantAccess]");

//variables needed initially
const API_key = "390ca82a26c94ce3782d64363f6f66fc";

let oldTab = userTab; //by default when we open the website userTab will be opened
oldTab.classList.add("current-tab");
getFromSessionStorage();

function switchTab(newTab) {
  apiErrorContainer.classList.remove("active");
  if (newTab != oldTab) {
    oldTab.classList.remove("current-tab");
    oldTab = newTab;
    oldTab.classList.add("current-tab");

    if (!searchForm.classList.contains("active")) {
      //if search form invisible, then make it visble
      userInfoContainer.classList.remove("active");
      grantAccessContainer.classList.remove("active");
      searchForm.classList.add("active");
    } else {
      //now i am at myWeather tab
      searchForm.classList.remove("active");
      userInfoContainer.classList.remove("active");
      //since i am at myWeather tab,
      //weather is to be display,
      //so let's check my location
      //coordinats and update weather
      getFromSessionStorage();
    }
  }
}

userTab.addEventListener("click", () => {
  // pass clicked tab as input
  switchTab(userTab);
});

searchTab.addEventListener("click", () => {
  // pass clicked tab as input
  switchTab(searchTab);
});

const messageText = document.querySelector("[data-messageText]");

function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition, showError);
  } else {
    grantAccessButton.style.display = "none";
    messageText.innerText = "Geolocation is not supported by this browser.";
  }
}

function showPosition(position) {
  const userCoordinates = {
    lat: position.coords.latitude,
    lon: position.coords.longitude,
  };
  sessionStorage.setItem("user-coordinates", JSON.stringify(userCoordinates));
  fetchUserWeatherInfo(userCoordinates);
}

function showError(error) {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      messageText.innerText = "You denied the request to grant access";
      break;

    case error.POSITION_UNAVAILABLE:
      messageText.innerText = "Location Information is Unavailable";
      break;

    case error.TIMEOUT:
      messageText.innerText = "The request to get user location timed out.";
      break;
    case error.UNKNOWN_ERROR:
      messageText.innerText = "An unknown error occurred.";
      break;
  }
}
// getFromSessionStorage();
grantAccessButton.addEventListener("click", getLocation);

async function fetchUserWeatherInfo(coordinates) {
  const { lat, lon } = coordinates;
  //fetching data so grant access hatao and loading lao
  grantAccessContainer.classList.remove("active");
  loadingScreen.classList.add("active");

  // API call
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_key}&units=metric`
    );
    const data = await response.json();

    //data aa gaya ab loading screen hatao aur userInfo lao jahan par data show karna hai
    loadingScreen.classList.remove("active");
    userInfoContainer.classList.add("active");
    renderWeatherInfo(data);
  } catch (err) {
    loadingScreen.classList.remove("active");
    apiErrorContainer.classList.add("active");
    apiErrorImg.style.display = "none";
    apiErrorMessage.innerText = `Error: ${err?.message}`;
    apiErrorBtn.addEventListener("click", fetchUserWeatherInfo);
  }
}
function renderWeatherInfo(weatherInfo) {
  //first we have to fetch the elements

  const cityName = document.querySelector("[data-cityName");
  const countryIcon = document.querySelector("[data-countryIcon]");
  const desc = document.querySelector("[data-weatherDesc]");
  const weatherIcon = document.querySelector("[data-weatherIcon]");
  const temp = document.querySelector("[data-temp]");
  const windSpeed = document.querySelector("[data-windspeed]");
  const humidity = document.querySelector("[data-humidity]");
  const cloudiness = document.querySelector("[data-cloudiness]");

  //fetch values from weatherInfo object and put it in UI elements

  cityName.innerText = weatherInfo?.name;
  countryIcon.src = `https://flagcdn.com/144x108/${weatherInfo?.sys?.country.toLowerCase()}.png`;
  desc.innerText = weatherInfo?.weather?.[0]?.description;
  weatherIcon.src = `https://openweathermap.org/img/w/${weatherInfo?.weather?.[0]?.icon}.png`;
  temp.innerText = `${weatherInfo?.main?.temp.toFixed(2)} °C`;
  windSpeed.innerText = `${weatherInfo?.wind?.speed.toFixed(2)}m/s`;
  humidity.innerText = `${weatherInfo?.main?.humidity}%`;
  cloudiness.innerText = `${weatherInfo?.clouds?.all}%`;
}

//if my coordinates are already present
function getFromSessionStorage() {
  const localCoordinates = sessionStorage.getItem("user-coordinates");
  if (!localCoordinates) {
    //local coordinates not present
    grantAccessContainer.classList.add("active");
  } else {
    const coordinates = JSON.parse(localCoordinates);
    fetchUserWeatherInfo(coordinates);
  }
}

//searching location

const searchInput = document.querySelector("[data-searchInput]");
searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (searchInput.value === "") {
    return;
  }
  fetchSearchWeatherInfo(searchInput.value);
  searchInput.value = "";
});

async function fetchSearchWeatherInfo(city) {
  loadingScreen.classList.add("active");
  // userInfoContainer.classList.remove("active");
  grantAccessContainer.classList.remove("active");
  apiErrorContainer.classList.remove("active"); 

  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_key}`
    );
    const data = await response.json();

    loadingScreen.classList.remove("active");
    userInfoContainer.classList.add("active");
    renderWeatherInfo(data);
  } catch (e) {
    // console.log("Search - Api Fetch Error", error.message);
    loadingScreen.classList.remove("active");
    userInfoContainer.classList.remove("active");
    apiErrorContainer.classList.add("active");
    apiErrorMessage.innerText = `${e?.message}`;
  }
}
