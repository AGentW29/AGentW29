const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let drawingData = []; // Array to store drawing commands

app.use(express.static(__dirname));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/Draw.html');
});

io.on('connection', (socket) => {
  console.log('A user connected');

  // Send existing drawing data to the new client
  socket.emit('loadDrawing', drawingData);

  socket.on('draw', (data) => {
    drawingData.push(data);
    io.emit('draw', data); // Broadcast to all clients
  });

  socket.on('clear', () => {
    drawingData = [];
    io.emit('clear');
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
