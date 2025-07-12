from sqlmodel import SQLModel, Session, create_engine

DATABASE_URL = "sqlite:///weather.db"
# May enable echo=True for debugging
engine = create_engine(DATABASE_URL, echo=False)


def get_session():
    with Session(engine) as session:
        yield session


def create_db_and_tables():
    SQLModel.metadata.create_all(engine)
