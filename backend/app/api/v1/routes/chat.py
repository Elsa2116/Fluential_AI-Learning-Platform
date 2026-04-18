import os
from datetime import datetime
from uuid import uuid4

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.session import get_db
from app.models.models import ChatMessage, User
from app.services.chat_manager import manager

router = APIRouter(tags=["chat"])


@router.get("/chat/messages/{room_id}")
def get_messages(room_id: str, db: Session = Depends(get_db)):
    messages = (
        db.query(ChatMessage)
        .filter(ChatMessage.room_id == room_id)
        .order_by(ChatMessage.created_at.asc())
        .all()
    )
    return [
        {
            "id": msg.id,
            "room_id": msg.room_id,
            "sender_id": msg.sender_id,
            "message_type": msg.message_type,
            "text": msg.text,
            "file_name": msg.file_name,
            "file_url": msg.file_url,
            "created_at": msg.created_at,
        }
        for msg in messages
    ]


@router.post("/chat/messages")
async def post_message(room_id: str = Form(...), sender_id: int = Form(...), text: str = Form(...), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == sender_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Sender not found")

    message = ChatMessage(room_id=room_id, sender_id=sender_id, text=text, message_type="text")
    db.add(message)
    db.commit()
    db.refresh(message)

    payload = {
        "id": message.id,
        "room_id": room_id,
        "sender_id": sender_id,
        "message_type": "text",
        "text": text,
        "created_at": message.created_at.isoformat(),
    }
    await manager.broadcast(room_id, payload)
    return payload


@router.post("/chat/files")
async def upload_file(
    room_id: str = Form(...),
    sender_id: int = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.id == sender_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Sender not found")

    os.makedirs(settings.storage_dir, exist_ok=True)
    extension = os.path.splitext(file.filename or "")[-1]
    safe_name = f"{uuid4().hex}{extension}"
    full_path = os.path.join(settings.storage_dir, safe_name)

    with open(full_path, "wb") as out_file:
        out_file.write(await file.read())

    file_url = f"/uploads/{safe_name}"
    message = ChatMessage(
        room_id=room_id,
        sender_id=sender_id,
        message_type="file",
        file_name=file.filename,
        file_url=file_url,
    )
    db.add(message)
    db.commit()
    db.refresh(message)

    payload = {
        "id": message.id,
        "room_id": room_id,
        "sender_id": sender_id,
        "message_type": "file",
        "file_name": message.file_name,
        "file_url": file_url,
        "created_at": datetime.utcnow().isoformat(),
    }
    await manager.broadcast(room_id, payload)
    return payload


@router.websocket("/chat/ws/{room_id}")
async def websocket_chat(room_id: str, websocket: WebSocket):
    await manager.connect(room_id, websocket)
    try:
        while True:
            data = await websocket.receive_json()
            await manager.broadcast(room_id, data)
    except WebSocketDisconnect:
        manager.disconnect(room_id, websocket)
