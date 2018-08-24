var socket = io();
socket.on('connect',function() {
    console.log('Connected to server');
});
socket.on('disconnect',function() {
    console.log('Disconnected to server');
});
socket.on('newMessage',function(email) {
    console.log('New Email ',email);
});