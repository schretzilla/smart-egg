#include "DataRecorder.h"

DataRecorder::DataRecorder() {
  /* Setup local variables */
  m_totalReordedPoints = 0;
  m_addressIterator = 0;
  m_recRequest = false;
  m_recFlag = 0;
  m_recNumSamplesMutex = false;
  m_recNumSamples = 1;

  /* Setup the sample rate */
  setSampleRate(500);

  EEPROM_SIZE = 6 * RECORD_TIME / (m_sampleRateMicros * pow(10,-6));
  
  /* Setup the EEPROM */
  if (!EEPROM.begin(EEPROM_SIZE))
  {
    Serial.print("Failed to reserve ");
    Serial.print(EEPROM_SIZE);
    Serial.println(" bytes of flash memory.");
    while(1);
  }
  Serial.print("Reserved ");
  Serial.print(EEPROM_SIZE);
  Serial.print(" bytes of flash memory. (");
  Serial.print(EEPROM_SIZE/1000);
  Serial.println(" KB)");
  //printAllValues();
}

/* Wait for something to get triggered */
void DataRecorder::run() {
  if(m_recFlag || m_recRequest != 0) {
    if(m_recRequest == 1) {
      if(m_recFlag) {
        /* If someone pressed the fricken record button while we're already recording */
        Serial.println("\nRecording in progress. Record request ignored");
        m_recRequest = 0;
        return;
      }

      Serial.println("\nRecord request Acknowledged");
      /* Setup recording */
      m_recTimerInit = micros();
      m_debugOutTimer = millis();
      m_recNumSamples = 1;     /* Samples start at 1 */
      m_addressIterator = 0;  /* Overwrite previous addresses */
      m_recFlag = true;       /* So we actually loop correctly */

      /* Delete the request, since it's no longer needed */
      m_recRequest = 0;
    }

    if(m_recRequest == -1) {
      /* Stop recording */
      m_recFlag = false;
      m_recRequest = 0;
      EEPROM.commit();

      Serial.print("Finished recording ");
      Serial.print(m_recNumSamples);
      Serial.println(" samples");
      return;
    }

    /* 
     *  Recording loop (recFlag == true)
     */

     /* Lol don't fall victim to math errors, micros() returns an UNSIGNED long */
    m_recTimerDelta = (micros() - m_recTimerInit) - (m_sampleRateMicros * m_recNumSamples);
    
    if(m_recTimerDelta > 0) {
      while(m_recNumSamplesMutex) {
        /* wait for unlock */
      }
      m_recNumSamplesMutex = true; /* Lock the mutex */
      
      if(m_recTimerDelta > m_sampleRateMicros) {
        /* Uh oh, looks like our code is too slow to sample this fast. Better yell at your programmers */
        Serial.print("[WARNING] Missed Sample ");
        Serial.print(m_recNumSamples);
        Serial.println("!");
        Serial.println(m_recTimerDelta);
        Serial.println(micros() - m_recTimerInit);
      }
      /* Record using Garrett's function */
      if(recordHelper()) {
        /* Done recording */
        m_recFlag = false;
        Serial.print("Finished recording ");
        Serial.print(m_recNumSamples);
        Serial.println(" samples");
      }

      /* Increase the current sample Iterator */
      m_recNumSamples++;
      m_recNumSamplesMutex = false; /* Lock the mutex */
    }

    if(millis() - m_debugOutTimer > 2000) {
      float timeRemaining = (EEPROM_SIZE / (3 * 2) - m_recNumSamples) * m_sampleRateMicros * pow(10,-6);
      
      Serial.print("Logged ");
      Serial.print(m_recNumSamples);
      Serial.print(" samples (");
      Serial.print(timeRemaining);
      Serial.println(" seconds left)");

      m_debugOutTimer = millis();
    }
  }
}

/* Pre-calculates the microseconds so we don't do it on the fly */
void DataRecorder::setSampleRate(int samplesPerSecond) {
  m_sampleRateMicros = (long) (((float) 1/(float) samplesPerSecond) * pow(10,6));
  
  Serial.print("Setting sample rate to ");
  Serial.print(m_sampleRateMicros);
  Serial.print(" microseconds (");
  Serial.print(samplesPerSecond);
  Serial.println("Hz)");
}

/* Sets the record flag, and lets the dataRecording loop handle the rest */
void DataRecorder::record() {
  record(1);
}

void DataRecorder::stopRecord() {
  record(-1);
   m_totalReordedPoints = m_addressIterator;
}

/* Set the recording request flag */
void DataRecorder::record(int flag) {
  m_recRequest = flag;
}



/* Lets us know if we're recording */
bool DataRecorder::isRecording() {
  if(m_recFlag == true) {
    return true;
  }

  return false;
}

