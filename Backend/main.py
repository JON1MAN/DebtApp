from fastapi import FastAPI
from models import user
from config.db_configuration import engine
from routes import user_routes, debts_routes, group_routes

user.Base.metadata.create_all(bind=engine)
app = FastAPI()

app.include_router(debts_routes.router)
app.include_router(user_routes.router)
app.include_router(group_routes.router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)

@app.get("/")
async def root():
    return {"message": "Hello World"}


@app.get("/hello/{name}")
async def say_hello(name: str):
    return {"message": f"Hello {name}"}
