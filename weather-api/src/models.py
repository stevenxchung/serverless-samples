from typing import Optional
from sqlmodel import SQLModel, Field


class Weather(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    city: str = Field(index=True, max_length=100)
    lat_long: Optional[str] = Field(default=None, max_length=100)
    timestamp: Optional[str] = Field(default=None, max_length=100)
    average_temp: Optional[float] = None
    elevation: Optional[float] = None
    population: Optional[int] = None
    description: str = Field(default="", max_length=250)
