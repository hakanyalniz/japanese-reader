# Create the notebook database, which will store permanent notebook content
# for signed up users

import sqlite3
import json


conn = sqlite3.connect("./user_data.db")
cursor = conn.cursor()

cursor.execute("PRAGMA foreign_keys = ON")

cursor.execute("""
CREATE TABLE IF NOT EXISTS notebook (
    id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL,
    kanji TEXT,
    kana TEXT,
    meaning TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id)
)
""")