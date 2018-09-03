var socket = io();

function scrollToBottom(){
 //Selectors
 var messages = jQuery('#messages');
 var newMessage = messages.children('li:last-child')
 //Heights
 var clientHeight = messages.prop('clientHeight');
 var scrollTop = messages.prop('scrollTop');
 var scrollHeight = messages.prop('scrollHeight');
 var newMessageHeight = newMessage.innerHeight();
 var lastMessageHeight = newMessage.prev().innerHeight();

 if(clientHeight + scrollTop + newMessageHeight + lastMessageHeight >= scrollHeight){
    //  console.log('clientHeight + scrollTop',clientHeight + scrollTop);
    //  console.log('scrollHeight',scrollHeight);
    //  console.log('Should scroll');
     messages.scrollTop(scrollHeight);
 }
}

socket.on('connect',function() {
    var params = jQuery.deparam(window.location.search);
    socket.emit('join',params, function(err){
        if(err){
            // alert(err);
            window.location.href = '/'
        }
        else {
            
            console.log('No error');
        }
    });
    console.log('Connected to server');
});

socket.on('disconnect',function() {
    console.log('Disconnected to server');
});

socket.on('updateUserList', function(users){
    // console.log('User List',users);
    var ol = jQuery('<ol></ol>');
    // users.append
    users.forEach(function(user){
        ol.append(jQuery('<li></li>').text(user));
    });
    jQuery('#users').html(ol);
});

socket.on('newMessage',function(message) {
    var formattedTime = moment(message.createdAt).format('h:mm a');
    var template = jQuery('#message-template').html();    
    var html = Mustache.render(template,{
        text: message.text,
        from: message.from,
        createdAt: formattedTime
    });
    // console.log("template",template);
    jQuery('#messages').append(html);
    scrollToBottom();
    // var formattedTime = moment(message.createdAt).format('h:mm a');
    // console.log('New Message ',message);
    // var li = jQuery('<li></li>');
    // li.text(`${message.from} ${formattedTime}: ${message.text}`);
    // jQuery('#messages').append(li);
});

socket.on('newLocationMessage',function(message){
    var formattedTime = moment(message.createdAt).format('h:mm a');
    var template = jQuery('#location-message-template').html();
    var html = Mustache.render(template,{
        from: message.from,
        url: message.url,
        createdAt: formattedTime
    });
    jQuery('#messages').append(html);
    scrollToBottom();
    // var li = jQuery('<li></li>');
    // var a = jQuery('<a>My current location</a>');
    // li.text(`${message.from} ${formattedTime}`);
    // a.attr('href',message.url);
    // li.append(a);
    // jQuery('#messages').append(li);
});
// socket.emit('createMessage', {
//     from:'Frank',
//     text:'Hi'
// },function (data) {
//     console.log('Got it : ',data);
// });

jQuery('#message-form').on('submit',function(e){
  e.preventDefault();
  var messageTextbox = jQuery('[name=message]');
  socket.emit('createMessage', {
      text: messageTextbox.val()
  },function(){
    messageTextbox.val('')
  });
});

var locationButton = jQuery('#send-location');
locationButton.on('click',function(){
    if(!navigator.geolocation){
        return alert('Geolocation not supported by your browser');
    }
    locationButton.attr('disabled','disabled').text('Sending location...');
    navigator.geolocation.getCurrentPosition(function(position){
        locationButton.removeAttr('disabled').text('Send Location');
        socket.emit('createLocationMessage',{
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        });
        console.log(position);
    },function(){
        locationButton.removeAttr('disabled');
        alert('Unable to fetch location.');
    })
});