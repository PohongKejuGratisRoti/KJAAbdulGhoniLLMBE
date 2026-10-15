import sqlite3
import bcrypt

DB_NAME = "notsolusindo.db"


def init_db():
    with sqlite3.connect(DB_NAME) as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS user (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL
            )
        """)


def create_user(username: str, password: str) -> bool:
    password_hash = bcrypt.hashpw(
        password.encode("utf-8"),
        bcrypt.gensalt()
    ).decode("utf-8")

    try:
        with sqlite3.connect(DB_NAME) as conn:
            conn.execute(
                "INSERT INTO user (username, password_hash) VALUES (?, ?)",
                (username, password_hash)
            )
        return True
    except sqlite3.IntegrityError:
        return False


def read_user(username: str):
    with sqlite3.connect(DB_NAME) as conn:
        conn.row_factory = sqlite3.Row
        row = conn.execute(
            "SELECT id, username, password_hash FROM user WHERE username = ?",
            (username,)
        ).fetchone()

        return dict(row) if row else None


def verify_user(username: str, password: str) -> bool:
    user = read_user(username)

    if user is None:
        return False

    return bcrypt.checkpw(
        password.encode("utf-8"),
        user["password_hash"].encode("utf-8")
    )


if __name__ == "__main__":
    init_db()

    if create_user("testuser", "usersolusindo"):
        print("Test user created.")
    else:
        print("Test user already exists.")

    print("User:", read_user("testuser"))
    print("Password valid:", verify_user("testuser", "test123"))