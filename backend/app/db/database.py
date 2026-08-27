from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# This matches the credentials in your docker-compose.yml
SQLALCHEMY_DATABASE_URL = "postgresql://postgres:postgrespassword@localhost:5433/nutrisync_db"

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


# Dependency to get a database session for API routes
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
