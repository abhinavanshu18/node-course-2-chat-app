const path = require('path');
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const { generateMessage } = require('./utils/message.js');
const publicPath = path.join(__dirname,'../public');

const port = process.env.PORT || 3000;

var app = express();
var server = http.createServer(app);
var io = socketIO(server);

app.use(express.static(publicPath));

io.on('connection',(socket) => {
  console.log('New user connected');
  socket.emit('newMessage',generateMessage('Admin','Welcome to chat app'));
  socket.broadcast.emit('newMessage', generateMessage('Admin','New user joined'));
  socket.on('disconnect',() => {
    console.log('Disconnected to server');
});
// socket.emit('newMessage',{
//   from:'abhi@example.com',
//   text:'Hey man, how is everything going',
//   createAt: 123
// })
socket.on('createMessage',function(message,callback) {
  console.log('New Email created',message);
  io.emit('newMessage', generateMessage(message.from, message.text));
  callback('This is from the server.');
  });
})
server.listen(port ,() => {
   console.log('Server is up on port 3000'); 
});
