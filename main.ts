input.onButtonEvent(Button.A, input.buttonEventClick(), function () {
    Calli2bot.setRgbLed2(calli2bot.eRgbLed.RH, 0xa300ff)
})
input.onButtonEvent(Button.B, input.buttonEventClick(), function () {
    Calli2bot.setRgbLed2(calli2bot.eRgbLed.RV, 0x00ffdc)
})
let Calli2bot: calli2bot.Calli2bot = null
lcd16x2rgb.initLCD(lcd16x2rgb.lcd16x2_eADDR(lcd16x2rgb.eADDR_LCD.LCD_16x2_x3E))
Calli2bot = calli2bot.beimStart(calli2bot.eADDR.CB2_x22)
