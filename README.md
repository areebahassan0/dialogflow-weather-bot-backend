# Dialogflow Weather Bot - REST API Backend

This is a Node.js Express server that serves as a webhook fulfillment for a Dialogflow ES chatbot. It uses the OpenWeatherMap API to provide current weather and forecast information based on user queries.

## 🔧 Features

- Supports current weather lookup (`GetCurrentWeather` intent)
- Supports weather forecast for specific dates or ranges (`GetWeatherForecast` intent)
- Integrates with Dialogflow via webhook
- Fetches weather data using OpenWeatherMap API

## 📦 Requirements

- Node.js (v14+)
- OpenWeatherMap API Key

## 🚀 Setup Instructions

1. **Clone the repository**

```bash
git clone https://github.com/YOUR_USERNAME/dialogflow-weather-bot-backend.git
cd dialogflow-weather-bot-backend
