from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.database.dependencies import get_db

from app.schemas.user import (
    UserCreate,
    UserResponse,
)

from app.schemas.token import Token

from app.repositories.user_repository import UserRepository

from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
)

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


@router.post(
    "/register",
    response_model=UserResponse,
)
def register_user(
    user: UserCreate,
    db: Session = Depends(get_db),
):

    existing_user = UserRepository.get_user_by_email(
        db,
        user.email,
    )

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered",
        )

    hashed_password = hash_password(user.password)

    new_user = UserRepository.create_user(
        db=db,
        name=user.name,
        email=user.email,
        password_hash=hashed_password,
    )

    return new_user


@router.post(
    "/login",
    response_model=Token,
)
def login_user(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):

    db_user = UserRepository.get_user_by_email(
        db,
        form_data.username,
    )

    if not db_user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password",
        )

    if not verify_password(
        form_data.password,
        db_user.password_hash,
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password",
        )

    access_token = create_access_token(
        data={
            "sub": db_user.email,
        }
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
    }