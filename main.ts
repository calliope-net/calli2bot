input.onButtonEvent(Button.A, input.buttonEventClick(), function () {
    Calli2bot.setRgbLed3(0x000000, true, true, false, false)
})
input.onButtonEvent(Button.B, input.buttonEventClick(), function () {
    Calli2bot.setRgbLed3(0x00ff00, false, true, true, false)
})
let Calli2bot: calli2bot.Calli2bot = null
Calli2bot = calli2bot.beimStart(calli2bot.eADDR.CB2_x22, false)
let b = true
loops.everyInterval(200, function () {
    Calli2bot.i2cReadINPUTS()
    if (Calli2bot.bitINPUTS(calli2bot.eINPUTS.ont)) {
        Calli2bot.setLed1(calli2bot.eLed.poweron, true, false, 1)
    } else if (Calli2bot.bitINPUTS(calli2bot.eINPUTS.off)) {
        Calli2bot.setLed1(calli2bot.eLed.poweron, true)
    }
    Calli2bot.setLed1(calli2bot.eLed.redb, true, true, 5)
})
