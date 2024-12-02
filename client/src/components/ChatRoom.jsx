import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

function ChatRoom() {
  const { roomName } = useParams();
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [username, setUsername] = useState("");

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:6789");

    ws.onopen = () => {
      const storedUsername = localStorage.getItem("username");
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

    ws.onerror = (error) => console.error("WebSocket error:", error);

    ws.onclose = () => console.log("WebSocket connection closed.");

    setSocket(ws);
    return () => ws.close();
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
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Chat Room: {roomName}</h1>
      <div className="border rounded p-4 h-80 overflow-y-scroll mb-4">
        {messages.map((msg, index) => (
          <p key={index} className="text-sm">
            {msg}
          </p>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 border rounded p-2"
        />
        <button
          onClick={sendMessage}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default ChatRoom;
