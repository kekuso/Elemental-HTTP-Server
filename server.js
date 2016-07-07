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
    filename = url.replace('localhost', '').toLowerCase();

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
      postData = chunk.toString();
      // var parsed = querystring.parse(request.url);
      // console.log("Parsed query string: " + parsed);
      response.writeHead(200);
      response.write(chunk);

      createNewPage(postData);
      response.end();
    });
  }

  function createNewPage(postData) {
    var elementName;
    var elementSymbol;
    var elementAtomicNumber;
    var elementDescription;
    var pairs = [];
    var queryArray = postData.split('&');
    for(var i = 0; i < queryArray.length; i++) {
      pairs[i] = queryArray[i].split('=');
    }

    elementName = pairs[0][1];
    elementSymbol = pairs[1][1];
    elementAtomicNumber = pairs[2][1];
    elementDescription = pairs[3][1];
    editedDescription = elementDescription.replace(/\+/g, " ");

    var newHTMLPage =  '<!DOCTYPE html>\n' +
                       '<html lang="en">\n' +
                       '<head>\n' +
                         '<meta charset="UTF-8">\n' +
                         '<title>The Elements - '+ elementName +'</title>\n' +
                         '<link rel="stylesheet" href="/css/styles.css">\n' +
                       '</head>\n' +
                       '<body>\n' +
                         '<h1>'+ elementName + '</h1>\n' +
                         '<h2>'+ elementSymbol + '</h2>\n' +
                         '<h3>Atomic number '+ elementAtomicNumber + '</h3>\n' +
                         '<p>' + editedDescription + '</p>\n' +
                         '<p><a href="/">back</a></p>\n' +
                       '</body>\n' +
                       '</html>';

    fs.writeFile("./public/" + elementName.toLowerCase() + ".html", newHTMLPage, function (err) {
      if (err) throw err;
      console.log("New file created.");
    });
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

