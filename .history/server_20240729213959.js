// chat-server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('join', (username) => {
        socket.username = username;
        io.emit('user-joined', username);
        console.log(`${username} joined the chat`);
    });

    socket.on('chat-message', (message) => {
        io.emit('chat-message', { username: socket.username, message });
    });

    socket.on('disconnect', () => {
        io.emit('user-left', socket.username);
        console.log('A user disconnected');
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
