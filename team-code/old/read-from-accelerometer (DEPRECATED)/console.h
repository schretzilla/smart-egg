#ifndef CONSOLE_H
#define CONSOLE_H

#if defined(ARDUINO) && ARDUINO >= 100
  #include "Arduino.h"
#else
  #include "WProgram.h"
#endif

class console {
  public:
    void serialRun();
    void help();
    void help(String command);
}
#endif /* CONSOLE_H */
