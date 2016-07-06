var http = require ('http');
var port = 8080;

var server = http.createServer(handleRequest);

function handleRequest(request, response) {
  response.end('Path hit: ' + request.url + '\n' +
                'Socket: ' + request.socket.toString() + '\n' +
                'Authentication details: ');
}

server.listen(port, function () {
  console.log("Server is listening on localhost: " + port);
});

server.on('clientError', function(err, socket) {
  socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
});