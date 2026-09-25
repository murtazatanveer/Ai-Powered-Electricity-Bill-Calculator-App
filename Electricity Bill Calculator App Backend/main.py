from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def welcomeMessage():
    return {"message":"Welcome to Electricity Bill Calculator App Backend","success":True}