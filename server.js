// chat-server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const multer = require('multer');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage: storage });

app.use(express.static('public'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.post('/upload', upload.single('file'), (req, res) => {
    res.json({ filePath: `/uploads/${req.file.filename}` });
});

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

    socket.on('file-message', (filePath) => {
        io.to(socket.room).emit('file-message', { username: socket.username, filePath });
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
