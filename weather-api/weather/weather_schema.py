import logging
import graphene
from graphene_sqlalchemy import SQLAlchemyObjectType
from weather.models import Weather as WeatherModel
from weather.weather_service import WeatherService

logger = logging.getLogger(__name__)


class WeatherType(SQLAlchemyObjectType):
    class Meta:
        model = WeatherModel


class Query(graphene.ObjectType):
    weathers = graphene.List(WeatherType)
    weather_by_name = graphene.Field(WeatherType, city=graphene.String())

    def resolve_weathers(self, info):
        field_name = info.field_name
        parent_type = info.parent_type.name
        logger.info(f"Resolving field {field_name} on type {parent_type}")

        return WeatherService.get_all()

    def resolve_weather_by_name(self, info, city):
        logger.debug(f"Resolving weather for city: {city}")
        return WeatherService.get_by_name(city)


class FetchAndSaveWeather(graphene.Mutation):
    class Arguments:
        location_name = graphene.String()

    weather = graphene.Field(lambda: WeatherType)

    def mutate(self, info, location_name):
        logger.info(
            f"Fetching and saving weather data for location: {location_name}"
        )
        weather = WeatherService.fetch_and_save_weather_data(location_name)
        return FetchAndSaveWeather(weather=weather) if weather else None


class UpdateWeather(graphene.Mutation):
    class Arguments:
        city = graphene.String()
        lat_long = graphene.String()
        timestamp = graphene.String()
        average_temp = graphene.Float()
        elevation = graphene.Float()
        population = graphene.Int()
        description = graphene.String()

    weather = graphene.Field(lambda: WeatherType)

    def mutate(
        self,
        info,
        city,
        lat_long=None,
        timestamp=None,
        average_temp=None,
        elevation=None,
        population=None,
        description=None,
    ):
        logger.info(f"Updating weather data for city: {city}")
        update_data = {
            "city": city,
            "lat_long": lat_long,
            "timestamp": timestamp,
            "average_temp": average_temp,
            "elevation": elevation,
            "population": population,
            "description": description,
        }
        update_data = {k: v for k, v in update_data.items() if v is not None}
        weather = WeatherService.update(city, update_data)
        return UpdateWeather(weather=weather) if weather else None


class DeleteWeather(graphene.Mutation):
    class Arguments:
        city = graphene.String()

    ok = graphene.Boolean()

    def mutate(self, info, city):
        logger.info(f"Deleting weather data for city: {city}")
        success = WeatherService.delete(city)
        return DeleteWeather(ok=success)


class Mutation(graphene.ObjectType):
    fetch_and_save_weather = FetchAndSaveWeather.Field()
    update_weather = UpdateWeather.Field()
    delete_weather = DeleteWeather.Field()


weather_schema = graphene.Schema(query=Query, mutation=Mutation)
