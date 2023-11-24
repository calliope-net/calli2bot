namespace calli2bot {
    //export  class Calli2bot {


 /*    //% group="Seite2Motor" subcategory=Codekarten
    //% block="Motoren %pCalli2bot Pause %sekunden" weight=8
    //% sekunden.shadow=calli2bot_ePause
    export function seite2Motor(pCalli2bot: Calli2bot, sekunden: number) {
        pCalli2bot.setMotoren2(100, 100)
        pause(sekunden)
        pCalli2bot.setMotoren2(-50, 50)
        pause(sekunden)
        pCalli2bot.setMotoren2(0, 0)
    } */
    //}
    /*     
    function Seite5fahren50cm() {
        Calli2bot.setMotoren2(100, 100)
        basic.pause(3200)
        Calli2bot.setMotoren2(0, 0)
    }
    function Seite5drehen() {
        Calli2bot.setMotoren2(100, -100)
        basic.pause(1370)
        Calli2bot.setMotoren2(0, 0)
    }
    function Seite3LED() {
        Calli2bot.setRgbLed3(0xff0000, true, false, false, false, false)
        basic.pause(100)
        Calli2bot.setRgbLed3(0x0000ff, false, false, false, true, false)
        Calli2bot.setRgbLed3(0x000000, true, false, false, false, false)
        basic.pause(100)
        Calli2bot.setRgbLed3(0xa300ff, false, true, false, false, false)
        Calli2bot.setRgbLed3(0x000000, false, false, false, true, false)
        basic.pause(100)
        Calli2bot.setRgbLed3(0xa300ff, false, true, false, false, false)
        Calli2bot.setRgbLed3(0x000000, false, false, true, false, false)
        basic.pause(100)
        Calli2bot.setRgbLed3(0x000000, false, true, false, false, false)
    }
    function Seite6blinken3mal() {
        for (let index = 0; index < 6; index++) {
            Calli2bot.setLed1(calli2bot.eLed.redl, true, true)
            basic.pause(500)
        }
        for (let index = 0; index < 6; index++) {
            Calli2bot.setLed1(calli2bot.eLed.redr, true, true)
            basic.pause(500)
        }
        for (let index = 0; index < 6; index++) {
            Calli2bot.setLed1(calli2bot.eLed.redb, true, true)
            basic.pause(500)
        }
    }
    function Seite4StopandGo() {
        laut = input.soundLevel()
        if (laut < 100) {
            if (Motoran) {
                Calli2bot.setMotoren2(80, 80)
            }
        } else {
            Motoran = !(Motoran)
            Calli2bot.setMotoren2(0, 0)
        }
    }
    function Seite8Arena() {
        Calli2bot.i2cReadINPUTS()
        if (Calli2bot.bitINPUTS(calli2bot.eINPUTS.sp2)) {
            Calli2bot.setMotoren2(-50, 50)
            calli2bot.pause(calli2bot.calli2bot_ePause(calli2bot.ePause.p1))
        } else if (Calli2bot.bitINPUTS(calli2bot.eINPUTS.sp1)) {
            Calli2bot.setMotoren2(50, -50)
            calli2bot.pause(calli2bot.calli2bot_ePause(calli2bot.ePause.p1))
        } else {
            Calli2bot.setMotoren2(50, 50)
        }
    }
    function Seite9Linienfolger() {
        Calli2bot.i2cReadINPUTS()
        if (Calli2bot.bitINPUTS(calli2bot.eINPUTS.sp0)) {
            Calli2bot.setMotoren2(100, 100)
        } else if (Calli2bot.bitINPUTS(calli2bot.eINPUTS.sp1)) {
            Calli2bot.setMotoren2(0, 50)
        } else {
            Calli2bot.setMotoren2(50, 0)
        }
    }
    input.onButtonEvent(Button.A, input.buttonEventClick(), function () {
        while (true) {
            Seite9Linienfolger()
        }
        Calli2bot.i2cRESET_OUTPUTS()
    })
    function Seite2Motor() {
        Calli2bot.setMotoren2(100, 100)
        calli2bot.pause(calli2bot.calli2bot_ePause(calli2bot.ePause.p1))
        Calli2bot.setMotoren2(-50, 50)
        calli2bot.pause(calli2bot.calli2bot_ePause(calli2bot.ePause.p1))
        Calli2bot.setMotoren2(0, 0)
    }
    input.onButtonEvent(Button.B, input.buttonEventClick(), function () {
        while (true) {
            Seite8Arena()
        }
        Calli2bot.i2cRESET_OUTPUTS()
    })
    function Seite4LautMax() {
        laut = input.soundLevel()
        if (laut > lautmax) {
            lautmax = laut
        }
    }
    function Seite6Blinken3links() {
        for (let index = 0; index < 6; index++) {
            Calli2bot.setLed1(calli2bot.eLed.redl, true, true)
            calli2bot.pause(calli2bot.calli2bot_ePause(calli2bot.ePause.p05))
        }
    }
    function Seite7Ultraschall() {
        Calli2bot.i2cReadINPUT_US()
        if (Calli2bot.bitINPUT_US(calli2bot.eVergleich.gt, 15)) {
            Calli2bot.setMotoren2(80, 80)
        } else {
            Calli2bot.setMotoren2(0, 0)
            Calli2bot.setMotoren2(100, -100)
            calli2bot.pause(calli2bot.calli2bot_ePause(calli2bot.ePause.p1))
        }
    }
    let lautmax = 0
    let Motoran = false
    let laut = 0
    let Calli2bot: calli2bot.Calli2bot = null
    Calli2bot = calli2bot.beimStart(calli2bot.calli2bot_eADDR(calli2bot.eADDR.CB2_x22))
     */
}