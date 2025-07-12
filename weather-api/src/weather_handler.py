from fastapi import APIRouter, Depends
from strawberry.fastapi import GraphQLRouter
from sqlmodel import Session
from src.database import get_session
from src.weather_schema import weather_schema


async def get_context(session: Session = Depends(get_session)):
    return {"session": session}


graphql_router = GraphQLRouter(weather_schema, context_getter=get_context)

router = APIRouter()
router.include_router(graphql_router, prefix="/graphql")
