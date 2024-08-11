import logging
from flask import Flask
from weather.database import db, init_db
from weather.weather_handler import blueprint as weather_bp


app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///weather.db"
db.init_app(app)
init_db(app)

app.register_blueprint(weather_bp, url_prefix="/weather")

logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)


@app.route("/health")
def health():
    return "Service is healthy!"


if __name__ == "__main__":
    app.run(debug=True, host="::1", port=5000)
