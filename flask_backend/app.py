from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# Database setup
DB_FILE = "kanji_data.db"


def get_db_connection():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn


@app.route("/api/data", methods=["GET"])
def get_data():
    conn = get_db_connection()
    value = request.args.get('query')

    cursor = conn.execute("SELECT id, kanji, kana, meaning FROM jpn_dict WHERE kanji LIKE ? OR kana LIKE ? ORDER BY LENGTH(kanji) ASC", (f"{value}%", f"{value}%"))
    rows = cursor.fetchall()

    result = [dict(row) for row in rows]


    conn.close()

    return jsonify(result)

@app.route("/SignUp", methods=["GET", "POST"])
def register():
    print("SignUp")


@app.route("/login", methods=["GET", "POST"])
def register():
    print("Login")


if __name__ == "__main__":
    app.run(debug=True)