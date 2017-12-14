#include <WiFi.h>
#include <ESPmDNS.h>
#include <WiFiClient.h>
#include "Website.h"
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"

const char* ssid = "SmartEgg";
boolean cpu0InitDone = false;
long jeffTimer;

/* TCP server at port 80 will respond to HTTP requests */
WiFiServer server(80);

void webServerLoop();

void webServerTask(void *pvParameters) {
  for(;;) {
    webServerLoop();
    
    /* Delay 10ms so the idle watchdog stops complaining */
    vTaskDelay(5);
  }
}

void setup(void)
{  
  Serial.begin(250000);
  /* Connect to WiFi network */

  WiFi.softAP(ssid);

  Serial.println();
  Serial.print("Wireless AP Started: ");
  Serial.println(ssid);
  Serial.print("Local IP address: ");
  Serial.println(WiFi.softAPIP());

  server.begin();

  /* Force webserver to run on core 0, since core 0 usually handles wifi and bluetooth */
  xTaskCreatePinnedToCore(webServerTask, "webServerLoop", 2048, NULL, 10, NULL, 0);
}

void loop(void)
{
  /* Add datalogging stuff here, main loop runs on core 1 */
  
}

/* 
 *  Concatenate strings
 *  WARNING: USES MALLOC, MAKE SURE TO FREE DATA AFTER
 */
char* cArrCat(const char* first, const char* second) {
  int outLen = strlen(first) + strlen(second) + 2;
  Serial.print("new Char Length: ");
  Serial.println(outLen);
  
  char* out = (char*) malloc(outLen);
  strcpy(out, first);
  strcat(out, second);

  return out;
}

void webServerLoop(void) {
  WiFiClient client;
  String request;
  char* response = NULL;
  
  client = server.available();
  if (client) {
    /* check client is connected */
    while (client.connected()) {
      /* check if the client is requesting something */
      if (client.available()) {
        /* Time the operation */
        jeffTimer = millis();
        
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
          Serial.println("Sending website");
          response = cArrCat(STATUS200HTML, INDEX_HTML);
        } else if (request == "/js/myscript.js") {
          Serial.println("Sending javascript");
          response = cArrCat(STATUS200HTML, MYSCRIPTS_JS);
        } else if (request = "/functions/getData()") {
          Serial.println("Running getData() Function");
          // TODO: Acutally put the function here lol
          String test = "test Response";
          response = cArrCat(STATUS200PLAIN, test.c_str());
          Serial.println(response);
        } else if (request == "/functions/startRecord()") {

          
        } else if (request == "/functions/stopRecord()") {

          
        } else {
          Serial.println("Unknown Request - Sending 404");
          response = STATUS404;
        }
        /* send response back to client and then close connect since HTTP do not keep connection*/
        client.write(response);
        client.stop();

        if(response != NULL) {
          free(response);
        }

        Serial.print("Operation took ");
        Serial.print(millis() - jeffTimer);
        Serial.println(" ms");
      }
    }
  }
}

