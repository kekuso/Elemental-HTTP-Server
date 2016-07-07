var http = require ('http');
var fs = require('fs');
var port = 8080;
var filename;
var url;

var server = http.createServer(handleRequest);

function handleRequest(request, response) {
  url = request.url.toString();
  filename = url.replace('localhost', '');

  if(filename === '/') {
    filename = '/public/index.html';
  }

  fs.exists('.' + filename, function(exists) {
    if(exists) {
      console.log("file path: " + filename);
      fs.readFile('.' + filename, function (err, messageBody) {
        if(err) throw err;
        console.log(response.statusCode);
        response.writeHead(200);
        response.write('\n' + messageBody);
        response.end();
      });
    }
    else {
      fs.readFile('./public/404.html', function (err, messageBody) {
        if(err) throw err;
        response.writeHead(404);
        response.write('\n' + messageBody);
        response.end();
      });
    }
  });
}

server.listen(port, function () {
  console.log("Server is listening on localhost: " + port);
});

server.on('clientError', function(err, socket) {
  socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
});

server.on('request', function (request, response) {

});