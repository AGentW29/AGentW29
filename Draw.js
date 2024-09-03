const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const fs = require('fs');
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let drawingData = [];

// Load existing drawing data from file
const loadDrawingData = () => {
    try {
        const data = fs.readFileSync('drawingData.json');
        drawingData = JSON.parse(data);
    } catch (err) {
        console.error('Error reading drawing data:', err);
    }
};

// Save drawing data to file
const saveDrawingData = () => {
    fs.writeFileSync('drawingData.json', JSON.stringify(drawingData));
};

loadDrawingData();

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
    saveDrawingData();
    io.emit('draw', data); // Broadcast to all clients
  });

  socket.on('clear', () => {
    drawingData = [];
    saveDrawingData();
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
