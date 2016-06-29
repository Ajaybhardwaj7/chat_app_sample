var http = require('http');
var path = require('path');
var mime  = require('mime');
var io = require('socket.io');
var fs = require('fs');


var filepath  = "";
var contentType = "";

var sendContent = function (response , data) {
	response.writeHead(200 , {'Content-Type' : contentType});
	response.write(data);
	response.end();
}

var send404 = function(response){
	response.writeHead(404 , {'Content-Type' : contentType});
	response.write("File NOT Found");
	response.end();
}
var serveStatic = function(response , filepath){
	var abspath = './'+ filepath;

	fs.exists(abspath , function(exists){
		if(exists){
			fs.readFile(abspath , function (err, data) {
				if(err){
					return send404(response);
				}

				sendContent(response ,data);
			})
		}else{
				return send404(response);
		}

	})
}

var server = http.createServer(function(request , response){
	if(request.url == '/'){
		filepath = 'public/index.html';
	}
	
	contentType = mime.lookup(path.basename(filepath));
	serveStatic(response , filepath);

});

server.listen(3000 , function(){
	console.log('The server is listening at port 3000');
});

var listener = io.listen(server);



listener.sockets.on('connection' , function(socket){	

	var username = '';
	socket.emit('clientStatus' , 'connected');
	
	socket.on('broadcastOthers' , function(name){
		username = name;
		socket.broadcast.emit('userStatus' , name +" connected");
	});
	socket.on('clientData' , function(data){
		socket.emit('serverResponse' , data);
		socket.broadcast.emit('serverResponse' , data);	
		
	});

	socket.on('disconnect' , function(){
		socket.broadcast.emit('userStatus' , username+ ' disconnected');
	});
})






