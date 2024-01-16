#include <SPI.h>
#include <MFRC522.h>
#include <LiquidCrystal_I2C.h>
#include <Arduino.h>
#include <ESP8266WiFi.h>
#include <ESP8266WiFiMulti.h>
#include <WiFiClientSecureBearSSL.h>
#include <ESP8266HTTPClient.h>
#include <ArduinoJson.h>

#include "cert.h"

LiquidCrystal_I2C lcd(0x27, 16, 2);  // set the LCD address to 0x27 for a 16 chars and 2 line display

#define SS_PIN D8
#define RST_PIN D3
#define BEEPER_PIN D0

#define WIFI_SSID "SEA"
#define WIFI_PASS "sara9914"
#define RECURL "tracking.aarontech.xyz/api/rfid"
#define KEY "5fbda4564acb0d49f260707a"

MFRC522 rfid(SS_PIN, RST_PIN);  // Instance of the class

bool processingReq = false;
ESP8266WiFiMulti wifi;

X509List cert (cert_ISRG_Root_X1);

int cursorPos = 0;

void setup() {
  Serial.begin(9600);

  lcd.init();
  lcd.backlight();
  lcdOut(0, "Savage Tumaz");

  lcdOut("init SPI...");
  SPI.begin();  // Init SPI bus

  lcdOut("init MFRC522...");
  rfid.PCD_SetAntennaGain(255);
  rfid.PCD_Init();  // Init MFRC522
  lcd.setCursor(14, 1);
  lcd.print("ok");

  pinMode(BEEPER_PIN, OUTPUT);

  connectWifi();

  delay(1500);

  lcdOut("Please Scan");
}

void loop() {
  if (processingReq || !rfid.PICC_IsNewCardPresent() || !rfid.PICC_ReadCardSerial()) {
    return;
  }

  char uid[8];
  sprintf(uid, "%02X%02X%02X%02X", rfid.uid.uidByte[0], rfid.uid.uidByte[1], rfid.uid.uidByte[2], rfid.uid.uidByte[3]);
  Serial.println(uid);

  rfid.PICC_HaltA();
  rfid.PCD_StopCrypto1();

  digitalWrite(BEEPER_PIN, HIGH);
  delay(50);
  digitalWrite(BEEPER_PIN, LOW);

  lcdOut(0, uid);
  lcdOut("Loading...");

  DynamicJsonDocument body(200);
  body["uid"] = uid;
  body["key"] = KEY;
  char bodych[1024];
  serializeJson(body, bodych);
  Serial.println(bodych);

  WiFiClientSecure wifiClient;
  wifiClient.setTrustAnchors(&cert);

  HTTPClient httpClient;
  httpClient.useHTTP10(true);
  httpClient.begin(wifiClient, RECURL, 443);
  httpClient.addHeader("Content-Type", "application/json");
  Serial.print("RECURL: ");
  Serial.println(RECURL);
 
  int httpCode = httpClient.POST(bodych);
  Serial.print("Send POST request to RECURL: ");
  Serial.println(RECURL);
  
  if (httpCode == HTTP_CODE_OK) {
    DynamicJsonDocument doc(500);
    deserializeJson(doc, httpClient.getStream());
    httpClient.end();

    String tmpstr;
    serializeJson(doc, tmpstr);
    Serial.println(tmpstr);

    lcdOut(0, strdup(doc["status"]));
    lcd.print(":");
    lcd.print(strdup(doc["name"]));
    successTone();
  
    lcdOut("Please Scan");
  } else {
    Serial.println("Server Respose Code:");
    Serial.println(httpCode);
    lcdOut(0, "ERROR ");
    lcd.print(httpCode);
    if (httpCode > 0) {
      DynamicJsonDocument doc(500);
      deserializeJson(doc, httpClient.getStream());
      lcdOut(strdup(doc["status"]));
    } else lcdOut(httpClient.errorToString(httpCode).c_str());
    errTone();
    delay(2000);
    lcdOut("Please Scan");
  }
}

void lcdOut(const char* s) {
  lcdOut(strdup(s));
}

void lcdOut(char* s) {
  lcdOut(1, s);
}

void lcdOut(int line, char* s) {
  lcd.setCursor(0, line);
  lcd.print("                ");
  lcd.setCursor(0, line);
  lcd.print(s);
}

void errTone() {
  twoTone(300);
}

void successTone() {
  twoTone(50);
}

void twoTone(int duration) {
  digitalWrite(BEEPER_PIN, HIGH);
  delay(duration);
  digitalWrite(BEEPER_PIN, LOW);
  delay(duration);
  digitalWrite(BEEPER_PIN, HIGH);
  delay(duration);
  digitalWrite(BEEPER_PIN, LOW);
}

void connectWifi() {
  WiFi.disconnect();
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  Serial.printf("\nDevice is connecting to WiFi using SSID %s and Passphrase %s.\n", WIFI_SSID, WIFI_PASS);
  lcdOut("WiFi Setup");
  int cnt = 0;
  // Keep looping until the WiFi is not connected.
  while (WiFi.status() != WL_CONNECTED) {
    if (cnt++ % 5 == 0) {
      lcd.setCursor(10, 1);
      lcd.print("      ");
      lcd.setCursor(10, 1);
    }
    lcd.print(".");
    delay(500);
  }
  configTime(8 * 3600, 0, "pool.ntp.org", "time.nist.gov");

  Serial.print("Waiting for NTP time sync: ");
  time_t now = time(nullptr);
  while (now < 8 * 3600 * 2) {
    delay(500);
    Serial.print(".");
    now = time(nullptr);
  }

  Serial.println("");
  struct tm timeinfo;
  gmtime_r(&now, &timeinfo);
  Serial.print("Current time: ");
  Serial.print(asctime(&timeinfo));

  lcdOut("WiFi OK!");
}