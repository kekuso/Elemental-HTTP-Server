var http = require ('http');
var fs = require('fs');
var querystring = require('querystring');
var port = 8080;
var filename;
var url;

var server = http.createServer(handleRequest);

function handleRequest(request, response) {
  var postData;

  // GET method
  if(request.method == 'GET') {
    url = request.url.toString();
    filename = url.replace('localhost', '');

    if(filename === '/') {
      filename = 'index.html';
    }

    fs.exists('./public/' + filename, function(exists) {
      if(exists) {
        console.log("file name: " + filename);
        fs.readFile('./public/' + filename, function (err, messageBody) {
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

  // POST method
  if(request.method == 'POST') {
    request.on('error', function (e) {
      throw new Error(e);
    });

    request.on('data', function(chunk) {
      postData = querystring.parse(chunk);
      response.writeHead(200);
      response.write(chunk);

      var elementName = getElementName(chunk);
      response.end();
    });
  }

  function getElementName(chunk) {
    var index = chunk.indexOf('&');
    return chunk.slice(11, index);
  }
  request.on('end', function () {
    console.log('No more data.');
    server.close();
  });

  request.on('error', function () {
    console.log("problem with request.");
  });
}

server.listen(port, function () {
  console.log("Server is listening on localhost: " + port);
});

server.on('clientError', function(err, socket) {
  socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
});

// server.on('request', function (request, response) {

// });

// fs.writeFile("./public", "Boron", function (err) {
//   if (err) throw err;
//   console.log("file saved.");
// });


// var postData = querystring.stringify({
//   'msg' : 'Hello World!'
// });

// var options = {
//   hostname: 'localhost',
//   port: port,
//   path: '/',
//   method: 'POST',
//   headers: {
//     'Content-Type': 'application/x-www-form-urlencoded',
//     'Content-Length': Buffer.byteLength(postData)
//   }
// };

// var req = http.request(options, function(res) {
//   console.log('STATUS: ' + res.statusCode);
//   console.log('HEADERS: ' + res.headers.toString());
//   res.setEncoding('utf8');
//   res.on('data', function(chunk) {
//     console.log('BODY: ' + chunk);

//   });
//   res.on('end', function () {
//     console.log('No more data in response.');
//   });
// });

// req.on('error', function(e) {
//   console.log('problem with request: ' + e);
// });

// req.write(postData);
// req.end();