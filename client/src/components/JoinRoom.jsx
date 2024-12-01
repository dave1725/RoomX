import React, { useState } from "react";
import ChatRoom from "./ChatRoom";
import RoomList from "./RoomList";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from 'react-hot-toast';

const JoinRoom = () => {
  const [ roomName,setRoomName ] = useState('');
  const [ socket, setSocket ] = useState(null);

  const notify = (msg) => {
    toast(`${msg}`, {
      duration: 6000,
    });
  }

  const createRoom = async () => {
    if(!roomName.trim()){
      alert("Please enter a room name");
      return;
    }
    if(!socket){
      const ws = new WebSocket("ws://127.0.0.1:6789");
      ws.onopen = () => {
        ws.send(`CREATE_ROOM ${roomName}`);
        console.log("requested to create room");
      }
      ws.onmessage = (event) => {
        console.log(`Server: ${event.data}`);
      }
      ws.onerror = (error) => {
        console.log("websocket error",error);
      }
      ws.onclose = () => {
        console.log("connection closed");
      }
      setSocket(ws);
    }
    else{
      socket.send(`CREATE_ROOM ${roomName}`);
    }
    setRoomName("");
    window.location.reload();
  }

  const joinRoom = () => {
    if(!roomName.trim()){
      alert("Please enter a room name");
      return;
    }
    if(!socket){
      const ws = new WebSocket("ws://localhost:6789");
      ws.onopen = () => {
        ws.send(`JOIN ${roomName}`);
        console.log("Requested to join room");
      }
      ws.onmessage = (event) => {
        console.log(`Server: ${event.data}`);
      }
      ws.onerror = (error) => {
        console.log("Error: ",error);
      }
      ws.onclose = () => {
        console.log("socket closed");
      }
      setSocket(ws);
    }
    else{
      socket.send(`JOIN ${roomName}`);
    }
    setRoomName('');
  }

  return (
    <>
      <div className="room-options">
        <h1>RoomX</h1>
        <p>Welcome to Broadcast chat</p>
        <RoomList />
        <input type="text" 
        placeholder="Enter room name" 
        onChange={(e) => setRoomName(e.target.value)}
        ></input>
        <button onClick={createRoom}>Create</button>
        <button onClick={joinRoom}>JOIN</button>
      </div>
    </>
  );
}

export default JoinRoom;
