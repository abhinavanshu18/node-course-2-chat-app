const path = require('path');
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const { generateMessage,generateLocationMessage } = require('./utils/message.js');
const { isRealString } = require('./utils/validation.js');
const { Users } = require('./utils/users');

const publicPath = path.join(__dirname,'../public');

const port = process.env.PORT || 3000;

var app = express();
var server = http.createServer(app);
var io = socketIO(server);
var users = new Users();

app.use(express.static(publicPath));

io.on('connection',(socket) => {
  console.log('New user connected');
  socket.on('disconnect',() => {
    var user = users.removeUser(socket.id);
    console.log('user.room',user);
    if(user)
    {
      console.log('user.room',user.room);
      io.to(user.room).emit('updateUserList',users.getUserList(user.room));
      io.to(user.room).emit('newMessage', generateMessage('Admin',`${user.name} has left.`));
    }
    console.log('Disconnected to server');
});

socket.on('join',(params,callback) => {
  if(!isRealString(params.name) || !isRealString(params.room)){
    callback('Name and room name are required');
  }
    socket.join(params.room);
    users.removeUser(socket.id);
    users.addUser(socket.id,params.name,params.room);

    io.to(params.room).emit('updateUserList',users.getUserList(params.room));
    socket.emit('newMessage',generateMessage('Admin','Welcome to chat app'));
    socket.broadcast.to(params.room).emit('newMessage', generateMessage('Admin',`${params.name} has joined.`));
    callback();

});

socket.on('createMessage',function(message,callback) {
  var user = users.getUser(socket.id);

  if(user && isRealString(message.text)){
    io.to(user.room).emit('newMessage', generateMessage(user.name, message.text));
  }
  console.log('New Email created',message);  
  callback('This is from the server.');
  });
  socket.on('createLocationMessage',(coords) => {
    var user = users.getUser(socket.id);
    if(user){
      io.emit('newLocationMessage',generateLocationMessage(user.name,coords.latitude,coords.longitude))
    }  
  })
})

server.listen(port ,() => {
   console.log('Server is up on port 3000'); 
});
