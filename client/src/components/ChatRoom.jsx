import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

function ChatRoom() {
  const { roomName } = useParams(); // Access the room name from the URL
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [username, setUsername] = useState("");

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:6789");

    ws.onopen = () => {
      console.log(`Connected to room: ${roomName}`);
      const storedUsername = localStorage.getItem("username"); // Retrieve username from localStorage
      if (storedUsername) {
        setUsername(storedUsername);
        ws.send(`SET_USERNAME ${storedUsername}`);
        ws.send(`JOIN ${roomName}`);
      } else {
        alert("Please set your username before joining.");
        ws.close();
      }
    };

    ws.onmessage = (event) => {
      setMessages((prevMessages) => [...prevMessages, event.data]);
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.onclose = () => {
      console.log("WebSocket connection closed.");
    };

    setSocket(ws);

    return () => {
      ws.close();
    };
  }, [roomName]);

  const sendMessage = () => {
    if (socket && newMessage.trim()) {
      const messageToSend = `${username}: ${newMessage}`;
      socket.send(`MESSAGE ${messageToSend}`);
      setMessages((prevMessages) => [...prevMessages, `You: ${newMessage}`]);
      setNewMessage("");
    }
  };

  return (
    <div>
      <h1>Chat Room: {roomName}</h1>
      <div style={{ border: "1px solid #ccc", padding: "10px", marginBottom: "10px", height: "300px", overflowY: "scroll" }}>
        {messages.map((msg, index) => (
          <p key={index}>{msg}</p>
        ))}
      </div>
      <input
        type="text"
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        placeholder="Type your message..."
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}

export default ChatRoom;
