
//% color=#007F00 icon="\uf188" block="Calli²bot" weight=28
//% groups='["beim Start","Motor (-100% .. 0 .. +100%)","LED","INPUT"]'
namespace calli2bot
/* 231030 calliope-net.github.io/callibot
    icon="\uf17b" android
Quellen:
https://github.com/knotechgmbh
https://github.com/MKleinSB/pxt-callibot
umgestellt auf i2c Adresse 0x22 und Register, 0x20 und 0x21 wird von dieser Erweiterung nicht genutzt
Calli:bot2 Steuercodes Seite 3-5:
https://github.com/calliope-net/callibot/blob/master/2021-11-12a_Callibot2_Software-Infos.pdf
    Ab CalliBot2 wird über Register gearbeitet. D.h. Es wird immer mindestens ein Byte geschrieben, welches das Register auswählt.
    Ein folgendes READ fragt dann dieses Register ab.
Code neu programmiert von Lutz Elßner im Oktober 2023
*/ {
    export enum eADDR {
        CB2_x22 = 0x22 //, WR_MOTOR_x20 = 0x20, WR_LED_x21 = 0x21, RD_SENSOR_x21
    }
    //% blockId=calli2bot_eADDR block="%pADDR" blockHidden=true
    export function calli2bot_eADDR(pADDR: eADDR): number { return pADDR }

    export enum eRegister {
        // Write
        RESET_OUTPUTS = 0x01, // Alle Ausgänge abschalten (Motor, LEDs, Servo)
        SET_MOTOR = 0x02, // Bit0: 1=Motor 1 setzen;  Bit1: 1=Motor 2 setzen
        /*
Bit0: 1=Motor 1 setzen;  Bit1: 1=Motor 2 setzen
wenn beide auf 11, dann Motor2 Daten nachfolgend senden (also 6 Bytes) Richtung (0:vorwärts, 1:rückwärts) von Motor 1 oder 2
PWM (0..255) Motor 1 oder 2
wenn in [1] Motor 1 & Motor 2 aktiviert
Richtung (0:vorwärts, 1:rückwärts) von Motor 2
PWM rechts (0..255) von Motor 2
        */
        SET_LED = 0x03, // Write: LED´s
        RESET_ENCODER = 0x05, // 2 Byte [0]=5 [1]= 1=links, 2=rechts, 3=beide
        // Read
        GET_INPUTS = 0x80, // Digitaleingänge (1 Byte 6 Bit)
        GET_INPUT_US = 0x81, // Ultraschallsensor (3 Byte 16 Bit)
        GET_FW_VERSION = 0x82, // Typ & Firmwareversion & Seriennummer (10 Byte)
        GET_POWER = 0x83, // Versorgungsspannung [ab CalliBot2E] (3 Byte 16 Bit)
        GET_LINE_SEN_VALUE = 0x84, // Spursensoren links / rechts Werte (5 Byte 2x16 Bit)
        GET_ENCODER_VALUE = 0x91 // 9 Byte links[1-4] rechts [5-8] 2* INT32BE mit Vorzeichen
    }

    // ========== group="beim Start"

    //% group="beim Start"
    //% block="i2c %pADDR beim Start || i2c-Check %ck Log %pLogEnabled"
    //% pADDR.shadow="calli2bot_eADDR"
    //% ck.shadow="toggleOnOff" ck.defl=1
    //% pLogEnabled.shadow="toggleOnOff"
    //% blockSetVariable=Calli2bot
    export function beimStart(pADDR: number, ck = true, pLogEnabled = false): Calli2bot {
        let c2 = new Calli2bot(pADDR, (ck ? true : false), pLogEnabled) // optionaler boolean Parameter kann undefined sein
        calliBot2.c2Initialized = 1
        calliBot2.c2IsBot2 = 1
        return c2
    }


    //% group="Motor (-100% .. 0 .. +100%)"
    //% block="Pause %sekunden" weight=1
    //% sekunden.shadow=calli2bot_ePause
    export function pausesekunden(sekunden: number) {
        control.waitMicros(sekunden * 1000000)
    }

    export enum ePause {
        //% block="1 Sekunde"
        p1 = 10,
        //% block="0,5 Sekunden"
        p05 = 5,
        //% block="2 Sekunden"
        p2 = 20,
        //% block="5 Sekunden"
        p5 = 50,
        //% block="10 Sekunden"
        p10 = 100,
        //% block="15 Sekunden"
        p15 = 150,
        //% block="20 Sekunden"
        p20 = 200,
        //% block="30 Sekunden"
        p30 = 300,
        //% block="45 Sekunden"
        p45 = 450,
        //% block="60 Sekunden"
        p60 = 600
    }
    //% blockId=calli2bot_ePause block="%pPause" blockHidden=true
    export function calli2bot_ePause(pPause: ePause): number { return pPause / 10 }


    export enum eMotor {
        //% block="links"
        m1 = 0b01,
        //% block="rechts"
        m2 = 0b10,
        //% block="beide"
        beide = 0b11
    }

    export enum eRL { rechts = 0, links = 1 } // Index im Array

    export enum eDirection {
        //% block="vorwärts"
        v = 0,
        //% block="rückwärts"
        r = 1
    }

    export enum eLed {
        //% block="linke rote LED"
        redl = 5,
        //% block="rechte rote LED"
        redr = 6,
        //% block="beide rote LED"
        redb = 16,
        //% block="Spursucher LED links"
        spurl = 7,
        //% block="Spursucher LED rechts"
        spurr = 8,
        //% block="Power-ON LED"
        poweron = 0
    }

    export enum eRgbLed {
        //% block="alle (4)"
        All = 0,
        //% block="links vorne"
        LV = 1,
        //% block="links hinten"
        LH = 2,
        //% block="rechts hinten"
        RH = 3,
        //% block="rechts vorne"
        RV = 4
    }

    export enum eINPUTS {
        //% block="Spursucher dunkel"
        sp0, //= 0b00000000,
        //% block="Spursucher rechts"
        sp1r, //= 0b00000001,
        //% block="Spursucher links"
        sp2l, //= 0b00000010,
        //% block="Spursucher beide"
        sp3b, //= 0b00000011,
        //% block="Spursucher egal"
        sp4e,
        //% block="Stoßstange aus"
        st0, //= 0b00000000,
        //% block="Stoßstange rechts"
        st1r, //= 0b00000100,
        //% block="Stoßstange links"
        st2l, //= 0b00001000,
        //% block="Stoßstange beide"
        st3b, //= 0b00001100,
        //% block="Stoßstange egal"
        st4e,
        //% block="ON-Taster"
        ont, //= 0b00010000,
        //% block="OFF-Taster"
        off //= 0b00100000
    }

    export enum eVergleich {
        //% block=">"
        gt,
        //% block="<"
        lt
    }

    export enum eVersion { Typ, Firmware, Seriennummer }


    //% blockId=callibot_colorPicker block="%value"
    //% blockHidden=true
    //% shim=TD_ID
    //% value.fieldEditor="colornumber" value.fieldOptions.decompileLiterals=true
    //% value.fieldOptions.colours='["#000000","#0000ff","#00ff00","#00ffdc","#ff0000","#a300ff","#ffff00","#ffffff"]'
    //% value.fieldOptions.columns=4 value.fieldOptions.className='rgbColorPicker'  
    export function callibot_colorPicker(value: number) { return value }
    /* 
        enum eRgbColor {
            red = 0xff0000,
            green = 0x00ff00,
            blue = 0x0000ff,
            yellow = 0xffff00,
            violett = 0xa300ff,
            aqua = 0x00ffdc,
            white = 0xffffff,
            black = 0x000000
        } */

    let nLautMax = 0
    let nLautCount = 0

    //% group="4 Lautstärke, Stop and Go" subcategory=Beispiele
    //% block="(dauerhaft) Lautstärke > %soundLevel" weight=5 deprecated=true
    //% soundLevel.min=0 soundLevel.max=255 soundLevel.defl=30
    //% blockSetVariable=lText
    export function lautMessung(soundLevel: number) {
        let laut = input.soundLevel()
        if (laut > soundLevel) {
            nLautMax = laut
            nLautCount += 1
            pause(0.5) // 0,5 Sekunden nur nach Ereignis
        }
        return format4r(laut) + format4r(nLautMax) + format4r(soundLevel) + format4r(nLautCount)
    }

    //% group="4 Lautstärke, Stop and Go" subcategory=Beispiele
    //% block="es laut war" weight=4 deprecated=true
    export function lautTest() {
        if (nLautCount > 0) {
            nLautMax = 0
            nLautCount = 0
            return true
        } else
            return false
    }


    // ========== private

    export function between(i0: number, i1: number, i2: number): boolean { return (i0 >= i1 && i0 <= i2) }

    export function sign(i: number, e: number = 7): number {
        if (i < 2 ** e) return i
        else return -((~i & ((2 ** e) - 1)) + 1)
    }
    export function format4r(pValue: any) {
        let pText = convertToText(pValue)
        return "    ".substr(0, 4 - pText.length) + pText
    }


}// callibot.ts
