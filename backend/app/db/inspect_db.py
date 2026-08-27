"""
NutriSync Database Inspector CLI
A quick diagnostic tool to view all PostgreSQL tables, foreign keys, row counts, and sample records.
Run via: python -m app.db.inspect_db
"""
from sqlalchemy import inspect, text
from app.db.database import engine, SessionLocal
from app.models import User, UserProfile, Exercise, WorkoutLog, WorkoutExerciseLog


def inspect_database():
    inspector = inspect(engine)
    db = SessionLocal()

    print("\n" + "=" * 70)
    print("       NUTRISYNC POSTGRESQL DATABASE INSPECTOR & SCHEMA MAP")
    print("=" * 70)

    # 1. List Tables & Columns
    tables = inspector.get_table_names()
    print(f"\n[+] Total Tables Found: {len(tables)}\n")

    for table_name in tables:
        if table_name == "alembic_version":
            continue

        columns = inspector.get_columns(table_name)
        fks = inspector.get_foreign_keys(table_name)
        
        # Get count
        row_count = db.execute(text(f"SELECT COUNT(*) FROM {table_name}")).scalar()

        print(f"┌── TABLE: {table_name.upper()} ({row_count} rows)")
        print("│   Columns:")
        for col in columns:
            pk_tag = " (PRIMARY KEY)" if col.get("primary_key") else ""
            nullable_tag = " NULL" if col.get("nullable") else " NOT NULL"
            print(f"│     • {col['name']} : {col['type']}{pk_tag}{nullable_tag}")

        if fks:
            print("│   Foreign Keys & Relations:")
            for fk in fks:
                referred_table = fk.get("referred_table")
                constrained_cols = ", ".join(fk.get("constrained_columns", []))
                referred_cols = ", ".join(fk.get("referred_columns", []))
                options = fk.get("options", {})
                ondelete = f" ON DELETE {options.get('ondelete')}" if options.get('ondelete') else ""
                print(f"│     -> ({constrained_cols}) REFERENCES {referred_table}({referred_cols}){ondelete}")
        else:
            print("│   Foreign Keys: None (Root Entity)")
        print("└" + "─" * 50 + "\n")

    # 2. Foreign Key Relational Map
    print("=" * 70)
    print("                  ENTITY RELATIONSHIPS SUMMARY")
    print("=" * 70)
    print("  [users] 1 ──── 1 [user_profiles]         (ON DELETE CASCADE)")
    print("  [users] 1 ──── * [workout_logs]          (ON DELETE CASCADE)")
    print("  [workout_logs] 1 ──── * [workout_exercise_logs] (ON DELETE CASCADE)")
    print("  [exercises] 1 ──── * [workout_exercise_logs]    (FK to master catalog)")
    print("=" * 70 + "\n")

    db.close()


if __name__ == "__main__":
    inspect_database()
