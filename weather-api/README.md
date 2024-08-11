# Weather API

A simple Flask API using GraphQL to perform CRUD operations on weather data with an SQLite database.

## Requirements

- Python 3.12 or higher

## Setup Instructions

1. **Clone the repository:**

   ```bash
   git clone https://github.com/your-username/weather-api.git
   cd weather-api
   ```

2. **Create and activate a virtual environment:**

   ```bash
   # Only if /venv folder does not exist
   python -m venv venv
   # Install dependencies to virtual environment
   pipenv install
   # Activate virtual environment
   pipenv shell
   ```

3. **Initialize the database:**

   The database will be created and initialized automatically when you run the application for the first time. However, if you want to manually initialize it, you can run the following script:

   ```python
   from database import init_db
   from app import app

   init_db(app)
   ```

## Running the Application

1. **Start the Flask server:**

   ```bash
   python app.py
   ```

2. **Access the GraphQL interface:**

   Open your web browser and go to `http://localhost:5000/graphql/weather`. You can use the GraphiQL interface to run GraphQL queries and mutations.

## Example Queries and Mutations

1. **Fetch and save weather data according to location:**

   Query:

   ```graphql
   mutation ($locationName: String!) {
     fetchAndSaveWeather(locationName: $locationName) {
       weather {
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
     weathers {
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
     updateWeather(city: $city, description: $description) {
       weather {
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
     deleteWeather(city: $city) {
       ok
     }
   }
   ```

   Variables:

   ```graphql
   {
    "city": "New York"
   }
   ```
