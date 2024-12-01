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
    console.log(`Requested to join room: ${room}`);
    navigate(`/chat/${room}`);
  };

  const handleServerMessage = (message) => {
    if (message.startsWith("Available rooms:")) {
      const roomList = message.replace("Available rooms: ", "").split(", ");
      setRooms(roomList.filter((room) => room.trim() !== "")); // Update room list
    } else {
      console.log("Message from server:", message);
    }
  };

  const handleSetUsername = () => {
    if (socket && username.trim()) {
      socket.send(`SET_USERNAME ${username}`);
      localStorage.setItem("username", username); // Store the username in localStorage
      setIsUsernameSet(true);
    } else {
      alert("Please enter a valid username.");
    }
  };

  useEffect(() => {
    if (!socket) {
      const ws = new WebSocket("ws://localhost:6789");
      ws.onopen = () => {
        ws.send(`LIST_ROOMS`);
        console.log("Requested to list rooms.");
      };
      ws.onmessage = (event) => {
        console.log(`Server: ${event.data}`);
        handleServerMessage(event.data);
      };
      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
      };
      ws.onclose = () => {
        console.log("Socket closed.");
      };
      setSocket(ws);
    }
  }, []);

  return (
    <div>
      <p>make sure to create an username before joining</p>
      <div>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter your username"
        />
        <button onClick={handleSetUsername} disabled={isUsernameSet}>
          {isUsernameSet ? "Username Set" : "Set Username"}
        </button>
      </div>
      <h1>Public Rooms</h1>
      {rooms.length > 0 ? (
        rooms.map((room) => (
          <div key={room}>
            <span>{room}</span>
            <button onClick={() => joinRoom(room)}>JOIN</button>
          </div>
        ))
      ) : (
        <p>No rooms available!</p>
      )}
    </div>
  );
}

export default RoomList;
