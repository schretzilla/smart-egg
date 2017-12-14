#ifndef WEBSERVER_H
#define WEBSERVER_H

#if defined(ARDUINO) && ARDUINO >= 100
  #include "Arduino.h"
#else
  #include "WProgram.h"
#endif

#include "Website.h"
#include "WiFi.h"
#include "WiFiClient.h"
#include "ESPmDNS.h"
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "DataRecorder.h"

#define WIFI_SSID "SmartEgg"

class Webserver {
  public:
    Webserver(DataRecorder* dataRecPointer);
    void run();
    
  private:
    DataRecorder* dataRec;
    WiFiServer* server;
    char* cArrCat(const char* first, const char* second);
    long jeffTimer;
};
#endif /* WEBSERVER_H */
