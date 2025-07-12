import logging
import uvicorn
from fastapi import FastAPI
from fastapi.responses import PlainTextResponse

from src.database import create_db_and_tables
from src.weather_handler import router as weather_router

logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)


async def init_db(app: FastAPI):
    # Do startup tasks
    create_db_and_tables()
    yield


app = FastAPI(lifespan=init_db)
app.include_router(weather_router, prefix="/weather")


# Health check endpoint
@app.get("/health", response_class=PlainTextResponse)
def health():
    return "Service is healthy!"


if __name__ == "__main__":
    uvicorn.run("app:app", host="127.0.0.1", port=5000, reload=False)
