import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function RoomList() {
  const [rooms, setRooms] = useState([]);
  const [socket, setSocket] = useState(null);
  const [username, setUsername] = useState("");
  const [isUsernameSet, setIsUsernameSet] = useState(false);
  const navigate = useNavigate();

  const joinRoom = (room) => {
    if (!isUsernameSet) {
      alert("Please set your username before joining a room.");
      return;
    }
    if (!room.trim()) {
      alert("Room name is invalid.");
      return;
    }
    socket.send(`JOIN ${room}`);
    navigate(`/chat/${room}`);
  };

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:6789");
    ws.onopen = () => ws.send(`LIST_ROOMS`);
    ws.onmessage = (event) => {
      const message = event.data;
      if (message.startsWith("Available rooms:")) {
        setRooms(
          message.replace("Available rooms: ", "").split(", ").filter(Boolean)
        );
      }
    };
    setSocket(ws);
  }, []);

  const setUsernameHandler = () => {
    if (username.trim()) {
      socket.send(`SET_USERNAME ${username}`);
      localStorage.setItem("username", username);
      setIsUsernameSet(true);
    } else {
      alert("Enter a valid username.");
    }
  };

  return (
    <div className="p-4">
      <div className="mb-4">
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter your username"
          className="border rounded p-2 mr-2"
        />
        <button
          onClick={setUsernameHandler}
          className={`px-4 py-2 rounded ${
            isUsernameSet ? "bg-gray-400 text-white" : "bg-blue-500 text-white"
          }`}
          disabled={isUsernameSet}
        >
          {isUsernameSet ? "Username Set" : "Set Username"}
        </button>
      </div>
      <h1 className="text-xl font-bold mb-4">Public Rooms</h1>
      {rooms.length > 0 ? (
        rooms.map((room) => (
          <div
            key={room}
            className="flex justify-between items-center border-b py-2"
          >
            <span>{room}</span>
            <button
              onClick={() => joinRoom(room)}
              className="bg-blue-500 text-white px-4 py-1 rounded"
            >
              Join
            </button>
          </div>
        ))
      ) : (
        <p className="text-gray-500">No rooms available!</p>
      )}
    </div>
  );
}

export default RoomList;
