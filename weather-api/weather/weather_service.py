import logging
import requests
from sqlalchemy import func
from weather.models import Weather
from weather.database import db


class WeatherService:
    logger = logging.getLogger(__name__)

    @staticmethod
    def _get_random(min_value, max_value):
        from random import uniform

        return uniform(min_value, max_value)

    @staticmethod
    def fetch_and_save_weather_data(location_name):
        geo_base_url = "https://geocoding-api.open-meteo.com/v1/search"
        geo_params = {"name": location_name, "count": 1}
        geo_response = requests.get(geo_base_url, params=geo_params)
        if geo_response.status_code != 200:
            WeatherService.logger.error("Error fetching geolocation data.")
            return None

        geo_data = geo_response.json().get("results")
        if not geo_data:
            WeatherService.logger.error("No geolocation data found.")
            return None

        weather_from_db = Weather.query.filter(
            func.lower(Weather.city) == geo_data[0]["name"].lower()
        ).first()
        if weather_from_db:
            WeatherService.logger.info(
                "Data already exists, returning existing record."
            )
            return weather_from_db

        forcast_base_url = "https://api.open-meteo.com/v1/forecast"
        forcast_params = {
            "latitude": geo_data[0]["latitude"],
            "longitude": geo_data[0]["longitude"],
            "hourly": "temperature_2m",
            "forecast_days": 1,
        }
        forcast_response = requests.get(forcast_base_url, params=forcast_params)
        if forcast_response.status_code != 200:
            WeatherService.logger.error("Error fetching weather data.")
            return None

        forcast_data = forcast_response.json()
        temps = forcast_data["hourly"]["temperature_2m"]
        average_temp = sum(temps) / len(temps)

        weather_entity = Weather(
            city=geo_data[0]["name"],
            lat_long=f"{forcast_data['latitude']}, {forcast_data['longitude']}",
            timestamp=forcast_data["hourly"]["time"][0],
            average_temp=average_temp,
            elevation=geo_data[0].get("elevation"),
            population=geo_data[0].get("population"),
        )

        db.session.add(weather_entity)
        db.session.commit()
        return weather_entity

    @staticmethod
    def get_all():
        return Weather.query.all()

    @staticmethod
    def get_by_name(city_name):
        return Weather.query.filter(
            func.lower(Weather.city) == city_name.lower()
        ).first()

    @staticmethod
    def update(city_name, update_data):
        weather = Weather.query.filter(
            func.lower(Weather.city) == city_name.lower()
        ).first()
        if weather:
            for key, value in update_data.items():
                setattr(weather, key, value)
            db.session.commit()
            return weather
        return None

    @staticmethod
    def delete(city_name):
        weather = Weather.query.filter(
            func.lower(Weather.city) == city_name.lower()
        ).first()
        if weather:
            db.session.delete(weather)
            db.session.commit()
            return True
        return False
