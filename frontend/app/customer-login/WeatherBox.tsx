import React, { useEffect, useState } from "react";

const WeatherBox = () => {
    const [weather, setWeather] = useState(null);
    const apiKey = "adf0540b2753faaf96f30c96427208f1";
    const location = "College Station, United States"; 

    useEffect(() => {
        fetch(`https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${apiKey}&units=imperial`)
            .then(response => response.json())
            .then(data => setWeather(data))
            .catch(error => console.error("Error fetching weather data:", error));
    }, [apiKey]);

    if (!weather) return <div>Loading Weather.....</div>;

    return (
        <div className="weather-box text-center" >
            <h3>Weather in {weather.name}</h3>
            <p>Conditions: {weather.weather[0].description}</p>
            <p>Temperature: {weather.main.temp}° F</p>
        </div>
    );
};

export default WeatherBox;