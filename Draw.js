alert('Draw.js is loaded');
const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

const socket = io();
alert('Attempting to connect to the socket...');

socket.on('connect', () => {
    alert('Socket connected!');
});

socket.on('connect_error', (err) => {
    alert('Connection Error: ' + err.message);
});

let drawingData = []; // Array to store drawing commands

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/Draw.html');
});

io.on('connection', (socket) => {
  console.log('A user connected');

  // Send existing drawing data to the new client
  socket.emit('loadDrawing', drawingData);

  socket.on('draw', (data) => {
    drawingData.push(data); // Save the drawing command
    socket.broadcast.emit('draw', data);
  });

  socket.on('clear', () => {
    drawingData = []; // Clear the saved drawing data
    io.emit('clear');
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
