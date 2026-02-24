const { ipcRenderer } = require('electron');

const searchBtn = document.getElementById('searchBtn');
const cityInput = document.getElementById('cityInput');
const resultDiv = document.getElementById('result');
const itineraryBtn = document.getElementById('itineraryBtn');

let currentCity = '';

searchBtn.addEventListener('click', () => {
    const city = cityInput.value.trim();
    
    if (city === '') {
        alert('Please enter a city name');
        return;
    }
    
    getWeatherData(city);
});

cityInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        searchBtn.click();
    }
});

function getWeatherData(city) {
    resultDiv.innerHTML = '<p class="placeholder">Loading weather data...</p>';
    
    const apiKey = '9fd7a449d055dba26a982a3220f32aa2';
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`;
    
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('City not found');
            }
            return response.json();
        })
        .then(data => {
            currentCity = data.name;
            
            const tempCelsius = (data.main.temp - 273.15).toFixed(1);
            const feelsLikeCelsius = (data.main.feels_like - 273.15).toFixed(1);
            const humidity = data.main.humidity;
            const pressure = data.main.pressure;
            const windSpeed = data.wind.speed;
            const weatherDesc = data.weather[0].description;
            const country = data.sys.country;
            
            let activityRecommendation = '';
            let rainRisk = '';
            let temperatureAdvice = '';
            
            if (data.weather[0].main.includes('Rain') || weatherDesc.includes('rain')) {
                rainRisk = 'High risk of rain - Indoor activities recommended';
                activityRecommendation = 'Visit museums, cafes, shopping malls';
            } else {
                rainRisk = 'Low risk of rain - Outdoor activities possible';
            }
            
            if (tempCelsius > 30) {
                temperatureAdvice = 'Very hot - Stay hydrated, avoid midday sun';
                if (!rainRisk.includes('High')) {
                    activityRecommendation = 'Consider swimming or indoor activities';
                }
            } else if (tempCelsius > 25) {
                temperatureAdvice = 'Warm weather - Good for outdoor activities';
                if (!rainRisk.includes('High')) {
                    activityRecommendation = 'Good for walking tours or outdoor cafes';
                }
            } else if (tempCelsius > 20) {
                temperatureAdvice = 'Pleasant weather - Ideal for outdoor activities';
                if (!rainRisk.includes('High')) {
                    activityRecommendation = 'Great for hiking or sightseeing';
                }
            } else if (tempCelsius > 15) {
                temperatureAdvice = 'Cool weather - Light jacket recommended';
                if (!rainRisk.includes('High')) {
                    activityRecommendation = 'Good for cycling or outdoor markets';
                }
            } else {
                temperatureAdvice = 'Cold weather - Warm clothing needed';
                if (!rainRisk.includes('High')) {
                    activityRecommendation = 'Consider indoor activities like cafes';
                }
            }
            
            let windAdvice = '';
            if (windSpeed > 10) {
                windAdvice = 'Very windy - Be careful outdoors';
            } else if (windSpeed > 5) {
                windAdvice = 'Breezy - Pleasant for outdoor activities';
            }
            
            resultDiv.innerHTML = `
                <div class="weather-card">
                    <h3>${data.name}, ${country}</h3>
                    
                    <div class="weather-detail">
                        <p><strong>Temperature:</strong> ${tempCelsius}°C</p>
                        <p><strong>Feels like:</strong> ${feelsLikeCelsius}°C</p>
                        <p><strong>Humidity:</strong> ${humidity}%</p>
                        <p><strong>Pressure:</strong> ${pressure} hPa</p>
                        <p><strong>Wind Speed:</strong> ${windSpeed} m/s</p>
                        <p><strong>Weather:</strong> ${weatherDesc}</p>
                    </div>
                    
                    <div class="recommendation">
                        <h4>Decision Support & Recommendations</h4>
                        <p><strong>Rain Risk:</strong> ${rainRisk}</p>
                        <p><strong>Temperature Advice:</strong> ${temperatureAdvice}</p>
                        ${windAdvice ? `<p><strong>Wind Advice:</strong> ${windAdvice}</p>` : ''}
                        <p><strong>Recommended Activity:</strong> ${activityRecommendation}</p>
                    </div>
                </div>
            `;
            
            itineraryBtn.style.display = 'block';
        })
        .catch(error => {
            resultDiv.innerHTML = `<p class="placeholder">Error: ${error.message}</p>`;
            itineraryBtn.style.display = 'none';
        });
}

itineraryBtn.addEventListener('click', () => {
    ipcRenderer.send('open-itinerary-window', currentCity);
});