/* Return the sample numbers */
int DataRecorder::getNumSamples() {
  int numSamples;
  
  while(m_recNumSamplesMutex) {
    /* Wait until the sample num gets unlocked */
  }
  
  m_recNumSamplesMutex = true;
  numSamples = m_recNumSamples;
  m_recNumSamplesMutex = false;

  return numSamples;  
}

String DataRecorder::getGforces( int16_t xValue, int16_t yValue, int16_t zValue)
{
   String gForceStr = "";

      gForceStr += calculateGforce( xValue, g_GsXoffset);
      gForceStr += ",";
      gForceStr += calculateGforce( yValue, g_GsYoffset);
      gForceStr += ",";
      gForceStr += calculateGforce( zValue, g_GsZoffset);
      gForceStr += "/n";
     
   return(gForceStr);
  
}

float DataRecorder::calculateGforce( int16_t value, int16_t value_0gs)
{
    return(map( (float) value, 0, 2*value_0gs, -200, 200));
}

String DataRecorder::getInstant() {
  String ret = "";
  float data[6];

  data[0] = adc1_get_raw(ADC1_CHANNEL_0);
  data[1] = adc1_get_raw(ADC1_CHANNEL_1);
  data[2] = adc1_get_raw(ADC1_CHANNEL_2);
  data[3] = calculateGforce( data[0], g_GsXoffset);
  data[4] = calculateGforce( data[1], g_GsYoffset);
  data[5] = calculateGforce( data[2], g_GsZoffset);
}

/* Records a single value */
bool DataRecorder::recordHelper() {
  /* Get raw accelerometer data for each axis */
  int rawX = 0;
  int rawY = 0;
  int rawZ = 0;

  /* Number of times we sample the ADC */
  for(int i = 0; i < NUM_SAMPLES; i++)
  {
      rawX += adc1_get_raw(ADC1_CHANNEL_0);
      rawY += adc1_get_raw(ADC1_CHANNEL_1);
      rawZ += adc1_get_raw(ADC1_CHANNEL_2);
  }

#if NUM_SAMPLES > 1
  /* Get the average of the samples */
  rawX /= NUM_SAMPLES;
  rawY /= NUM_SAMPLES;
  rawZ /= NUM_SAMPLES;
#endif

  /* Save the data */
  saveData(rawX , false);
  saveData(rawY , false);
  return saveData(rawZ , false);
}

bool DataRecorder::requested() {
  return m_recRequest;
}

uint16_t DataRecorder::returnPackedValue(uint16_t address) {
     uint16_t temp1 = (uint16_t) EEPROM.read(address);
     uint16_t temp2 = (uint16_t) EEPROM.read(address+1) * (1 << 8);
    // Serial.print(temp2);Serial.println(temp1);
     return((uint16_t) temp2 + temp1);
}

String DataRecorder::getSingleDataSet(int dataSetIndex) {
  /* Multiply by 4, since the starting address of each set is every 4th byte */
  dataSetIndex *= 6;
  
  String dataSetStr = "";
  /* Print the data out */
  for(int i = 0; i < 3; i ++) {
    dataSetStr += returnPackedValue(dataSetIndex+i*2);
    if(i < 2) {
      dataSetStr += ",";
    } else {
      dataSetStr += "\n";
    }
  }
  return(dataSetStr);
}

uint16_t DataRecorder::printAllValues(void) {
  uint16_t address = 0;
  
  Serial.println("DataDump");
  Serial.println("X,Y,Z,time");
  
  for(uint16_t address = 0, loopIteration = 1; address < (EEPROM_SIZE-1); address += 2, loopIteration++ ) {
    Serial.print(returnPackedValue(address));
      if(loopIteration%3) {
        Serial.print(",");
      }
  }
  Serial.println("");
  Serial.println("[INFO] End data dump");
}


bool DataRecorder::saveData(uint16_t unsignedValue_16bit, bool reset) {
  /* This is debug, probably. Resets the address to zero*/
  if(reset) {
   m_addressIterator = 0;
  }
  
  /* If we reach the end of address, return false */
  if(m_addressIterator >= (EEPROM_SIZE - 1)) {
    return true;
  }

  /* EEPROM Magic */
  byte LSB_byte = unsignedValue_16bit & 0x00FF;
  byte MSB_byte = (unsignedValue_16bit >> 8);
  
  
  EEPROM.write(m_addressIterator, LSB_byte);
  m_addressIterator++;
  EEPROM.write(m_addressIterator, MSB_byte);
  m_addressIterator++;
  
  if(m_addressIterator >= (EEPROM_SIZE - 1)) {
     EEPROM.commit();
     return true;
  }
  
  return false;
}

