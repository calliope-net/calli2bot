
//% color=#007F00 icon="\uf17b" block="Calli²bot" weight=29
//% groups='["beim Start","Motor (-100% .. 0 .. +100%)","LED","INPUT"]'
namespace calli2bot
/* 231030 calliope-net.github.io/callibot

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
        RESET_ENCODER=0x05, // 2 Byte [0]=5 [1]= 1=links, 2=rechts, 3=beide
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
    //% block="i2c %pADDR beim Start || i2c-Check %ck"
    //% ck.shadow="toggleOnOff" ck.defl=1
    //% blockSetVariable=Calli2bot
    export function beimStart(pADDR: eADDR, ck?: boolean): Calli2bot {
        let c2 = new Calli2bot(pADDR, (ck ? true : false)) // optionaler boolean Parameter kann undefined sein
        calliBot2.c2Initialized = 1
        calliBot2.c2IsBot2 = 1
        return c2
    }


    export enum eMotor {
        //% block="beide"
        beide = 0b11,
        //% block="links"
        m1 = 0b01,
        //% block="rechts"
        m2 = 0b10
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
        //% block="Spursucher aus"
        sp0, //= 0b00000000,
        //% block="Spursucher rechts"
        sp1, //= 0b00000001,
        //% block="Spursucher links"
        sp2, //= 0b00000010,
        //% block="Spursucher beide"
        sp3, //= 0b00000011,
        //% block="Stoßstange aus"
        st0, //= 0b00000000,
        //% block="Stoßstange rechts"
        st1, //= 0b00000100,
        //% block="Stoßstange links"
        st2, //= 0b00001000,
        //% block="Stoßstange beide"
        st3, //= 0b00001100,
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



    //% group="Color"
    //% block="V1 Schalte Beleuchtung Farbe $color" advanced=true
    //% color.shadow="callibot_colorPicker"
    function setRgbLed1(color: number) {


        let bu = Buffer.create(4)
        bu.setNumber(NumberFormat.UInt32BE, 0, color)
        bu[1] = bu[1] >>> 4
        bu[2] = bu[2] >>> 4
        bu[3] = bu[3] >>> 4
        //let n: number = (bu.getUint8(1) >>> 4) << 16 & (bu.getUint8(2) >>> 4) << 8 & (bu.getUint8(8) >>> 4)

        //u.setNumber(NumberFormat.UInt32BE, 0, color)
        return bu.toHex()
    }

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

}// callibot.ts
