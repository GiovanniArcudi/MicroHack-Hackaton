
/*
#include <Keypad.h>
int* pass;
int len;

char vals[4][4] = {
  {'1', '2', '3', 'F'},
  {'4', '5', '6', 'E'},
  {'7', '8', '9', 'D'},
  {'A', '0', 'B', 'C'}
};
 
byte rowPins[4] = {5, 4, 3, 2};
byte colPins[4] = {9, 8, 7, 6};
 
Keypad keypad = Keypad(makeKeymap(vals), rowPins, colPins, 4, 4);
 
int redPin = 13;
int greenPin = 11;
int yellowPin = 12;
bool nopassword = true;
int i = 0;
char key;
bool ok = true;



void password();

void flashRedLight() {
  for(int i = 0; i < 2; i++) {
    digitalWrite(redPin, HIGH);
    delay(500);
    digitalWrite(redPin, LOW);
    delay(500);
  }
}
 
void flashGreenLight() {
  for(int i = 0; i < 2; i++) {
    digitalWrite(greenPin, HIGH);
    delay(500);
    digitalWrite(greenPin, LOW);
    delay(500);
  }
}

void flashYellowLight() {
  for(int i = 0; i < 2; i++) {
    digitalWrite(yellowPin, HIGH);
    delay(500);
    digitalWrite(yellowPin, LOW);
    delay(500);
  }
}
 
void password(){
      Serial.write(key);
      for(i=0; i<len; i++)
      {
        pass[i] = keypad. waitForKey();
        Serial.write(pass[i]);
      }
    
    flashGreenLight();
     nopassword = false;
}

int getLength() {
  char key = keypad.waitForKey();
  Serial.write("key : " + key);
  if (key >='A' && key <= 'Z')
    return   key - 'A' + 10;
  if(key >= '0' && key <= '9')
    return key - '0';  
  return 4;
}


void setup() {
  Serial.begin(9600);
  pinMode(redPin, OUTPUT);
  pinMode(greenPin, OUTPUT);
  pinMode(yellowPin, OUTPUT);
  digitalWrite(greenPin, HIGH);
}

void resetPsswd() {
  int i = 0;
  digitalWrite(yellowPin, HIGH);
  if(keypad.waitForKey() != 'C')
    digitalWrite(yellowPin, LOW);
    /*delay(100);
    digitalWrite(redPin, LOW);
  while(i<2){
    if(keypad.waitForKey() == 'C')
        i++;
  }
  if(i == 2) {
    flashYellowLight();
    flashGreenLight();
    digitalWrite(greenPin, HIGH);
    len = getLength();
    pass = (int*) realloc(pass, len * sizeof(int));
    password();
  }
}
void loop() {
  if(nopassword) {
    len = getLength();
    pass = (int*) malloc(len * sizeof(int));
    password();
  }
  
  int i;
  Serial.println();
  ok = true;
  for(i = 0; i < len; i++) {
    if(pass[i] != keypad.waitForKey()) {
      ok = false;
   }
  }
  //win
  if(ok) {
    flashGreenLight(); 
  }
  else {
    flashRedLight();
  } 
  resetPsswd();
}

*/


#include <Keypad.h>
int* pass;
int len;

char vals[4][4] = {
  {'1', '2', '3', 'F'},
  {'4', '5', '6', 'E'},
  {'7', '8', '9', 'D'},
  {'A', '0', 'B', 'C'}
};
 
byte rowPins[4] = {5, 4, 3, 2};
byte colPins[4] = {9, 8, 7, 6};
 
Keypad keypad = Keypad(makeKeymap(vals), rowPins, colPins, 4, 4);
 
int redPin = 13;
int greenPin = 11;
int yellowPin = 12;
bool nopassword = true;
int i = 0;
char key;
bool ok = true;



void password();

void flashRedLight() {
  for(int i = 0; i < 2; i++) {
    digitalWrite(redPin, HIGH);
    delay(500);
    digitalWrite(redPin, LOW);
    delay(500);
  }
}
 
void flashGreenLight() {
  for(int i = 0; i < 2; i++) {
    digitalWrite(greenPin, HIGH);
    delay(500);
    digitalWrite(greenPin, LOW);
    delay(500);
  }
}

void flashYellowLight() {
  for(int i = 0; i < 2; i++) {
    digitalWrite(yellowPin, HIGH);
    delay(500);
    digitalWrite(yellowPin, LOW);
    delay(500);
  }
}
 
void password(){
      Serial.write(key);
      for(i=0; i<len; i++)
      {
        pass[i] = keypad. waitForKey();
        Serial.write(pass[i]);
      }
    
    flashGreenLight();
     nopassword = false;
}

int getLength() {
  char key = keypad.waitForKey();
  Serial.write("key : " + key);
  if (key >='A' && key <= 'Z')
    return   key - 'A' + 10;
    if(key >= '0' && key <= '9')
    return key - '0';  
  return 4;
}

bool check(int len){
   int i;
  for(int i = 0; i < len; i++) {
    if(pass[i] != keypad.waitForKey()) {
      return false;
  }
  return true;
}
}

void setup() {
  Serial.begin(9600);
  pinMode(redPin, OUTPUT);
  pinMode(greenPin, OUTPUT);
  pinMode(yellowPin, OUTPUT);
  digitalWrite(greenPin, HIGH);
}

void resetPsswd() {
  int i = 0;
  digitalWrite(yellowPin, HIGH);
  if(keypad.waitForKey() != 'C')
    {digitalWrite(yellowPin, LOW);
    i=3;
    }
    /*delay(100);
    digitalWrite(redPin, LOW);*/
  while(i<2){
    if(keypad.waitForKey() == 'C')
        i++;
  }
  if(i == 2) {
    flashYellowLight();
    flashGreenLight();
    digitalWrite(greenPin, HIGH);
    len = getLength();
    pass = (int*) realloc(pass, len * sizeof(int));
    password();
  }
  else{
    digitalWrite(yellowPin, HIGH);
    delay(300);
    digitalWrite(yellowPin, LOW);
    check(len);
    
  }
}

void loop() {
  if(nopassword) {
    len = getLength();
    pass = (int*) malloc(len * sizeof(int));
    password();
  }
  
  int i;
  Serial.println();
  ok = true;
  for(i = 0; i < len; i++) {
    if(pass[i] != keypad.waitForKey()) {
      ok = false;
   }
  }
  //win
  if(ok) {
    flashGreenLight(); 
  }
  else {
    flashRedLight();
  } 
  resetPsswd();
}
 
