from collections import defaultdict
from fastapi import WebSocket


class ConnectionManager:
    def __init__(self):
        self.rooms: dict[str, list[WebSocket]] = defaultdict(list)

    async def connect(self, room_id: str, websocket: WebSocket):
        await websocket.accept()
        self.rooms[room_id].append(websocket)

    def disconnect(self, room_id: str, websocket: WebSocket):
        if websocket in self.rooms[room_id]:
            self.rooms[room_id].remove(websocket)

    async def broadcast(self, room_id: str, payload: dict):
        for connection in self.rooms[room_id]:
            await connection.send_json(payload)


manager = ConnectionManager()
