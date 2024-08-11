from weather.database import db
import json


class Weather(db.Model):
    __tablename__ = "weather"
    id = db.Column(db.Integer, primary_key=True)
    city = db.Column(db.String(100), nullable=False, index=True)
    lat_long = db.Column(db.String(100))
    timestamp = db.Column(db.String(100))
    average_temp = db.Column(db.Float)
    elevation = db.Column(db.Float)
    population = db.Column(db.Integer)
    description = db.Column(db.String(250), nullable=False, default="")

    def __repr__(self):
        weather_dict = {
            "id": self.id,
            "city": self.city,
            "lat_long": self.lat_long,
            "timestamp": self.timestamp,
            "average_temp": self.average_temp,
            "elevation": self.elevation,
            "population": self.population,
            "description": self.description,
        }
        return json.dumps(weather_dict, indent=4)
