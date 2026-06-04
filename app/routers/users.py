from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from app.auth.password import hash_password
from app.config import ALLOWED_USERNAMES
from app.database import get_session
from app.models import User
from app.schemas import UserCreateRequest, UserResponse


router = APIRouter(
    prefix="/users",
    tags=["users"],
)


@router.post("/", response_model=UserResponse)
def create_user_endpoint(
    request: UserCreateRequest,
    session: Session = Depends(get_session),
):
    username_lower = request.username.lower()
    if not any(username_lower.startswith(prefix.lower()) for prefix in ALLOWED_USERNAMES):
        raise HTTPException(
            status_code=400,
            detail={
                "code": "username_not_allowed",
                "available": ALLOWED_USERNAMES,
            },
        )

    existing_user = session.exec(
        select(User).where(User.username == request.username)
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Este nome de utilizador já está registado.",
        )

    user = User(
        username=request.username,
        hashed_password=hash_password(request.password),
    )

    session.add(user)
    session.commit()
    session.refresh(user)

    return user
