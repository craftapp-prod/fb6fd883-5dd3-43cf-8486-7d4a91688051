# backend/api/v1/endpoints/auth.py
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from database import get_db
from models.user import User
from schemas.user import UserCreate, UserActivate, Token, User as UserSchema
from schemas.user import PasswordReset, PasswordResetConfirm, UserUpdate  
from core.security import verify_password, get_password_hash, create_access_token
from core.email import generate_activation_code, send_activation_email
from core.email import generate_reset_code, send_password_reset_email  
from datetime import timedelta
from config import settings
from jose import JWTError, jwt

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
        
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise credentials_exception
    return user

@router.post("/register", response_model=UserSchema)
async def register(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )
    
    activation_code = generate_activation_code()
    hashed_password = get_password_hash(user.password)
    db_user = User(
        email=user.email,
        hashed_password=hashed_password,
        activation_code=activation_code
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    send_activation_email(user.email, activation_code)
    
    return db_user

@router.post("/activate")
async def activate(user_activate: UserActivate, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_activate.email).first()
    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )
    
    if user.is_active:
        raise HTTPException(
            status_code=400,
            detail="Account already activated"
        )
    
    if user.activation_code != user_activate.activation_code:
        raise HTTPException(
            status_code=400,
            detail="Invalid activation code"
        )
    
    user.is_active = True
    user.activation_code = None
    db.commit()
    
    return {"message": "Account activated successfully"}

@router.post("/token", response_model=Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Account not activated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserSchema)
async def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.post("/forgot-password")
async def forgot_password(password_reset: PasswordReset, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == password_reset.email).first()
    if not user:
        return {"message": "If your email is registered, you will receive a password reset code"}
    
    reset_code = generate_reset_code()
    user.reset_code = reset_code
    db.commit()
    
    send_password_reset_email(user.email, reset_code)
    
    return {"message": "If your email is registered, you will receive a password reset code"}

@router.post("/reset-password")
async def reset_password(password_reset_confirm: PasswordResetConfirm, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == password_reset_confirm.email).first()
    if not user or user.reset_code != password_reset_confirm.reset_code:
        raise HTTPException(
            status_code=400,
            detail="Invalid email or reset code"
        )
    
    user.hashed_password = get_password_hash(password_reset_confirm.new_password)
    user.reset_code = None
    db.commit()
    
    return {"message": "Password has been reset successfully"}

@router.put("/update-account", response_model=UserSchema)
async def update_account(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if user_update.email and user_update.email != current_user.email:
        existing_user = db.query(User).filter(User.email == user_update.email).first()
        if existing_user:
            raise HTTPException(
                status_code=400,
                detail="Email already in use"
            )
        current_user.email = user_update.email
    
    if user_update.password:
        current_user.hashed_password = get_password_hash(user_update.password)
    
    db.commit()
    db.refresh(current_user)
    
    return current_user