var http = require ('http');
var fs = require('fs');
var querystring = require('querystring');
var port = 8080;
var filename;
var url;
var numNewElements = 0;
var server = http.createServer(handleRequest);
var elements = [];

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
  else if(request.method == 'POST') {
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

  else if(request.method == 'PUT') {
    request.on('data', function(chunk) {
      postData = chunk.toString();
      var parsed = querystring.parse(postData);

      var newElementName = parsed.elementName;
      var newElementSymbol = parsed.elementSymbol;
      var newElementAtomicNumber = parsed.elementAtomicNumber;
      var newElementDescription = parsed.elementDescription;

      var newElementHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>The Elements - ${newElementName}</title>
  <link rel="stylesheet" href="css/styles.css" type="text/css">
</head>
<body>
  <h1>${newElementName}</h1>
  <h2>${newElementSymbol}</h2>
  <h3>Atomic number ${newElementAtomicNumber}</h3>
  <p>${newElementDescription}</p>
  <p><a href="/">back</a></p>
</body>
</html>`;

      fs.access('./public/' + newElementName.toLowerCase() + '.html', function (err) {
        if(err) {
          console.log("Cannot call PUT on a file that doesn't exist.");
          response.writeHead(404, {'Content-Type' : 'application/json'});
          response.write('{ "error" : "resource /' + newElementName.toLowerCase() + '.html does not exist" }');
          response.end();
        }
        else {
          fs.writeFile("./public/" + newElementName.toLowerCase() + ".html", newElementHTML, function (err) {
            if (err) throw err;
            console.log("Element file: " + newElementName.toLowerCase() + ".html edited.");
            response.writeHead(200, {'Content-Type' : 'application/json'});
            response.write('{"success" : true}');
            response.end();
          });
        }
      });
    });

    request.on('error', function (e) {
      throw new Error(e);
    });
  }

  else if(request.method == 'DELETE') {
    var fileToDelete = request.url;
    elementName = fileToDelete.replace('.html', '');
    fs.access('./public' + fileToDelete, function (err) {
      if(err) {
        console.log("Unable to find file to delete.");
        response.writeHead(404);
        response.end();
      }
      else {
        fs.unlink('./public' + fileToDelete);
        console.log("Removed " + fileToDelete);
        elements.splice(elements.indexOf(fileToDelete), 1);
        appendToIndex();
        numNewElements--;
        response.writeHead(200);
        response.end();
      }
    });

    response.on('error', function (err) {
      throw new Error(err);
    });
  }
  function createNewPage(postData) {
    var elementName;
    var elementSymbol;
    var elementAtomicNumber;
    var elementDescription;
    var pairs = [];
    var queryArray = postData.split('&');

    console.log("num Elements: " + numNewElements);
    for(var i = 0; i < queryArray.length; i++) {
      pairs[i] = queryArray[i].split('=');
    }
    elementName = pairs[0][1];
    elementSymbol = pairs[1][1];
    elementAtomicNumber = pairs[2][1];
    elementDescription = pairs[3][1];
    editedDescription = elementDescription.replace(/\+/g, " ");

    elements[numNewElements] = '<li>\n' +
                            '<a href="' + elementName.toLowerCase() + '.html' +  '">' + elementName + '</a>\n' +
                          '</li>\n';

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

    fs.access('./public/' + elementName.toLowerCase() + '.html', function (err) {
      if(!err) {
        console.log("File already exists.");
        response.writeHead(400);
        response.end();
      }
      else {
        fs.writeFile("./public/" + elementName.toLowerCase() + ".html", newHTMLPage, function (err) {
          if (err) throw err;
          console.log("New element file: " + elementName.toLowerCase() + ".html created.");
          numNewElements++;
          appendToIndex();
          response.writeHead(200);
          response.end();
        });
      }
    });

  }

  function appendToIndex() {
    var elementsHTML = "";
    console.log("elements.length: " + elements.length);
    for (var j = 0; j < elements.length; j++) {
      elementsHTML += elements[j];
    }

    var indexData = '<!DOCTYPE html>\n' +
                       '<html lang="en">\n' +
                       '<head>\n' +
                         '<meta charset="UTF-8">\n' +
                         '<title>The Elements</title>\n' +
                         '<link rel="stylesheet" href="/css/styles.css">\n' +
                       '</head>\n' +
                       '<body>\n' +
                         '<h1>The Elements</h1>\n' +
                         '<h2>These are all the known elements</h2>\n' +
                         '<h3>These are ' + (elements.length + 2) + '</h3>\n' +
                         '<ol>\n' +
                          '<li>\n' +
                            '<a href="hydrogen.html">Hydrogen</a>\n' +
                          '</li>\n' +
                          '<li>\n' +
                            '<a href="helium.html">Helium</a>\n' +
                          '</li>\n' +
                          elementsHTML +
                        '</ol>\n' +
                       '</body>\n' +
                       '</html>';

      fs.writeFile('./public/index.html', indexData, function (err) {
        if (err) throw err;
        console.log("Added new link to index.html.");
      });
      elementsHTML = "";
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

