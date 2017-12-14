/*
 * This function handles the serial protocol, allowing for a rich
 * user interface when handling the egg through IO
 */
 
void serialRun() {
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

    Serial.print("command: ");
    Serial.println(command);
    Serial.print("parameters: ");
    for(int i = 0; i < numParam; i ++) {
      Serial.print(parameters[i]);
      if(i < numParam -1) {
        Serial.print(", ");
    }
    Serial.println();
    
    int selectedCommand = -1;
    for(int i = 0; i < sizeof(availCommands)/sizeof(String); i ++) {
      if(command == availCommands[i]) {
        selectedCommand = i;
        break;
      }
    }

    switch(selectedCommand) {
      case 0:
        /* Print the help */
        if(numParam > 0) {
          help(parameters[0]);
        } else {
          help();
        }
      case 1:
        record();
        break;
      case 2:
        printAllValues();
        break;
      case 3:
        break;
      default:
        Serial.print("Command not found. ");
        help();
    }
    Serial.print(HOSTNAME);
  }
}

void help() {
  Serial.print("List of availiable Commands:");
  for(int i = 0; i < sizeof(availCommands)/sizeof(String); i ++) {
    Serial.print("\t- ");
    Serial.println(availCommands[i]);
  }
}

void help(String command) {
  if(command) {
    
  } else {
    help();
  }
}

