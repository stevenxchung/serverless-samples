from flask import Blueprint
from flask_graphql import GraphQLView
from weather.weather_schema import weather_schema

blueprint = Blueprint("weather", __name__)

blueprint.add_url_rule(
    "/graphql",
    view_func=GraphQLView.as_view(
        "graphql",
        schema=weather_schema,
        graphiql=True,  # Enables the GraphiQL interface
    ),
)
