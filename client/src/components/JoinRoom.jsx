import React, { useState } from "react";
import RoomList from "./RoomList";
import toast, { Toaster } from "react-hot-toast";

const JoinRoom = () => {
  const [roomName, setRoomName] = useState("");
  const [socket, setSocket] = useState(null);

  const createRoom = () => {
    if (!roomName.trim()) {
      alert("Please enter a room name");
      return;
    }
    if (!socket) {
      const ws = new WebSocket("ws://127.0.0.1:6789");
      ws.onopen = () => ws.send(`CREATE_ROOM ${roomName}`);
      ws.onmessage = (event) => console.log(`Server: ${event.data}`);
      setSocket(ws);
    } else {
      socket.send(`CREATE_ROOM ${roomName}`);
    }
    setRoomName("");
    window.location.reload();
  };

  const joinRoom = () => {
    if (!roomName.trim()) {
      alert("Please enter a room name");
      return;
    }
    if (!socket) {
      const ws = new WebSocket("ws://localhost:6789");
      ws.onopen = () => ws.send(`JOIN ${roomName}`);
      ws.onmessage = (event) => console.log(`Server: ${event.data}`);
      setSocket(ws);
    } else {
      socket.send(`JOIN ${roomName}`);
    }
    setRoomName("");
  };

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-4">RoomX</h1>
      <p className="mb-4">Welcome to Broadcast chat</p>
      <RoomList />
      <div className="flex gap-2 mt-4">
        <input
          type="text"
          placeholder="Enter room name"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
          className="border rounded p-2 flex-1"
        />
        <button
          onClick={createRoom}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Create
        </button>
        <button
          onClick={joinRoom}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Join
        </button>
      </div>
      <Toaster />
    </div>
  );
};

export default JoinRoom;
