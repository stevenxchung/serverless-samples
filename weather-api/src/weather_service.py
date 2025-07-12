import logging
import requests
from typing import List, Optional
from sqlalchemy import func
from sqlmodel import Session, select
from src.models import Weather

GEO_BASE_URL = "https://geocoding-api.open-meteo.com/v1/search"
FORECAST_BASE_URL = "https://api.open-meteo.com/v1/forecast"

logger = logging.getLogger(__name__)


class WeatherService:
    def __init__(self, session: Session):
        self.session = session

    def _get_random(self, min_value, max_value):
        from random import uniform

        return uniform(min_value, max_value)

    def fetch_and_save_weather_data(self, location_name: str):
        geo_params = {"name": location_name, "count": 1}
        geo_response = requests.get(GEO_BASE_URL, params=geo_params)
        if geo_response.status_code != 200:
            logger.error("Error fetching geolocation data.")
            return None

        geo_data = geo_response.json().get("results")
        if not geo_data:
            logger.error("No geolocation data found.")
            return None

        # Filter by city (case-insensitive)
        query = select(Weather).where(
            func.lower(Weather.city) == geo_data[0]["name"].lower()
        )
        weather_from_db = self.session.exec(query).first()
        if weather_from_db:
            logger.info("Data already exists, returning existing record.")
            return weather_from_db

        forcast_params = {
            "latitude": geo_data[0]["latitude"],
            "longitude": geo_data[0]["longitude"],
            "hourly": "temperature_2m",
            "forecast_days": 1,
        }
        forcast_response = requests.get(FORECAST_BASE_URL, params=forcast_params)
        if forcast_response.status_code != 200:
            logger.error("Error fetching weather data.")
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

        self.session.add(weather_entity)
        self.session.commit()
        self.session.refresh(weather_entity)
        return weather_entity

    def get_all(self) -> List[Weather]:
        query = select(Weather)
        return list(self.session.exec(query))

    def get_by_name(self, city_name: str) -> Optional[Weather]:
        query = select(Weather).where(func.lower(Weather.city) == city_name.lower())
        return self.session.exec(query).first()

    def update(self, city_name: str, update_data: dict) -> Optional[Weather]:
        query = select(Weather).where(func.lower(Weather.city) == city_name.lower())
        weather = self.session.exec(query).first()
        if weather:
            for key, value in update_data.items():
                if value is not None:
                    setattr(weather, key, value)
            self.session.add(weather)
            self.session.commit()
            self.session.refresh(weather)
            return weather
        return None

    def delete(self, city_name: str) -> bool:
        query = select(Weather).where(func.lower(Weather.city) == city_name.lower())
        weather = self.session.exec(query).first()
        if weather:
            self.session.delete(weather)
            self.session.commit()
            return True
        return False
