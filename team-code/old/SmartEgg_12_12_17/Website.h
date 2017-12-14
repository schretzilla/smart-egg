/*
 *  Sometimes the world sucks, and we just have to define
 *  everything as a constant
 * 
 *  Use a string literal, so we don't have to use
 *  annoying ass backslashes
 * 
 *  This probably isn't a very clean way to do things
 */

#ifndef WEBSITE_H 
#define WEBSITE_H

static char STATUS200PLAIN[] = R"======(
HTTP/1.1 200 OK
Content-type:text/plain
Connection: close

)======";

static char STATUS200HTML[] = R"======(
HTTP/1.1 200 OK
Content-type:text/html
Connection: close

)======";

static char STATUS404[] = R"======(
HTTP/1.1 404 Not Found
)======";

static char INDEX_HTML[] = R"======(
<!DOCTYPE HTML>
<html>
  <head>
  <title>Digital Egg Drop Page</title>
  <script src="/js/myscript.js"></script>

  </head>
  <body>
    <h1>Welcome to the drop page!</h1>
    <button type="button" onclick="startRecord()">Start Recording</button>
    <button type="button" onclick="stopRecord()">Stop Recording</button>
    <button type="button" onclick="getData()">Get Data</button>
  </body>
</html>
)======";


static char MYSCRIPTS_JS[] = R"======(
function getData() {
  HTTPRequest("functions/getData()", function(response) {alert(response)});

}

function startRecord() {
  HTTPRequest("functions/startRecord()", function(response) {alert(response)});

}

function stopRecord() {
  HTTPRequest("functions/stopRecord()", function(response) {alert(response)});

}

/* 
 *  Keep compatibility with multiple web browsers
 *  I'm looking at you Internet Explorer
 */
function makeHTTPObject() {
  try {return new XMLHttpRequest();}
  catch (error) {}
  try {return new ActiveXObject("Msxml2.XMLHTTP");}
  catch (error) {}
  try {return new ActiveXObject("Microsoft.XMLHTTP");}
  catch (error) {}

  throw new Error("Could not create HTTP request object.");
}

/* Make a new Http Request */
function HTTPRequest(url, successFunction) {
  var request = makeHTTPObject();

  request.onreadystatechange = function() {
    if(request.readyState == 4) {
      if(request.status == 200) {
        successFunction(request.responseText);
      } else {
        /* Return an empty string if there's no data */
        throw new Error("Empty Data in HTTP Request");
      }
    }
  }

  request.open("GET", url, true);
  request.send(null);
}
)======";
#endif /* WEBSITE_H */
