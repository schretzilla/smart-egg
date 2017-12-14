
#include <driver/adc.h>
#include <stdlib.h>
#include "Terminal.h"
#include "Webserver.h"
#include "DataRecorder.h"

DataRecorder* dataRec;
Webserver* webServ;
Terminal* term;

void webServerTask(void *pvParameters);
void termTask(void *pvParameters);

void setup() {
  // Initialize serial communication at 115200 baud
  Serial.begin(115200);
  Serial.println("\nSerial Communications Begin...");
  Serial.print("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
  /* Setup ADC */
  adc1_config_width(ADC_WIDTH_12Bit);
  adc1_config_channel_atten(ADC1_CHANNEL_0,ADC_ATTEN_11db);
  adc1_config_channel_atten(ADC1_CHANNEL_1,ADC_ATTEN_11db);
  adc1_config_channel_atten(ADC1_CHANNEL_2,ADC_ATTEN_11db);

  /* Setup the DataRecorder - NOTE EEPROM SETUP MOVED TO CLASS INIT */
  dataRec = new DataRecorder();

  /* Pin webserver to CPU0 */
  webServ = new Webserver(dataRec);
  xTaskCreatePinnedToCore(webServerTask, "webServer", 2048, NULL, 5, NULL, 0);
  delay(10); /* Wait for the webserver to boot */
  
  /* Finalize Setup */
  Serial.println("\nBootup Complete. Initializing Terminal...");

  /* Pin terminalEmulator to CPU0 */
  xTaskCreatePinnedToCore(termTask, "terminalEmulator", 2048, NULL, 10, NULL, 0);
}

/* webServerTask */
void webServerTask(void *pvParameters) {
  /* Loop Task */
  for(;;) {
    webServ->run();
    vTaskDelay(25);
  }
}

/* Terminal Task */
void termTask(void *pvParameter) {
  /* Setup the terminal */
  term = new Terminal(dataRec);
  
  /* Loop Task */
  for(;;) {
    term->run();
    vTaskDelay(25);
  }
}

/* Application CPU (CPU1) */
void loop() {
  dataRec->run();
  // Add recording listener here 
}
