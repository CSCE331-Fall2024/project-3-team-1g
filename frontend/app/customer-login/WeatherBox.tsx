import React, { useEffect, useState } from "react";
import styles from './WeatherBox.module.css'; // Import the CSS module

interface WeatherData {
  name: string;
  weather: { description: string }[];
  main: { temp: number };
}

const WeatherBox = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const apiKey = "adf0540b2753faaf96f30c96427208f1";
  const location = "College Station, United States"; 

  useEffect(() => {
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${apiKey}&units=imperial`)
      .then(response => response.json())
      .then(data => setWeather(data))
      .catch(error => console.error("Error fetching weather data:", error));
  }, [apiKey]);

  if (!weather) return <div>Loading weather...</div>;

  return (
    <div className={styles.weatherBox}>
      <h3>Weather in {weather.name}</h3>
      <p>Conditions: {weather.weather[0].description}</p>
      <p>Temperature: {weather.main.temp}° F</p>
    </div>
  );
};

export default WeatherBox;