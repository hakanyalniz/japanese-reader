import sqlite3
import json

# Use as reference
# for entry in words:
#     if (len(entry['kanji']) > 0 and len(entry['kana']) > 0 and len(entry['sense'][0]['examples']) > 0):
#         print(entry['id'])
#         print(entry['kanji'][0]["text"])
#         print(entry['kana'][0]["text"])
#         print(entry['sense'][0]["gloss"][0]["text"])
#         print(entry['sense'][0]['examples'][0]["sentences"][0]["text"])
#         print(entry['sense'][0]['examples'][0]["sentences"][1]["text"])

with open('./jmdict-examples-eng-json/jmdict-examples-eng-3.6.1.json', 'r', encoding='utf-8') as f:
    data = json.load(f)
    words = data["words"]


conn = sqlite3.connect("./kanji_data.db")
cursor = conn.cursor()


cursor.execute("""
CREATE TABLE IF NOT EXISTS jpn_dict (
    id TEXT PRIMARY KEY,
    kanji TEXT,
    kana TEXT,
    meaning TEXT,
    example_jp TEXT, 
    example_en TEXT
)
""")


for entry in words:
    id = entry['id']
    if (len(entry['kanji']) > 0):
        kanji = entry['kanji'][0]["text"]
    else:
        kanji = "N/A"

    if (len(entry['kana']) > 0):
        kana = entry['kana'][0]["text"]
    else:
        kana = "N/A"

    if (len(entry['sense'][0]['gloss']) > 0):
        meaning = entry['sense'][0]["gloss"][0]["text"]
    else:
        meaning = "N/A"

    if (len(entry['sense'][0]['examples']) > 0):
        example_jp = entry['sense'][0]['examples'][0]["sentences"][0]["text"]
        example_en = entry['sense'][0]['examples'][0]["sentences"][1]["text"]
                   
    else:
        example_jp = "N/A"
        example_en = "N/A"

    # Insert data into the table
    cursor.execute('''
    INSERT OR REPLACE INTO jpn_dict (id, kanji, kana, meaning, example_jp, example_en)
    VALUES (?, ?, ?, ?, ?, ?)
    ''', (id, kanji, kana, meaning, example_jp, example_en))



conn.commit()
conn.close()
print("Database initialized!")