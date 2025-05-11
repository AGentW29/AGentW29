// server.js
const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');

const wss = new WebSocket.Server({ port: 8080 });
const messagesFile = path.join(__dirname, 'messages.json');

// Helper function to load messages from the JSON file
function loadMessages() {
    if (fs.existsSync(messagesFile)) {
        const data = fs.readFileSync(messagesFile);
        return JSON.parse(data);
    }
    return [];
}

// Helper function to save messages to the JSON file
function saveMessages(messages) {
    fs.writeFileSync(messagesFile, JSON.stringify(messages, null, 2));
}

wss.on('connection', function connection(ws) {
    // Send the existing chat history to the newly connected client
    ws.send(JSON.stringify({ type: 'history', data: loadMessages() }));

    ws.on('message', function incoming(message) {
        const parsedMessage = JSON.parse(message);
        const messages = loadMessages();

        // Add the new message to the history
        messages.push(parsedMessage);

        // Save the updated message list
        saveMessages(messages);

        // Broadcast the new message to all clients
        wss.clients.forEach(function each(client) {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    });
});

console.log('WebSocket server running on ws://localhost:8080');
