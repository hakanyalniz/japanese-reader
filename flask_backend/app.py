from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import bcrypt

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# Database setup
KANJI_DB_FILE = "kanji_data.db"
USER_DB_FILE = "user_data.db"


def get_db_connection(database):
    conn = sqlite3.connect(database)
    conn.row_factory = sqlite3.Row
    return conn


@app.route("/api/data", methods=["GET"])
def get_data():
    conn = get_db_connection(KANJI_DB_FILE)
    value = request.args.get('query')

    cursor = conn.execute("SELECT id, kanji, kana, meaning FROM jpn_dict WHERE kanji LIKE ? OR kana LIKE ? ORDER BY LENGTH(kanji) ASC", (f"{value}%", f"{value}%"))
    rows = cursor.fetchall()

    result = [dict(row) for row in rows]


    conn.close()

    return jsonify(result)

@app.route("/signup", methods=["GET", "POST"])
def signup():
    conn = get_db_connection(USER_DB_FILE)

    username = request.form.get('username')
    password = request.form.get('password')
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

    try:
        conn.execute("INSERT INTO users (username, password_hash) VALUES (?, ?)", (username, hashed_password))
        conn.commit()
        print("Succesfully signed up.")
    except sqlite3.IntegrityError:
        print("Error: Username already exists.")
    except Exception as e:
        print(f"An error occurred: {e}")
    finally:
        conn.close()


@app.route("/login", methods=["GET", "POST"])
def login():
    conn = get_db_connection(USER_DB_FILE)

    username = request.form.get('username')
    password = request.form.get('password')
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

    try:
        cursor = conn.execute("SELECT id, username FROM users WHERE username = ? AND password_hash = ?", (username, hashed_password))
        rows = cursor.fetchall()

        return rows
    except Exception as e:
        print(f"An error occurred: {e}")
    finally:
        conn.close()



if __name__ == "__main__":
    app.run(debug=True)