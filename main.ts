input.onButtonEvent(Button.A, input.buttonEventClick(), function () {
    hell += 10
    Calli2bot.setMotoren2(hell, hell)
    log(Calli2bot.getLog())
})
function log (list: any[]) {
    lcd16x2rgb.writeText(lcd16x2rgb.lcd16x2_eADDR(lcd16x2rgb.eADDR_LCD.LCD_16x2_x3E), 0, 0, 15, list[0])
    lcd16x2rgb.writeText(lcd16x2rgb.lcd16x2_eADDR(lcd16x2rgb.eADDR_LCD.LCD_16x2_x3E), 1, 0, 15, list[1])
}
input.onButtonEvent(Button.B, input.buttonEventClick(), function () {
    hell += -10
    Calli2bot.setMotoren2(hell, hell)
    log(Calli2bot.getLog())
})
let hell = 0
let Calli2bot: calli2bot.Calli2bot = null
lcd16x2rgb.initLCD(lcd16x2rgb.lcd16x2_eADDR(lcd16x2rgb.eADDR_LCD.LCD_16x2_x3E))
Calli2bot = calli2bot.beimStart(calli2bot.eADDR.CB2_x22)
hell = 0
