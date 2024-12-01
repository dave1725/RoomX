import React, { useState } from "react";
import RoomList from "./components/RoomList";
import JoinRoom from "./components/JoinRoom";
import ChatRoom from "./components/ChatRoom";
import { Routes,Route } from 'react-router-dom';

function App() {

  function sendMessage() {
      const input = document.getElementById("message");
      ws.send(`MESSAGE ${input.value}`);
      input.value = "";
  }
  return (
    <>
    <Routes>
      <Route path="/" element={<JoinRoom />} />
      <Route path="/rooms" element={<RoomList/>} />
      <Route path="/chat/:roomName" element={<ChatRoom/>} />
    </Routes>
    </>
  );
}

export default App;
