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
    if request.username not in ALLOWED_USERNAMES:
        taken = {
            u.username
            for u in session.exec(
                select(User).where(User.username.in_(ALLOWED_USERNAMES))
            ).all()
        }
        available = [u for u in ALLOWED_USERNAMES if u not in taken]
        raise HTTPException(
            status_code=400,
            detail={
                "code": "username_not_allowed",
                "available": available,
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
