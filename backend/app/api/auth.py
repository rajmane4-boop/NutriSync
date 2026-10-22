import os
import secrets
import json
import urllib.request
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

from app.db.database import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserLogin, UserResponse, Token, GoogleAuthRequest
from app.core.security import get_password_hash, verify_password, create_access_token

GOOGLE_CLIENT_ID = os.getenv(
    "GOOGLE_CLIENT_ID",
    "932727170379-q87sml7ld8av64naq4mcu87mq4au58ge.apps.googleusercontent.com"
)

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    # 1. Check if user already exists
    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # 2. Hash the password and create the new user record
    hashed_pwd = get_password_hash(user.password)
    new_user = User(
        email=user.email,
        hashed_password=hashed_pwd,
        first_name=user.first_name,
        last_name=user.last_name,
        goal=user.goal
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return new_user

@router.post("/login", response_model=Token)
def login_user(user: UserLogin, db: Session = Depends(get_db)):
    # 1. Find the user
    db_user = db.query(User).filter(User.email == user.email).first()
    
    # 2. Verify password
    if not db_user or not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Invalid email or password"
        )
    
    # 3. Generate JWT Token
    access_token = create_access_token(data={"sub": db_user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/google", response_model=Token)
def google_auth(payload: GoogleAuthRequest, db: Session = Depends(get_db)):
    """
    Verifies the Google ID token provided by the frontend.
    If valid:
      - Finds existing user by email OR creates a new user with a secure random password.
      - Returns a standard NutriSync JWT access token.
    """
    idinfo = None

    if payload.access_token:
        # Signed in via Google OAuth2 token client
        try:
            req = urllib.request.Request(
                "https://www.googleapis.com/oauth2/v3/userinfo",
                headers={"Authorization": f"Bearer {payload.access_token}"}
            )
            with urllib.request.urlopen(req, timeout=8) as response:
                if response.status == 200:
                    idinfo = json.loads(response.read().decode())
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Failed to verify Google access token: {str(e)}"
            )
    elif payload.credential:
        # Signed in via Google Identity Services ID token
        try:
            idinfo = id_token.verify_oauth2_token(
                payload.credential,
                google_requests.Request(),
                GOOGLE_CLIENT_ID
            )
        except Exception as verify_err:
            try:
                url = f"https://oauth2.googleapis.com/tokeninfo?id_token={payload.credential}"
                with urllib.request.urlopen(url, timeout=5) as response:
                    if response.status == 200:
                        token_data = json.loads(response.read().decode())
                        if token_data.get("aud") == GOOGLE_CLIENT_ID:
                            idinfo = token_data
            except Exception:
                pass

            if not idinfo:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail=f"Google token verification failed: {str(verify_err)}"
                )
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing Google credential or access token."
        )

    email = idinfo.get("email")
    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Google account did not return a valid email address."
        )

    # Step 2: Extract user details
    first_name = idinfo.get("given_name")
    last_name = idinfo.get("family_name")
    if not first_name:
        # Fallback to name split if given_name is not present
        full_name = idinfo.get("name", "")
        parts = full_name.split(" ", 1)
        first_name = parts[0] if parts else ""
        last_name = parts[1] if len(parts) > 1 else ""

    # Step 3: Find or create user
    user = db.query(User).filter(User.email == email).first()
    if not user:
        # Create a new user with a cryptographically secure random password
        random_password = secrets.token_urlsafe(32)
        hashed_pwd = get_password_hash(random_password)
        user = User(
            email=email,
            hashed_password=hashed_pwd,
            first_name=first_name,
            last_name=last_name,
            goal=None
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    else:
        # Update names if missing
        updated = False
        if not user.first_name and first_name:
            user.first_name = first_name
            updated = True
        if not user.last_name and last_name:
            user.last_name = last_name
            updated = True
        if updated:
            db.commit()
            db.refresh(user)

    # Step 4: Issue standard NutriSync JWT
    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

