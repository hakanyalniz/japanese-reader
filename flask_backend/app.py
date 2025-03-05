from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# Database setup
DB_FILE = "data.db"


def get_db_connection():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn


@app.route("/api/data", methods=["GET"])
def get_data():
    conn = get_db_connection()
    value = request.args.get('query')

    # cursor = conn.execute("SELECT * FROM entries")
    # rows = [dict(row) for row in cursor.fetchall()]
    # conn.close()
    # return jsonify(rows)
    return value


if __name__ == "__main__":
    app.run(debug=True)