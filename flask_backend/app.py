from flask import Flask, request, jsonify, session, redirect
from flask_cors import CORS
import sqlite3

from werkzeug.security import check_password_hash, generate_password_hash

app = Flask(__name__)
app.secret_key = 'secret_key_here'  # Set a secret key for session encryption
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
    app.logger.info(f"Username: {username}, Password: {password}")

    hashed_password = generate_password_hash(password)

    if not username or not password:
        return jsonify({"success": False, "message": "Username and password are required."}), 400

    try:
        conn.execute("INSERT INTO users (username, password_hash) VALUES (?, ?)", (username, hashed_password))
        conn.commit()
        return jsonify({"success": True, "message": "Signup successful!"}), 200
    except Exception as e:
        app.logger.error(f"Error: {e}")
        return jsonify({"success": False, "message": str(e)}), 500
    except sqlite3.IntegrityError as e:
        app.logger.error(f"Integrity error: {e}")
        return jsonify({"success": False, "message": "Username already exists."}), 400
    except sqlite3.Error as e:
        app.logger.error(f"Database error: {e}")
        return jsonify({"success": False, "message": "Database error occurred."}), 500
    finally:
        conn.close()



@app.route("/login", methods=["GET", "POST"])
def login():
    conn = get_db_connection(USER_DB_FILE)

    username = request.form.get('username')
    password = request.form.get('password')
    hashed_password = generate_password_hash(password)

    try:
        cursor = conn.execute("SELECT id, username FROM users WHERE username = ?", (username))
        user = cursor.fetchone()

        if user:
            user_id, password_hash = user
            if check_password_hash(hashed_password, password):
                session['user_id'] = user_id  # Store user ID in the session
                return jsonify({"success": True, "message": "Logged in successfully!"}), 500

    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        conn.close()





if __name__ == "__main__":
    app.run(debug=True)