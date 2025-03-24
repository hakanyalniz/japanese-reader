from flask import Flask, request, jsonify, session
from flask_cors import CORS
from flask_session import Session

import sqlite3
from datetime import timedelta
from werkzeug.security import check_password_hash, generate_password_hash

app = Flask(__name__)

# Configure session
app.secret_key = 'secret_key_here'  # Set a secret key for session encryption

app.config['SESSION_COOKIE_SECURE'] = True
app.config['SESSION_COOKIE_HTTPONLY'] = True

app.config["SESSION_TYPE"] = "filesystem"
app.config["SESSION_COOKIE_SAMESITE"] = "None"

app.permanent_session_lifetime = timedelta(hours=1)

Session(app)

CORS(app, supports_credentials=True, origins="http://localhost:5173")  # Enable CORS for React frontend


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


@app.route("/api/notebook", methods=["GET", "POST"])
def get_notebook():
    conn = get_db_connection(USER_DB_FILE)
    user_id = session.get('user_id')

    # Check if the user is not logged in
    if (user_id == None):
        return jsonify({"success": False, "message": "Not logged in."}), 400
    
    # Get the notebook content
    if request.method == 'GET':
        cursor = conn.execute("SELECT kanji, kana, meaning FROM notebook WHERE user_id = ?", (user_id,))
        rows = cursor.fetchall()

        result = [dict(row) for row in rows]
        conn.close()
        return jsonify(result)
    
    # Post the notebook from client to server for keepint it permanent per user
    elif request.method == 'POST':
        notebookContent = request.form.get('notebook')

        if (notebookContent == None):
            return jsonify({"success": False, "message": "Invalid Data."}), 400

        for entry in notebookContent:
            conn.execute("INSERT INTO notebook (user_id, kanji, kana, meaning) VALUES (?, ?, ?, ?)", (user_id, entry.get("kanji"), entry["kana"], entry["meaning"]))

        conn.commit()     
        conn.close()
        return jsonify({"success": True, "message": "Successfully added content to notebook table."}), 500


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
    app.logger.info(f"Username: {username}, Password: {password}") 


    try:
        cursor = conn.execute("SELECT id, password_hash FROM users WHERE username = ?", (username,))
        user = cursor.fetchone()
        if user:
            user_id, password_hash = user
            print("We are here!, user_id, password_hash", user_id, password_hash, flush=True)

            print("Does this work?", check_password_hash(password_hash, password) , flush=True)

            if check_password_hash(password_hash, password):
                session['user_id'] = user_id  # Store user ID in the session
                
                return jsonify({"success": True, "message": "Logged in successfully!"}), 200
            else:
                return jsonify({"success": False, "message": "Username or password are wrong!"}), 401
        else:
            return jsonify({"success": False, "message": "User not found!"}), 401

    except Exception as e:
        app.logger.error(f"Error: {e}")
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        conn.close()
        

# Check to see if logging in works
@app.route("/check-login", methods=["GET"])
def checkLogin():
    user_id = session.get('user_id')
    print(user_id, flush=True)
    if user_id != None:
        return jsonify({"logged_in": True, "user_id": user_id}), 200
    else:
        return jsonify({"logged_in": False}), 401


@app.route("/logout", methods=["GET", "POST"])
def logout():
    if (session.get('user_id')):
        session.pop('user_id', None)  # Remove the user ID from the session
        return jsonify({"success": True, "message": "Logged out successfully!"}), 200
    else:
        return jsonify({"success": False, "message": "Currently not logged in!"}), 400


if __name__ == "__main__":
    app.run(debug=True)