const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const PORT = process.env.PORT || 8080;
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST","PUT","DELETE"],
  },
});

io.on('connection', (socket) => {
    
 // console.log(`Socket connected: ${socket.id}`);
 
  socket.on('joinRoom', (data) => {
          console.log(`client joined room: ${data.roomId}`);
          socket.join(data.roomId);
          io.to(data.roomId).emit('joinRoom', data);
    });

  // code for squareClicked-selectedIndexes
  socket.on('squareClicked', (data) => {
    io.to(data.roomId).emit('squareClicked', data);
  });

  socket.on('disconnect', () => {
   // console.log(`User disconnected with socket id: ${socket.id}`);
  });
});// end of io.on

server.listen(PORT, () => {
  console.log(`Server running on PORT ${PORT}`);
});
