import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import io from "socket.io-client";

const width = 800;
const height = 800;
const radius = 20;

const StyledCanvas = styled.canvas`
  width: ${width}px;
  height: ${height}px;
  border: 2px solid black;
  margin: auto;
`;

const PageContainer = styled.div`
  display: flex;
  align-content: center;
  justify-content: center;
  height: 100vh;
  background-color: #33658a;
`;

const keyDown = {};

function App() {
  const canvas = useRef();
  const [playerState, setPlayerState] = useState({});
  const [socket, setSocket] = useState();

  useEffect(() => {
    const socket = io();
    setSocket(socket);

    socket.on("updateState", setPlayerState);

    const keydownListener = e => {
      if (keyDown[e.code]) {
        return;
      }
      keyDown[e.code] = true;
      switch (e.code) {
        case "ArrowUp":
        case "KeyW":
          socket.emit("move", { y: -1 });
          break;
        case "ArrowDown":
        case "KeyS":
          socket.emit("move", { y: 1 });
          break;
        case "ArrowLeft":
        case "KeyA":
          socket.emit("move", { x: -1 });
          break;
        case "ArrowRight":
        case "KeyD":
          socket.emit("move", { x: 1 });
          break;
        case "Space":
          break;
        default:
          break;
      }
    };

    const keyupListener = e => {
      delete keyDown[e.code];
      switch (e.code) {
        case "ArrowUp":
        case "KeyW":
          socket.emit("move", { y: 1 });
          break;
        case "ArrowDown":
        case "KeyS":
          socket.emit("move", { y: -1 });
          break;
        case "ArrowLeft":
        case "KeyA":
          socket.emit("move", { x: 1 });
          break;
        case "ArrowRight":
        case "KeyD":
          socket.emit("move", { x: -1 });
          break;
        case "Space":
          break;
        default:
          break;
      }
    };

    document.addEventListener("keydown", keydownListener);
    document.addEventListener("keyup", keyupListener);

    return () => {
      document.removeEventListener("keydown", keydownListener);
      document.removeEventListener("keyup", keyupListener);
    };
  }, []);

  useEffect(() => {
    if (canvas.current) {
      const ctx = canvas.current.getContext("2d");
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = "#2F4858";
      ctx.fillRect(0, 0, width, height);
      Object.values(playerState).forEach(p => {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, radius, 0, 2 * Math.PI);
        ctx.fill();
      });
    }
  }, [canvas, playerState]);

  // useEffect(() => {
  //   console.log(playerState);
  // }, [playerState]);

  return (
    <PageContainer>
      <StyledCanvas ref={canvas} {...{ width, height }} />
    </PageContainer>
  );
}

export default App;
