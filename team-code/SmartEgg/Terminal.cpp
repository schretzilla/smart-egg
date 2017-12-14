#include "Terminal.h"

Terminal::Terminal(DataRecorder* dataRecPointer) {
  dataRec = dataRecPointer;
  help();
  Serial.print(HOSTNAME);
}


/*
* This function handles the serial protocol, allowing for a rich
* user interface when handling the egg through IO
*/
void Terminal::run() {
  if(Serial.available()) {
    /* Recieve the serial input, and trim it of whitespace */
    String command = Serial.readString();
    command.trim();
    Serial.println(command);

    /* Get the number of parameters, if any */
    int numParam = 0;
    for(int i = 0; i < command.length(); i++) {
      /* Ignore Whitespace */
      if(command.charAt(i) == ' ' && command.charAt(i+1) != ' ') {
        numParam ++;
      }
    }

    /* Build an array of paramters for commands to use */
    String parameters[numParam];
    int paramIterator = 0;
    for(int i = 0; i < command.length(); i ++) {
      if(command.charAt(i) == ' ' && command.charAt(i+1) != ' ') {
        parameters[paramIterator++] = command.substring(i+1, command.indexOf(' ', i+1));
      }
    }

    /* Trim the command of any paramters */
    if(numParam > 0) {
      command = command.substring(0,command.indexOf(' '));
    }

    
    /* Debug
    Serial.print("command: ");
    Serial.println(command);
    Serial.print("parameters: ");
    for(int i = 0; i < numParam; i ++) {
      Serial.print(parameters[i]);
      if(i < numParam -1) {
        Serial.print(", ");
      }
    }
    Serial.println();
    */
    
    switch(getCommandIndex(command)) {
      case 0:
        /* Print the help */
        if(numParam > 0) {
          help(parameters[0]);
        } else {
          Serial.println("For help on a specific command, use # help {commandName}");
          help();
        }
        break;
      case 1:
        if(numParam > 0) {
          if(parameters[0] == "stop") {
            dataRec->stopRecord();
          } else if (parameters[0] == "start") {
            dataRec->record();
          }
        } else {
          dataRec->record();
        }
        break;
      case 2:
        dataRec->printAllValues();
        break;
      case 3:
        if(numParam < 1 || filterInt(parameters[0]) == NULL) {
          help(command);
        } else {
          dataRec->getSingleDataSet(filterInt(parameters[0]));
        }
        break;
      case 4:
        Serial.print("Ram Left: ");
        if(numParam > 0 && parameters[0] == "-h") {
          Serial.print(esp_get_free_heap_size()/1000);
          Serial.println(" Kilobytes");
        } else {
          Serial.print(esp_get_free_heap_size());
          Serial.println(" bytes");
        }
        break;
      default:
        Serial.print("Command not found. ");
        help();
    }
    Serial.print(HOSTNAME);
  }
}

int Terminal::filterInt(String param) {
  for(int i = 0; i < param.length(); i++) {
    if(param.charAt(i) > 57 || param.charAt(i) < 48) {
      if(i < param.length() - 1) {
        param = param.substring(0,i) + param.substring(i+1);
      } else {
        param = param.substring(0,i);
      }
    }
  }
  if(param.length() == 0) {
    return NULL;
  }
  
  return param.toInt();
}

int Terminal::getCommandIndex(String command) {
  int commandIndex = -1;
  for(int i = 0; i < sizeof(availCommands)/sizeof(String); i ++) {
    if(command == availCommands[i]) {
      commandIndex = i;
      break;
    }
  }
  return commandIndex;  
}

/* If you actually want to document stuff lol */
void Terminal::help(String command) {
  if(getCommandIndex(command) != -1) {
    Serial.print("Help page for \"");
    Serial.print(command);
    Serial.println("\"");
    switch(getCommandIndex(command)) {
      case 1:
        Serial.println("Usage: record {start/stop}");
        Serial.println("Runs the start and stop recording routines");
        break;
      case 3:
        Serial.println("Usage: getCommandIndex {dataSetIndex}");
        Serial.println("Returns the x, y, z, time for the selected index");
        break;
    }
  } else {
    Serial.print("Can't find help page for \"");
    Serial.print(command);
    Serial.println("\"");
    help();
  }
}

void Terminal::help() {
  Serial.println("List of availiable Commands:");
  for(int i = 0; i < sizeof(availCommands)/sizeof(String); i ++) {
    Serial.print("\t- ");
    Serial.println(availCommands[i]);
  }
}



