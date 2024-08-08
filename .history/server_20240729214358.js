// chat-server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public'));

io.on('connection', (socket) => {
    socket.on('join', ({ username, room }) => {
        socket.join(room);
        socket.username = username;
        socket.room = room;
        io.to(room).emit('user-joined', { username, room });
        console.log(`${username} joined room ${room}`);
    });

    socket.on('chat-message', (message) => {
        io.to(socket.room).emit('chat-message', { username: socket.username, message });
    });

    socket.on('disconnect', () => {
        if (socket.room) {
            io.to(socket.room).emit('user-left', socket.username);
        }
        console.log(`${socket.username} disconnected`);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
