from datetime import datetime
from pydantic import BaseModel, EmailStr, Field


class RegisterRequest(BaseModel):
    full_name: str | None = Field(default=None, min_length=2, max_length=150)
    name: str | None = Field(default=None, min_length=2, max_length=150)
    fullName: str | None = Field(default=None, min_length=2, max_length=150)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    country: str = Field(default="international", min_length=2, max_length=80)
    role: str = Field(default="student", min_length=4, max_length=20)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class AuthResponse(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    role: str


class AuthTokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: AuthResponse


class LessonCreate(BaseModel):
    title: str
    content: str
    step_order: int


class CourseCreate(BaseModel):
    title: str
    description: str
    teacher_id: int
    is_published: bool = True
    lessons: list[LessonCreate] = Field(default_factory=list)


class CourseUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    is_published: bool | None = None


class LessonRoadmapResponse(BaseModel):
    lesson_id: int
    title: str
    step_order: int
    status: str


class CourseListItem(BaseModel):
    id: int
    title: str
    description: str
    teacher_id: int
    lesson_count: int


class EnrollmentRequest(BaseModel):
    user_id: int
    course_id: int


class ProgressUpdateRequest(BaseModel):
    user_id: int
    lesson_id: int
    completed: bool = True


class ProgressSummary(BaseModel):
    course_id: int
    completed_lessons: int
    total_lessons: int
    progress_percent: float
    next_lesson_id: int | None = None


class HintRequest(BaseModel):
    topic: str
    question: str


class SummaryRequest(BaseModel):
    content: str


class QuizRequest(BaseModel):
    content: str


class PaymentInitRequest(BaseModel):
    user_id: int
    course_id: int
    amount_usd: int = Field(default=10, ge=1, le=10000)


class PaymentInitResponse(BaseModel):
    transaction_id: int
    provider: str
    status: str
    checkout_url: str


class PaymentConfirmRequest(BaseModel):
    paid: bool = True


class PaymentStatusResponse(BaseModel):
    transaction_id: int
    user_id: int
    course_id: int
    provider: str
    amount_usd: int
    status: str
    checkout_url: str


class PaymentVerifyRequest(BaseModel):
    tx_ref: str = Field(min_length=3, max_length=120)


class ChatMessageCreate(BaseModel):
    room_id: str
    sender_id: int
    text: str


class ChatMessageResponse(BaseModel):
    id: int
    room_id: str
    sender_id: int
    message_type: str
    text: str | None
    file_name: str | None
    file_url: str | None
    created_at: datetime
