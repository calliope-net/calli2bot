input.onButtonEvent(Button.AB, ButtonEvent.LongClick, function () {
	
})
input.onButtonEvent(Button.A, input.buttonEventClick(), function () {
    hell += 1
    calliBot2.setRgbLed(C2RgbLed.LV, 0, 0, hell)
    lcd16x2rgb.writeText(lcd16x2rgb.lcd16x2_eADDR(lcd16x2rgb.eADDR_LCD.LCD_16x2_x3E), 0, 0, 15, hell)
    lcd16x2rgb.writeText(lcd16x2rgb.lcd16x2_eADDR(lcd16x2rgb.eADDR_LCD.LCD_16x2_x3E), 1, 0, 15, calliBot2.log())
})
input.onButtonEvent(Button.AB, input.buttonEventClick(), function () {
	
})
input.onButtonEvent(Button.B, input.buttonEventClick(), function () {
    hell += -1
    calliBot2.setRgbLed(C2RgbLed.LV, 0, 0, hell)
    lcd16x2rgb.writeText(lcd16x2rgb.lcd16x2_eADDR(lcd16x2rgb.eADDR_LCD.LCD_16x2_x3E), 0, 0, 15, hell)
    lcd16x2rgb.writeText(lcd16x2rgb.lcd16x2_eADDR(lcd16x2rgb.eADDR_LCD.LCD_16x2_x3E), 1, 0, 15, calliBot2.log())
})
input.onButtonEvent(Button.A, ButtonEvent.Hold, function () {
    calliBot2.setRgbLed(C2RgbLed.LV, 0, 0, hell)
    lcd16x2rgb.writeText(lcd16x2rgb.lcd16x2_eADDR(lcd16x2rgb.eADDR_LCD.LCD_16x2_x3E), 1, 0, 15, calliBot2.log())
})
input.onButtonEvent(Button.B, ButtonEvent.Hold, function () {
    calliBot2.setRgbLed1(C2RgbLed.LV, 0x0000ff, 8)
    lcd16x2rgb.writeText(lcd16x2rgb.lcd16x2_eADDR(lcd16x2rgb.eADDR_LCD.LCD_16x2_x3E), 1, 0, 15, calliBot2.log())
})
let hell = 0
lcd16x2rgb.initLCD(lcd16x2rgb.lcd16x2_eADDR(lcd16x2rgb.eADDR_LCD.LCD_16x2_x3E))
let Calli2bot = calli2bot.beimStart(calli2bot.eADDR.CB2_x22)
hell = 6
