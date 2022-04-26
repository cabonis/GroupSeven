from flask import Flask
from api.load import load
from api import app

app = Flask(__name__)

@app.route("/")
def hello_world():
    return "<p>Hello, World!</p>"

@app.route("/load")
def load():
    return db.load()

@app.route("/covid")
def hello_world():
    return app.covid()

@app.route("/vaccinations")
def hello_world():
    return app.vaccinations()

@app.route("/hospitalizations")
def hello_world():
    return app.hospitalizations()

@app.route("/census")
def hello_world():
    return app.census()
