import numpy as np
import pandas as pd
import sqlalchemy
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy import create_engine, func, desc, inspect
import os

from flask import Flask, jsonify, render_template

import datetime as dt
from datetime import datetime, time
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)

app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('postgres://pnlaercgfluhis:11e36fb0587c388ef5cfa37b6cc108a041794a4b48fb0a3a91e372f7517a11ab@ec2-54-235-92-244.compute-1.amazonaws.com:5432/dfsh2tlegamd1h', '') or 'sqlite:///db.sqlite3'

db = SQLAlchemy(app)

# Database Setup
engine = create_engine("sqlite:///Database/db.sqlite3")

inspector = inspect(engine)
print("Check db table name: ")
print(inspector.get_table_names())

# results = pd.read_sql("select * from full_convert", con=engine)
results = pd.read_sql("select * from full_set_bus where Population_15 > 20000 and LAPOP1_10_y15 != 0", con=engine)
stateresults = pd.read_sql("""SELECT State, SUM(LAPOP1_10_y15) as low_access, SUM(Population_15) as pop_15, SUM(Population_14) as pop_14, SUM(Population_13) as pop_13, SUM(Population_12) as pop_12, SUM(Population_11) as pop_11, SUM(Population_10) as pop_10,
    AVG(HouseholdIncome_15) AS HouseholdIncome_15, AVG(HouseholdIncome_14) AS HouseholdIncome_14, AVG(HouseholdIncome_13) AS HouseholdIncome_13, AVG(HouseholdIncome_12) AS HouseholdIncome_12, AVG(HouseholdIncome_11) AS HouseholdIncome_11, AVG(HouseholdIncome_10) AS HouseholdIncome_10,
    AVG(PerCapitaIncome_15) AS PerCapitaIncome_15, AVG(PerCapitaIncome_14) AS PerCapitaIncome_14, AVG(PerCapitaIncome_13) AS PerCapitaIncome_13, AVG(PerCapitaIncome_12) AS PerCapitaIncome_12, AVG(PerCapitaIncome_11) AS PerCapitaIncome_11, AVG(PerCapitaIncome_10) AS PerCapitaIncome_10,
    AVG(MedianHomeValue_15) AS MedianHomeValue_15, AVG(MedianHomeValue_14) AS MedianHomeValue_14, AVG(MedianHomeValue_13) AS MedianHomeValue_13, AVG(MedianHomeValue_12) AS MedianHomeValue_12, AVG(MedianHomeValue_11) AS MedianHomeValue_11, AVG(MedianHomeValue_10) AS MedianHomeValue_10,
    AVG(EstimateGiniIndex_15) AS EstimateGiniIndex_15, AVG(EstimateGiniIndex_14) AS EstimateGiniIndex_14, AVG(EstimateGiniIndex_13) AS EstimateGiniIndex_13, AVG(EstimateGiniIndex_12) AS EstimateGiniIndex_12, AVG(EstimateGiniIndex_11) AS EstimateGiniIndex_11, AVG(EstimateGiniIndex_10) AS EstimateGiniIndex_10,
    AVG(MedianAge_15) AS MedianAge_15, AVG(MedianAge_14) AS MedianAge_14, AVG(MedianAge_13) AS MedianAge_13, AVG(MedianAge_12) AS MedianAge_12, AVG(MedianAge_11) AS MedianAge_11, AVG(MedianAge_10) AS MedianAge_10,
    AVG(PovertyRate_15) AS PovertyRate_15, AVG(PovertyRate_14) AS PovertyRate_14, AVG(PovertyRate_13) AS PovertyRate_13, AVG(PovertyRate_12) AS PovertyRate_12, AVG(PovertyRate_11) AS PovertyRate_11, AVG(PovertyRate_10) AS PovertyRate_10
    FROM full_set_bus GROUP BY State;""", con=engine)
# print(results)

##===============================================#

# Flask Setup
app = Flask(__name__)


# Routes

@app.route("/")
def index():
    """Return the homepage."""
    return render_template("index.html")


@app.route("/api/fullconvert")
def coords_tract_2017():    
    
    json_results = results.to_json(orient='records')
    # json_results = results.to_json(orient='columns')

    return json_results

@app.route("/api/stateconvert")
def stateDatat():

    state_results = stateresults.to_json(orient = 'records')
    return state_results

if __name__ == "__main__":
    app.run(debug=True)