#include "Webserver.h"

Webserver::Webserver(DataRecorder* dataRecPointer) {
  dataRec = dataRecPointer;
  
  server = new WiFiServer(80);
  
  WiFi.softAP(WIFI_SSID);
  Serial.println();
  Serial.print("Wireless AP Started: ");
  Serial.println(WIFI_SSID);
  Serial.print("Local IP address: ");
  Serial.println(WiFi.softAPIP());
  server->begin();
}

void Webserver::run(void) {
  WiFiClient client;
  String request;
  
  client = server->available();
  if (client) {
    /* Time the operation */
    jeffTimer = millis();
    
    /* check client is connected */
    while (client.connected()) {
      /* check if the client is requesting something */
      if (client.available()) {
        /* request end with '\r' -> this is HTTP protocol format */
        request = client.readStringUntil('\r');
        /*
         *  First line of HTTP request is "GET / HTTP/1.1"  
         *  here "GET /" is a request to get the first page at root "/"
         *  "HTTP/1.1" is HTTP version 1.1
         */

        /* Print out the raw Request */
        Serial.print("\nRaw Data: ");
        Serial.println(request);
        
        /* now we parse the request to see which page the client want */
        int addr_start = request.indexOf(' ');
        int addr_end = request.indexOf(' ', addr_start + 1);
        if (addr_start == -1 || addr_end == -1) {
          Serial.print("Invalid request: ");
          Serial.println(request);
          return;
        }
        request = request.substring(addr_start + 1, addr_end);

        /* finish reading in the rest of the request we ignored */
        client.flush();
      
        /* Send the proper response */
        if (request == "/") {
          client.write(STATUS200);
          client.println("Content-Type: text/html");
          client.println();
          client.write(INDEX_HTML);
        } else if (request == "/scripts.js") {
          client.write(STATUS200);
          client.println("Content-Type: text/javascript");
          client.println();
          client.write(SCRIPTS_JS);
        } else if (request == "/stylesheet.css") {
          client.write(STATUS200);
          client.println("Content-Type: text/css");
          client.println();
          client.write(STYLESHEET_CSS);
        } else if (request == "/functions/getTableData()") {
          client.write(STATUS200);
          client.println("Content-Type: text/plain");
          client.println();
          client.println("100, 250, 2031, 432, 4321, 12321");
        } else if (request == "/functions/getData()") {
          client.write(STATUS200);
          client.println("Content-Type: text/plain");
          client.println();
          client.write("X,Y,Z\n");
          //String test = dataRec->getSingleDataSet(1);
          for(uint16_t index = 0; index < dataRec->m_totalReordedPoints; index++ )
          {
            client.write((dataRec->getSingleDataSet(index)).c_str());
          }
        } else if (request == "/functions/startRecord()") {
          /* Ask CPU1 to start recording */
          dataRec->record();
          client.write(STATUS200);
          client.println("Content-Type: text/plain");
          client.println();
        } else if (request == "/functions/stopRecord()") {
          dataRec->stopRecord();
          client.write(STATUS200);
          client.println("Content-Type: text/plain");
        } else {
          Serial.println("Unknown Request");
          client.write(STATUS404);
        }
        
        /* send response back to client and then close connect since HTTP do not keep connection*/
        client.println();
        client.stop();

        /*
        if(response != NULL) {
          free(response);
        }
        */
        Serial.print("Operation took ");
        Serial.print(millis() - jeffTimer);
        Serial.println(" ms");
      }
    }
  }
}

