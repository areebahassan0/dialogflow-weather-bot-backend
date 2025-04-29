const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());

const PORT = 5000;
const OPENWEATHER_API_KEY = 'YOUR_API_KEY_HERE'; // Your API key

app.post('/webhook', async (req, res) => {
  const body = req.body;
  const parameters = body.queryResult.parameters;
  const intentName = body.queryResult.intent.displayName;

  const city = parameters['geo-city'];
  const country = parameters['geo-country']; // Optional
  const cityQuery = city ? (country ? `${city},${country}` : city) : null;

  if (!cityQuery) {
    return res.json({
      fulfillmentText: "Sorry, I couldn't detect the city. Please try again with a valid city name."
    });
  }

  try {
    if (intentName === 'GetCurrentWeather') {
      // Handle current weather
      const currentResponse = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${cityQuery}&units=metric&appid=${OPENWEATHER_API_KEY}`
      );
      const data = currentResponse.data;
      const description = data.weather[0].description;
      const temp = data.main.temp;

      const responseText = `Current weather in ${city} is ${description} with a temperature of ${temp}°C.`;
      return res.json({ fulfillmentText: responseText });
    }

    if (intentName === 'GetWeatherForecast') {
      // Handle weather forecast
      const date = parameters['date']; // Requested date (e.g., "1st May")
      const datePeriod = parameters['date-period'];

      let start;

      if (datePeriod?.startDate && datePeriod?.endDate) {
        start = new Date(datePeriod.startDate);
      } else if (date) {
        start = new Date(date); // If a single date is provided (e.g., "1st May")
      } else {
        // fallback: tomorrow
        start = new Date();
        start.setDate(start.getDate() + 1);
      }

      // Step 1: Get coordinates
      const geoResponse = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${cityQuery}&appid=${OPENWEATHER_API_KEY}`
      );
      const { lat, lon } = geoResponse.data.coord;

      // Step 2: Get forecast
      const weatherResponse = await axios.get(
        `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=hourly,minutely&units=metric&appid=${OPENWEATHER_API_KEY}`
      );
      const availableDays = weatherResponse.data.daily;

      // Format the requested date to compare it with forecasted dates
      const formatDateUTC = (d) => d.toISOString().split('T')[0];
      const requestedDateStr = formatDateUTC(start);

      // Find the forecast matching the requested date
      const matchingForecast = availableDays.find((day) => {
        const forecastDateStr = formatDateUTC(new Date(day.dt * 1000));
        return forecastDateStr === requestedDateStr; // Match the single date
      });

      let responseText = '';
      if (matchingForecast) {
        const forecastDateStr = new Date(matchingForecast.dt * 1000).toDateString();
        responseText = `Forecast for ${city} on ${forecastDateStr} is ${matchingForecast.weather[0].description}, temperature around ${matchingForecast.temp.day}°C.`;
      } else {
        responseText = `Sorry, I couldn't find a forecast for ${city} on the requested date.`;
      }

      return res.json({ fulfillmentText: responseText });
    }

    // Fallback
    return res.json({ fulfillmentText: `Sorry, I couldn't understand your weather request.` });

  } catch (err) {
    console.error("API ERROR:", err.response?.data || err.message);
    return res.json({ fulfillmentText: `Sorry, I couldn't get the weather info right now.` });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
