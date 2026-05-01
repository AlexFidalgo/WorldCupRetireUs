from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from app.auth.jwt import create_access_token
from app.auth.password import verify_password
from app.database import get_session
from app.models import User


router = APIRouter(
    prefix="/auth",
    tags=["auth"],
)


@router.post("/login")
def login_endpoint(
    username: str,
    password: str,
    session: Session = Depends(get_session),
):
    user = session.exec(
        select(User).where(User.username == username)
    ).first()

    if user is None:
        raise HTTPException(status_code=400, detail="Invalid credentials")

    if not verify_password(password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Invalid credentials")

    access_token = create_access_token(
        data={"sub": user.username}
    )

    return {"access_token": access_token, "token_type": "bearer"}