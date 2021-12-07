/*
API calls
    - use one-call-api <https://openweathermap.org/api/one-call-api>
        - current > current.uvi|.temp|.humidity|.wind_speed|
        - requires lon, lat
        - https://api.openweathermap.org/data/2.5/onecall?lat={lat}&lon={lon}&exclude={part}&appid={API key}
    - get lon, lat from city search
    - api.openweathermap.org/data/2.5/weather?q={city},{state}&appid={API_KEY}

*/ 

// global variables
var apiKey = config.API_KEY

// refs to static html elements
// search, location buttons, city stats, forecast


// Get weather data
function getWeatherData(location) {
    // make api url
    var apiUrl = 'api.openweathermap.org/data/2.5/weather?q=' + location + '&appid=' + apiKey
    // fetch request
    // response validation
    // parse response
 
}

// get location coords

// show info panel 
// show forecast 
