#ifndef TERMINAL_H
#define TERMINAL_H

#if defined(ARDUINO) && ARDUINO >= 100
  #include "Arduino.h"
#else
  #include "WProgram.h"
#endif

#include "DataRecorder.h"

/* Make our console look nice */
#define HOSTNAME "\nadmin@SmartEgg:/ # "

class Terminal {
  public:
    Terminal(DataRecorder* dataRecPointer);
    void run();
    
  private:
    DataRecorder* dataRec;
    String availCommands[5] = {"help", "record", "dumpData", "getSingleDataSet", "free"};  /* Commands for use with the serial console */
    int getCommandIndex(String command);
    int filterInt(String param);
    void help();
    void help(String command);
};
#endif /* TERMINAL_H */
