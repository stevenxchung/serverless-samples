import logging
import strawberry
from typing import List, Optional
from src.weather_service import WeatherService

logger = logging.getLogger(__name__)


@strawberry.type
class WeatherType:
    id: Optional[int]
    city: Optional[str]
    lat_long: Optional[str]
    timestamp: Optional[str]
    average_temp: Optional[float]
    elevation: Optional[float]
    population: Optional[int]
    description: Optional[str]


@strawberry.type
class Query:
    @strawberry.field
    def weather_list(self, info: strawberry.Info) -> List[WeatherType]:
        session = info.context["session"]
        ws = WeatherService(session)

        return ws.get_all()

    @strawberry.field
    def weather_by_name(
        self, info: strawberry.Info, city: str
    ) -> Optional[WeatherType]:
        session = info.context["session"]
        ws = WeatherService(session)

        logger.debug(f"Resolving weather for city: {city}")
        return ws.get_by_name(city)


@strawberry.input
class WeatherUpdateInput:
    lat_long: Optional[str] = None
    timestamp: Optional[str] = None
    average_temp: Optional[float] = None
    elevation: Optional[float] = None
    population: Optional[int] = None
    description: Optional[str] = None


@strawberry.type
class Mutation:
    @strawberry.mutation
    def sync_weather(
        self, info: strawberry.Info, location_name: str
    ) -> Optional[WeatherType]:
        session = info.context["session"]
        ws = WeatherService(session)

        logger.info(f"Fetching and saving weather data for location: {location_name}")
        return ws.fetch_and_save_weather_data(location_name)

    @strawberry.mutation
    def update_weather(
        self, info: strawberry.Info, city: str, update: WeatherUpdateInput
    ) -> Optional[WeatherType]:
        session = info.context["session"]
        ws = WeatherService(session)
        logger.info(f"Updating weather data for city: {city}")
        return ws.update(city, update.__dict__)

    @strawberry.mutation
    def delete_weather(self, info: strawberry.Info, city: str) -> bool:
        session = info.context["session"]
        ws = WeatherService(session)

        logger.info(f"Deleting weather data for city: {city}")
        return ws.delete(city)


weather_schema = strawberry.Schema(query=Query, mutation=Mutation)
