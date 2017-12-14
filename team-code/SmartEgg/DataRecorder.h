
#ifndef DATARECORDER_H
#define DATARECORDER_H

#if defined(ARDUINO) && ARDUINO >= 100
  #include "Arduino.h"
#else
  #include "WProgram.h"
#endif

#include <math.h>
#include <driver/adc.h>
#include "EEPROM.h"

/* Max EEPROM_SIZE is 65535 */
//#define EEPROM_SIZE 131070
#define RECORD_TIME 60      /* record time */
#define NUM_SAMPLES 1       /* how many samples to take when recording one value, usually 1 is enough */
#define REC_HZ 500          /* Samples per second */

const int g_GsXoffset = 1919;
const int g_GsYoffset = 1919;
const int g_GsZoffset = 1928;

class DataRecorder {
  public:

    uint16_t m_totalReordedPoints;//total number of data points recorded (x,y,z)
    DataRecorder();
    void record();
    void stopRecord();
    void record(int flag);
    bool isRecording();
    bool requested();
    int getNumSamples();
    String getSingleDataSet(int dataSetIndex);
    uint16_t printAllValues();
    float calculateGforce( int16_t value, int16_t value_0gs);
    String getInstant();
    String getGforces( int16_t xValue, int16_t yValue, int16_t zValue);
    void run();
    
  private:
    long EEPROM_SIZE;
    unsigned long m_addressIterator;   /* For use with the save function and all EEPROM access and deliveries */
    int m_recRequest;            /* Lets the loop know we want to record */
    bool m_recFlag;               /* Currently recording? */
    bool m_recNumSamplesMutex;
    unsigned long m_recTimerInit;          /* How often we record */
    unsigned long m_recNumSamples;           /* What sample are we on, to ensure accuracy of the timer - has to be long*/
    unsigned long m_sampleRateMicros;     /* samples Per Micros - Has to be long, otherwise math will overflow*/
    long m_recTimerDelta;
    unsigned long m_debugOutTimer;
    
    void setSampleRate(int samplesPerSecond);
    float scaleGxys(int counts);
    float scaleGzs(int counts);
    uint16_t returnPackedValue(uint16_t address);
    bool saveData(uint16_t unsignedValue_16bit, bool reset);
    bool recordHelper();
};
#endif /* DATARECORDER_H */
