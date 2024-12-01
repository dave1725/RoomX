import asyncio
import websockets
from threading import Thread

rooms = {}  # Dictionary to hold room names and their connected clients
clients = {}  # Dictionary to hold clients and their usernames

async def handle_client(websocket, path):
    username = None
    room_name = None
    try:
        # Assign client to a room
        async for message in websocket:
            command, *data = message.split(" ", 1)
            if command == "SET_USERNAME":
                username = data[0].strip() if data else None
                if username:
                    clients[websocket] = username
                    await websocket.send(f"Username set to {username}.")
                else:
                    await websocket.send("Error: Username cannot be empty.")
            elif command == "CREATE_ROOM":
                room_name = data[0] if data else None
                await create_room(websocket, room_name)
            elif command == "LIST_ROOMS":
                await list_rooms(websocket)
            elif command == "JOIN":
                if websocket in clients:
                    room_name = data[0] if data else "general"
                    await join_room(websocket, room_name, username)
                else:
                    await websocket.send("Error: Please set your username before joining a room.")
            elif command == "MESSAGE":
                if room_name:
                    await broadcast(data[0], room_name, websocket)
                else:
                    await websocket.send("Error: You need to join a room first.")
            elif command == "LEAVE":
                await leave_room(websocket, room_name)
                room_name = None
    except websockets.exceptions.ConnectionClosed:
        print(f"Client disconnected: {websocket.remote_address}")
    finally:
        if room_name:
            await leave_room(websocket, room_name)
        if websocket in clients:
            del clients[websocket]

async def create_room(websocket, room_name):
    if not room_name:
        await websocket.send("Error: Room name is required to create a room.")
        return
    if room_name in rooms:
        await websocket.send(f"Error: Room '{room_name}' already exists.")
    else:
        rooms[room_name] = set()
        print(f"Room created: {room_name} by {clients.get(websocket, 'Unknown')}")
        await websocket.send(f"Room '{room_name}' created successfully.")

async def list_rooms(websocket):
    if rooms:
        room_list = ", ".join(rooms.keys())
        await websocket.send(f"Available rooms: {room_list}")
    else:
        await websocket.send("No rooms available.")

async def join_room(websocket, room_name, username):
    if room_name not in rooms:
        await websocket.send(f"Error: Room '{room_name}' does not exist.")
        return
    rooms[room_name].add(websocket)
    print(f"Client {username} joined room: {room_name}")
    await websocket.send(f"Joined room: {room_name}")
    await broadcast(f"{username} has joined the room.", room_name, websocket)

async def leave_room(websocket, room_name):
    if room_name in rooms and websocket in rooms[room_name]:
        username = clients.get(websocket, "Someone")
        rooms[room_name].remove(websocket)
        print(f"Client {username} left room: {room_name}")
        await broadcast(f"{username} has left the room.", room_name, websocket)
        if not rooms[room_name]:  # Remove empty rooms
            del rooms[room_name]

async def broadcast(message, room_name, sender):
    if room_name in rooms:
        for client in rooms[room_name]:
            if client != sender:
                try:
                    await client.send(message)
                except websockets.exceptions.ConnectionClosed:
                    pass

def run_server():
    asyncio.set_event_loop(asyncio.new_event_loop())  # Create and set a new event loop for the thread
    start_server = websockets.serve(handle_client, "localhost", 6789)
    asyncio.get_event_loop().run_until_complete(start_server)
    print("Server running on ws://localhost:6789")
    asyncio.get_event_loop().run_forever()

if __name__ == "__main__":
    server_thread = Thread(target=run_server)
    server_thread.start()
