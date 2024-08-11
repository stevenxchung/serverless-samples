from weather.database import db

from app import app

with app.app_context():
    # Recreate the database
    db.drop_all()
    print("Dropping old database...")
    db.create_all()
    print("New database initialized!")
