import os
import sys
import psycopg2
from psycopg2.extras import RealDictCursor


def get_db_config():
    database_url = os.getenv("DATABASE_URL")
    if database_url:
        return {"dsn": database_url}

    host = os.getenv("DB_HOST")
    user = os.getenv("DB_USER")
    db_name = os.getenv("DB_NAME")

    if not host or not user or not db_name:
        raise ValueError("Set DATABASE_URL or DB_HOST/DB_USER/DB_NAME environment variables.")

    return {
        "host": host,
        "port": int(os.getenv("DB_PORT", "5432")),
        "dbname": db_name,
        "user": user,
        "password": os.getenv("DB_PASSWORD", "")
    }


def seed_home_office_rule():
    config = get_db_config()
    if "dsn" in config:
        conn = psycopg2.connect(config["dsn"], cursor_factory=RealDictCursor)
    else:
        conn = psycopg2.connect(cursor_factory=RealDictCursor, **config)

    cursor = conn.cursor()
    try:
        insert_node_query = """
        INSERT INTO legal_nodes (citation, jurisdiction, tax_year, node_type, title, text_content)
        VALUES (%s, %s, %s, %s, %s, %s)
        ON CONFLICT (citation, jurisdiction, tax_year)
        DO UPDATE SET
            node_type = EXCLUDED.node_type,
            title = EXCLUDED.title,
            text_content = EXCLUDED.text_content
        RETURNING id;
        """

        citation = "26-USC-280A-simplified"
        text_content = (
            "Simplified Home Office Deduction: Allows a standard deduction of $5 per square foot "
            "for the business use of a home, up to a maximum statutory limit of 300 square feet "
            "($1,500 maximum total deduction). Must be the principal place of business for a 1099 worker."
        )

        cursor.execute(
            insert_node_query,
            (citation, "FEDERAL", 2026, "CLAUSE", "Simplified Home Office", text_content)
        )
        node_id = cursor.fetchone()["id"]
        conn.commit()
        print(f"Successfully seeded legal node with ID: {node_id}")
    except Exception as error:
        conn.rollback()
        print(f"Error seeding database: {error}")
        sys.exit(1)
    finally:
        cursor.close()
        conn.close()


if __name__ == "__main__":
    seed_home_office_rule()
