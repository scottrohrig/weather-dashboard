/* API syntax
    - https://api.openweathermap.org/data/2.5/onecall?lat={lat}&lon={lon}&exclude={part}&appid={API key}
    - api.openweathermap.org/data/2.5/weather?q={city},{state}&appid={API_KEY}
*/

$(document).ready(function () {
    // global variables
    const apiKey = '79a5c12694ccbadc732bbe05c679a716';
    var searchHistory = [];

    // storage handling
    function saveHistory() {
        localStorage.setItem("location-history", JSON.stringify(searchHistory));
    }

    function loadHistory() {
        var h = JSON.parse(localStorage.getItem("location-history"));
        if (!h) {
            return false;
        }
        searchHistory = h;
        $("#history").html("");

        for (var location of searchHistory) {
            makeHistory(location);
        }
    }

    function makeHistory(location) {
        var li = $("<li>").addClass("btn btn-secondary mt-2").text(location);
        $("#history").append(li);
    }

    loadHistory();

    // Get weather data
    function getWeatherData(location) {
        location = location.trim();
        
        // make api url
        var apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${apiKey}`;
        
        // fetch request
        fetch(apiUrl).then(function (response) {
            // response validation
            if (response.ok) {
                // parse response
                response.json().then(function (data) {
                    showCurrentWeather(data, location);
                    $("#search").val('');
                    if (!searchHistory.includes(location)) {
                        searchHistory.push(location);
                    }
            
                    if (searchHistory.length > 5) {
                        searchHistory.shift();
                    }
                    saveHistory();
                    loadHistory();
                });
            } else {
                console.log("response error: " + response.status);
                $('#search').trigger('focus');
            }
        });
    }

    // on search submit
    $("#search-form").submit(function (e) {
        e.preventDefault();
        var location = $("#search").val();
        if (!location) {
            return false;
        }
        getWeatherData(location);


    });
    
    function convertKtoF(kelvin) {
        var farenheit = ((kelvin - 273.15) * 1.8 + 32).toFixed(1);
        return farenheit;
    }
    
    // show current weather info panel
    function showCurrentWeather(weather, location) {

        var titleText = `Showing results for ${weather.name}, ${weather.sys.country}`;
        
        updateMapFrameSrc(`${location}`);
        
        var today = new Date();

        var fmtToday = moment(today).format("MM/DD/YYYY")
        var icon     = parseIcon(weather.weather[0].icon);
        var temp     = convertKtoF(weather.main.temp);
        var wind     = weather.wind.speed;
        var humidity = weather.main.humidity;
        
        $("#current-weather h2").text(titleText);
        $("#current-date").attr('class', 'text-light font-weight-bold' ).text(fmtToday);
        $("#current-icon").attr('src', icon)
        $("#current-temp span").text(temp);
        $("#current-wind span").text(wind);
        $("#current-humidity span").text(humidity);
        getLocationCoords(weather);
    }
    
    // get location coords
    function getLocationCoords(location) {
        // location is a city object
        var lat = location.coord.lat;
        var lon = location.coord.lon;
        var apiUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly&appid=${apiKey}`;
        fetch(apiUrl).then(function (response) {
            if (response.ok) {
                response.json().then(function (data) {
                    showForecast(data);
                });
            }
        });
    }
    
    function fmtDate(date) {
        return moment(date*1000).format('MM/DD/YYYY');
    }
    function parseIcon(icon) {
        return "http://openweathermap.org/img/w/" + icon + ".png";
    }

    // show 5-day forecast
    function showForecast(onecall) {

        // set uvi 
        // (delayed due to 2 fetches. consider populating current & forecast together)
        var uvi = onecall.current.uvi;
        setUVI(uvi);

        // loop thru 5-day forecast
        $('#forecast-wrapper').children().each(function (i) {

            var day = {
                date: fmtDate(onecall.daily[i].dt),
                temp: convertKtoF(onecall.daily[i].temp.day),
                icon: parseIcon(onecall.daily[i].weather[0].icon),
                wind: onecall.daily[i].wind_speed,
                humidity: onecall.daily[i].humidity
            }

            $(this).find('.date').text(day.date);
            $(this).find('.forecast-icon').attr('src', day.icon);
            $(this).find('.forecast-temp').text(day.temp);
            $(this).find('.forecast-wind').text(day.wind);
            $(this).find('.forecast-humidity').text(day.humidity);
        })

    }
    
    // updates 'uvi' span's value and bg-color
    function setUVI(uvi) {
        $("#current-uvi span").text(uvi);
        $("#current-uvi span").removeClass();
        if (uvi < 2) {
            $("#current-uvi span").addClass("btn bg-success");
        } else if (2 < uvi <= 5) {
            $("#current-uvi span").addClass("btn bg-warning");
        } else {
            $("#current-uvi span").addClass("btn bg-danger");
        }
    }

    function updateMapFrameSrc(location) {
        var src = $("#map iframe")[0];
        location = location.split(" ").join("");
        var regEx = /q=[\D\s]*(?=&)/g;
        var srcText = $(src)
            .attr("src")
            .replace(regEx, "q=" + location);
        $(src).attr("src", srcText);
    }

    $("#search-form").on("click", "li", function (e) {
        var result = $(this).text();
        getWeatherData(result);
    });
});
