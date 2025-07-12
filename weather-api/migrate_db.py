from src.models import Weather  # Required: imports ALL models!
from src.database import engine
from sqlmodel import SQLModel

if __name__ == "__main__":
    print("Dropping old database...")
    SQLModel.metadata.drop_all(engine)
    print("Creating new database...")
    SQLModel.metadata.create_all(engine)
    print("New database initialized!")
