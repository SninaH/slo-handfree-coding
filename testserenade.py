from flask import Flask, session, redirect, url_for

app = Flask(__name__)
app.secret_key = 'secret'


@app.route("/index")
def index():
    return "Welcome to my page"


@app.route("/hello/<name>")
def hello(name):
    return "hello " + name

