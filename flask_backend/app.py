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

@app.route("/data", methods=["GET"])
def get_data():
    conn = get_db_connection()
    cursor = conn.execute("SELECT * FROM entries")
    rows = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return jsonify(rows)

@app.route("/data", methods=["POST"])
def add_data():
    data = request.json
    conn = get_db_connection()
    conn.execute("INSERT INTO entries (id) VALUES (?)", (data["id"],))
    conn.commit()
    conn.close()
    return jsonify({"status": "success"}), 201

if __name__ == "__main__":
    app.run(debug=True)