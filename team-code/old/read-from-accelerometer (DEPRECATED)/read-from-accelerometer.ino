
#include <driver/adc.h>
#include <stdlib.h>
#include "EEPROM.h"
#include "console.h"

/* Max EEPROM_SIZE is 4096 */
#define EEPROM_SIZE 3072

/* Make our console look nice */
#define HOSTNAME "admin@SmartEgg:/ # "
 
/* For use with the save function and all EEPROM access and deliveries */
static uint16_t addressIterator;

/* Commands for use with the serial console */
String availCommands[] = {"help", "record", "dumpData", "getSingleDataSet"};

void setup() {
  // Initialize serial communication at 115200 baud
  Serial.begin(115200);

  /* Setup ADC */
  adc1_config_width(ADC_WIDTH_12Bit);
  adc1_config_channel_atten(ADC1_CHANNEL_0,ADC_ATTEN_11db);
  adc1_config_channel_atten(ADC1_CHANNEL_1,ADC_ATTEN_11db);
  adc1_config_channel_atten(ADC1_CHANNEL_2,ADC_ATTEN_11db);

  /* Setup the EEPROM */
  addressIterator = 0;
  if (!EEPROM.begin(EEPROM_SIZE))
  {
    Serial.println("Failed to init EEPROM");
    while(1);
  }
  Serial.print(EEPROM_SIZE);
  Serial.println(" bytes read from Flash.");
  //printAllValues();

  /* Finalize Setup */
  Serial.println("Bootup Complete. List of available commands:");
  for(int i = 0; i < sizeof(availCommands)/sizeof(String); i ++) {
    Serial.print("\t- ");
    Serial.println(availCommands[i]);
  }
  Serial.print(HOSTNAME);
}

void loop() {
  serialRun();
}

/* 
 *  Records data and saves to EEPROM.
 *  This operation is blocking and will prevent any loop
 *  functions form running normally
 */
void record() {
  int numTimesLoopRan = 0;
  bool eepromEOF = false;
  uint32_t timeInit;
  uint32_t timeLast;
  uint32_t timeDelta;

  /* Reset iterator to overwrite previous values */
  addressIterator = 0;
  
  timeInit = micros()/10;
  timeLast = timeInit;
  timeDelta = 0;

  /* Write until EEPROM is full */
  while(!eepromEOF) {
    numTimesLoopRan ++;
    
    // Get raw accelerometer data for each axis
    int rawX = 0;
    int rawY = 0;
    int rawZ = 0;

    /* Number of times we sample the ADC */
    int samples = 4;
    for(int x = 0; x < samples; x++)
    {
  
        rawX += adc1_get_raw(ADC1_CHANNEL_0);
        rawY += adc1_get_raw(ADC1_CHANNEL_1);
        rawZ += adc1_get_raw(ADC1_CHANNEL_2);
  
    }

    /* Get the average of the samples */
    rawX /= samples;
    rawY /= samples;
    rawZ /= samples;

    /* Record the delta Time */
    uint32_t timeInstant = micros()/10;
    timeDelta = timeInstant - timeLast;
    timeLast = timeInstant;

    /* Save the data */
    saveData(rawX , false);
    saveData(rawY , false);
    saveData(rawZ , false);
    eepromEOF = saveData( (uint16_t) timeDelta, false);
  }

  Serial.print("Operation took ");
  Serial.print((micros()/10 - timeInit)*10^2);
  Serial.println("ms (Probably not accurate, yell at programmers)");
  Serial.print("NumLoopIterations: ");
  Serial.println(numTimesLoopRan);
  Serial.println("[INFO] Finished filling EEPROM buffer");
  //printAllValues();
}

/* Scale the x/y data to G-force */
float scaleGxys(int counts) {
   return((counts - 1919)/8.0);

}

/* Scale the z data to G-force. Scale for Z is different than x/y */
float scaleGzs(int counts) {
   return((counts - 1928)/8.0);

}

uint16_t returnPackedValue(uint16_t address) {
     uint16_t temp1 = (uint16_t) EEPROM.read(address);
     uint16_t temp2 = (uint16_t) EEPROM.read(address+1) * (1 << 8);
    // Serial.print(temp2);Serial.println(temp1);
     return((uint16_t) temp2 + temp1);
}

char* getSingleDataSet(int dataSetIndex) {
  /* Multiply by 4, since the starting address of each set is every 4th byte */
  dataSetIndex *= 4;

  /* Print the data out */
  for(int i = 0; i < 4; i ++) {
    Serial.print(returnPackedValue(dataSetIndex));
    if(i < 3) {
      Serial.print(",");
    } else {
      Serial.println();
    }
  }
}

uint16_t printAllValues(void) {
      uint16_t address = 0;
      
      Serial.println("DataDump");
      Serial.println("X,Y,Z,time");
      
      for(uint16_t address = 0, loopIteration = 1; address < (EEPROM_SIZE-1); address += 2, loopIteration++ )
      {
              if(loopIteration%4)
              {
                Serial.print(returnPackedValue(address));Serial.print(",");
              }else{
                Serial.println(returnPackedValue(address));
              }
               
      }
      Serial.println("");
      Serial.println("[INFO] End data dump");
}


bool saveData(uint16_t unsignedValue_16bit, bool reset) {
  /* This shit is debug, probably */
  if(reset == true)
  {
   addressIterator = 0;
  }
  
  /* If we reach the end of address, return false */
  if(addressIterator >= (EEPROM_SIZE - 1))
  {
    return(true);
  }

  /* EEPROM Magic */
  byte LSB_byte = unsignedValue_16bit & 0x00FF;
  byte MSB_byte = (unsignedValue_16bit >> 8);
  
  
  EEPROM.write(addressIterator, LSB_byte);
  addressIterator++;
  EEPROM.write(addressIterator, MSB_byte);
  addressIterator++;
  
  if(addressIterator >= (EEPROM_SIZE - 1))
  {
     EEPROM.commit();
  }
  
  return(false);
}

