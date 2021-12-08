/*
API calls
    - use one-call-api <https://openweathermap.org/api/one-call-api>
        - current > current.uvi|.temp|.humidity|.wind_speed|
        - requires lon, lat
        - https://api.openweathermap.org/data/2.5/onecall?lat={lat}&lon={lon}&exclude={part}&appid={API key}
    - get lon, lat from city search
    - api.openweathermap.org/data/2.5/weather?q={city},{state}&appid={API_KEY}
    - 5-day forecast format
        - api.openweathermap.org/data/2.5/forecast?q={city name}&appid={API key}

    - temp units is kelvin. 
    - formula to convert to farenheit is: (k - 273.15) * 1.8 + 32

*/

$(document).ready(function () {


    // global variables
    const apiKey = config.API_KEY;
    var searchHistory = [];

    function saveHistory() {
        localStorage.setItem('location-history', JSON.stringify(searchHistory));
    }

    function loadHistory() {
        var h = JSON.parse(localStorage.getItem('location-history'));
        if (!h) {
            return false;

        } 

        searchHistory = h;
        $("#history").html('');
        console.log($("#history").innerHTML)
        searchHistory.map(function (location) {
            makeHistory(location);
        })
    }
    
    function makeHistory(location) {
        $("#history").append('<li>').addClass('btn btn-secondary mt-2').text(location)
    }

    loadHistory();

    // refs to static html elements
    // search, location buttons, city stats, forecast

    // Get weather data
    function getWeatherData(location) {
        location = location.trim();
        if (!location) {
            return false
        } 
        var state = '';
        if (location.split(',')) {
            state = ',' + location.split(',')[1]
        }

        // make api url
        var apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${location}${state}&appid=${apiKey}`

        // fetch request
        fetch(apiUrl).then(function (response) {
            // response validation
            if (response.ok) {
                // parse response
                response.json().then(function (data) {
                    showCurrentWeather(data, location, state);
                })
            } else {
                console.log('response error: ' + response.status);
            }
        })

        

    }

    $('#search-form').submit(function (e) {
        e.preventDefault();
        var location = $('#search').val();
        console.log('location: ' + location);
        getWeatherData(location);
        searchHistory.push(location);
        if (searchHistory.length > 5) {
            searchHistory.shift();
        }
        saveHistory();

    })
    
    // get location coords
    function getLocationCoords(location) {
        // location is a city object
        var lat = location.coord.lat
        var lon = location.coord.lon
        var apiUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&appid=${apiKey}`
        fetch(apiUrl).then(function (response) {
            if (response.ok) {
                response.json().then(function (data) {
                    showForecast(data);
                })
            }
        })
    }
    
    function convertKtoF(kelvin) {
        var farenheit = ((kelvin - 273.15) * 1.8 + 32).toFixed(1)
        return farenheit
    }

    // show info panel 
    function showCurrentWeather(weather, location, _state) {

        var titleText = `Showing results for ${weather.name}, ${weather.sys.country} ${'today'}`

        replaceLocationSrc(`${location}`)

        $("#current-weather h2").text(titleText)

        // console.log("showCurrentWeather executed", location, weather);
        var temp = convertKtoF(weather.main.temp)
        // var temp = weather.main.temp // convertKtoF(weather.main.temp)
        var wind = weather.wind.speed
        var humidity = weather.main.humidity
        var uvi = '0.5'

        $('#current-temp span').text(temp);
        $('#current-wind span').text(wind);
        $('#current-humidity span').text(humidity);
        getLocationCoords(weather);
    }
    // show forecast 
    function showForecast(data) {
        // console.log('showForecast executed', data)
    }

    function replaceLocationSrc(location) {
        var src = $("#map iframe")[0]
        location = location.split(' ').join('');
        var regEx = /q=[\D\s]*(?=&)/g
        var srcText = $(src).attr('src').replace(regEx, 'q='+location)
        console.log('replaceLocationSrc', srcText)
        $(src).attr('src', srcText);
    }

})
