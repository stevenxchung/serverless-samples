# Weather API

A simple [FastAPI](https://github.com/fastapi/fastapi) using GraphQL to perform CRUD operations on weather data with a built-in SQLite database via [SQLModel](https://github.com/fastapi/sqlmodel).

## Requirements

- Python 3.12 or higher

## Setup Instructions

1. **Clone the repository:**

   ```bash
   git clone https://github.com/your-username/weather-api.git
   cd weather-api
   ```

2. **Install dependencies via [uv](https://docs.astral.sh/uv/getting-started/installation/):**

   ```bash
   # Install dependencies
   uv sync
   ```

**Note:** The database `weather.db` will be created and initialized automatically via the `src/database.py` script via SQLModel (SQLAlchemy under the hood) when you run the application for the first time. To reset the database to a clean state: `uv run migrate_db.py`.

## Running the Application

1. **Start the server:**

   ```bash
   uv run app.py
   ```

2. **Access the GraphQL interface:**

   Open your web browser and go to `http://localhost:5000/graphql/weather`. You can use the GraphiQL interface to run GraphQL queries and mutations.

## Example Queries and Mutations

1. **Fetch and save weather data according to location:**

   Query:

   ```graphql
   mutation ($locationName: String!) {
     syncWeather(locationName: $locationName) {
       id
       city
       latLong
       timestamp
       averageTemp
       elevation
       population
       description
     }
   }
   ```

   Variables:

   ```graphql
   {
    "locationName": "New York"
   }
   ```

2. **Fetch all weather records:**

   ```graphql
   {
     weatherList {
       id
       city
       latLong
       timestamp
       averageTemp
       elevation
       population
       description
     }
   }
   ```

3. **Fetch weather record by city name:**

   ```graphql
   {
     weatherByName(city: "New York") {
       id
       city
       latLong
       timestamp
       averageTemp
       elevation
       population
       description
     }
   }
   ```

4. **Update weather record:**

   Query:

   ```graphql
   mutation ($city: String!, $description: String) {
     updateWeather(city: $city, update: { description: $description }) {
       id
       city
       latLong
       timestamp
       averageTemp
       elevation
       population
       description
     }
   }
   ```

   Variables:

   ```graphql
   "{
       "city": "New York",
       "description": "<UPDATED DESCRIPTION>"
   }
   ```

5. **Delete a weather record:**

   Query:

   ```graphql
   mutation ($city: String!) {
     deleteWeather(city: $city)
   }
   ```

   Variables:

   ```graphql
   {
    "city": "New York"
   }
   ```
