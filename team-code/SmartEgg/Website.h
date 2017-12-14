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

const char STATUS200[] PROGMEM = R"======(
HTTP/1.1 200 OK
Connection: close
)======";

const char STATUS404[] PROGMEM = R"======(
HTTP/1.1 404 Not Found
Connection: close
)======";

const char INDEX_HTML[] PROGMEM = R"======(
<!DOCTYPE HTML>

<html>
  <head>
  <title>Digital Egg Drop Page</title>
  <script src="./scripts.js"></script>

  </head>
  <body>
    <h1>Welcome to the drop page!</h1>
    <div>
      <button type="button" onclick="startRecord()">Start Recording</button>
      <button type="button" onclick="stopRecord()">Stop Recording</button>
      <button type="button" onclick="getData()">Get Data</button>
    </div>
    <table>
      <tr>
        <th>Axis</th>
        <th>Raw</th>
      <tr>
        <th>x</th>
        <th id="rawX">0.0</th>
      </tr>
      <tr>
        <th>y</th>
        <th id="rawY">0.0</th>
      </tr>
      <tr>
        <th>z</th>
        <th id="rawZ">0.0</th>
      </tr>
    </table>
  </body>
</html>
)======";

const char STYLESHEET_CSS[] PROGMEM = R"======(

)======";

const char SCRIPTS_JS[] PROGMEM = R"======(
function updateEvents() {
  setInterval(updateTable(), 1000);
}

function getData() {
  HTTPRequest("functions/getData()", function(response) {console.log(response)});

}

function startRecord() {
  HTTPRequest("functions/startRecord()", function(response) {});

}

function stopRecord() {
  HTTPRequest("functions/stopRecord()", function(response) {});

}

function setData(elementID, value) {
  document.getElementById(elementID).innerHTML = value;
}

function updateTable() {
  HTTPRequest("functions/getTableData()", function(response) {
    var dataArray = getDataArray(response);

    setData("rawX", dataArray[0]);
    setData("rawY", dataArray[1]);
    setData("rawZ", dataArray[2]);
  });
}

function getDataArray(dataString) {
    dataString = dataString.trim();
    var dataArray = new Array();
    
    while(dataString.indexOf(',') != -1) {
      dataArray.push(dataString.substring(0, dataString.indexOf(',')));
      dataString = dataString.substring(dataString.indexOf(',') + 1).trim();
    }
    dataArray.push(dataString);

    return dataArray;
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

//window.onload =

)======";
#endif /* WEBSITE_H */
