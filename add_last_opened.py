import sqlite3
from pathlib import Path

db_path = Path(__file__).parent / "backend" / "unispace.db"
if not db_path.exists():
    print("Database not found at", db_path)
    raise SystemExit

con = sqlite3.connect(db_path)
columns = [row[1] for row in con.execute("PRAGMA table_info(documents)")]
if "last_opened_at" in columns:
    print("Column already exists. Nothing to do.")
else:
    con.execute("ALTER TABLE documents ADD COLUMN last_opened_at DATETIME")
    con.commit()
    print("Added last_opened_at to documents.")
con.close()