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
    nextCharacter = request.args.get("nextCharacter", default="")

    cursor = conn.execute("SELECT kanji, kana, meaning FROM jpn_dict WHERE kanji LIKE ? ORDER BY LENGTH(kanji) ASC", (f"{value}%",))
    rows = cursor.fetchall()

    result = [dict(row) for row in rows]


    conn.close()

    return jsonify(result)


if __name__ == "__main__":
    app.run(debug=True)