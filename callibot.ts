
//% color=#007F00 icon="\uf17b" block="Calli²bot" weight=29
namespace calli2bot
/* 231024 f17b android

https://github.com/knotechgmbh
https://github.com/MKleinSB/pxt-callibot

*/ {
    export enum eADDR {
        CB2_x22 = 0x22, WR_MOTOR_x20 = 0x20, WR_LED_x21 = 0x21, RD_SENSOR_x21
        /*
        Ab CalliBot2 wird über Register gearbeitet. D.h. Es wird immer mindestens ein Byte geschrieben, 
        welches das Register auswählt. Ein folgendes READ fragt dann dieses Register ab.
        */
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
        // Read
        GET_INPUTS = 0x80, // Digitaleingänge (1 Byte 6 Bit)
        GET_INPUT_US = 0x81, // Ultraschallsensor (3 Byte 16 Bit)
        GET_FW_VERSION = 0x82, // Typ & Firmwareversion & Seriennummer (10 Byte)
        GET_POWER = 0x83, // Versorgungsspannung [ab CalliBot2E] (3 Byte 16 Bit)
        GET_LINE_SEN_VALUE = 0x84 // Spursensoren links / rechts Werte (5 Byte 2x16 Bit)
    }



    let n_i2cCheck: boolean = false // i2c-Check
    let n_i2cError: number = 0 // Fehlercode vom letzten WriteBuffer (0 ist kein Fehler)

    //% group="calliope-net.github.io/callibot"
    //% block="i2c beim Start || i2c-Check %ck" weight=4
    //% ck.shadow="toggleOnOff" ck.defl=1
    export function beimStart(ck?: boolean) {
        n_i2cCheck = (ck ? true : false) // optionaler boolean Parameter kann undefined sein
        n_i2cError = 0 // Reset Fehlercode
        //readRegister(pADDR, eCommandByte.CONFIGURATION)
        //let x=   Digital.prototype

    }

    // ========== group="INPUT digital 6 Bit"

    export class Digital_ {
        bits: number
        private readonly iADDR: calli2bot.eADDR

        constructor(pADDR: eADDR) {
            this.iADDR = pADDR
        }
        /* 
                //% group="INPUT digital 6 Bit"
                // block="i2c %pADDR Input Digital"
                // blockSetVariable=createDigital
                static create(pADDR: calli2bot.eADDR) {
                    let inputs = new Digital(pADDR)
                    //inputs.iADDR = pADDR
                    return inputs
                } */


        //% group="INPUT digital 6 Bit"
        //% block="neu einlesen %in_Digital Digitaleingänge" weight=8
        readINPUTS() {
            i2cWriteBuffer(eADDR.CB2_x22, Buffer.fromArray([eRegister.GET_INPUTS]), true)
            this.bits = i2cReadBuffer(eADDR.CB2_x22, 1).getUint8(0)
        }



        //% group="INPUT digital 6 Bit"
        //% block="%in_Digital %pINPUTS" weight=7
        bitINPUTS(pINPUTS: eINPUTS) {
            switch (pINPUTS) {
                case eINPUTS.sp0: return (this.bits & 0b00000011) == 0
                case eINPUTS.sp1: return (this.bits & 0b00000011) == 1
                case eINPUTS.sp2: return (this.bits & 0b00000011) == 2
                case eINPUTS.sp3: return (this.bits & 0b00000011) == 3
                case eINPUTS.st0: return (this.bits & 0b00001100) == 0b00000000
                case eINPUTS.st1: return (this.bits & 0b00001100) == 0b00000100
                case eINPUTS.st2: return (this.bits & 0b00001100) == 0b00001000
                case eINPUTS.st3: return (this.bits & 0b00001100) == 0b00001100
                case eINPUTS.ont: return (this.bits & 0b00010000) == 0b00010000
                case eINPUTS.off: return (this.bits & 0b00100000) == 0b00100000
                default: return false
            }
        }

    }

    //% blockId=calli2bot_createINPUTS
    //% group="INPUT digital 6 Bit"
    //% block="i2c %pADDR Digitaleingänge" weight=9
    //% blockSetVariable=in_Digital
    export function createINPUTS(pADDR: eADDR): Digital {
       return new Digital(pADDR)

        //i2cWriteBuffer(eADDR.CB2_x22, Buffer.fromArray([eRegister.GET_INPUTS]), true)
        //inputs.bits = i2cReadBuffer(eADDR.CB2_x22, 1).getUint8(0)

        //return inputs
    }
    /* 
        //% group="INPUT digital 6 Bit"
        // block="Digitaleingänge lesen" weight=8
        //% pRegister.defl=callibot.eRegister.GET_INPUTS
        //% size.min=1 size.max=10 size.defl=1
        // blockSetVariable=vdigital
        export function readINPUTS(): number {
            i2cWriteBuffer(eADDR.CB2_x22, Buffer.fromArray([eRegister.GET_INPUTS]), true)
            return i2cReadBuffer(eADDR.CB2_x22, 1).getUint8(0)
        } */

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
/* 
    //% group="INPUT digital 6 Bit"
    //% block="auswerten %digital %pINPUTS" weight=7
    export function bitINPUTS(digital: number, pINPUTS: eINPUTS) {
        switch (pINPUTS) {
            case eINPUTS.sp0: return (digital & 0b00000011) == 0
            case eINPUTS.sp1: return (digital & 0b00000011) == 1
            case eINPUTS.sp2: return (digital & 0b00000011) == 2
            case eINPUTS.sp3: return (digital & 0b00000011) == 3
            case eINPUTS.st0: return (digital & 0b00001100) == 0b00000000
            case eINPUTS.st1: return (digital & 0b00001100) == 0b00000100
            case eINPUTS.st2: return (digital & 0b00001100) == 0b00001000
            case eINPUTS.st3: return (digital & 0b00001100) == 0b00001100
            case eINPUTS.ont: return (digital & 0b00010000) == 0b00010000
            case eINPUTS.off: return (digital & 0b00100000) == 0b00100000
            default: return false
        }
    }
 */



    // ========== group="INPUT Ultraschallsensor 16 Bit (mm)"

    //% group="INPUT Ultraschallsensor 16 Bit (mm)"
    //% block="Ultraschallsensor lesen"
    //% blockSetVariable=entfernung
    export function readINPUT_US(): number {
        i2cWriteBuffer(eADDR.CB2_x22, Buffer.fromArray([eRegister.GET_INPUT_US]), true)
        return i2cReadBuffer(eADDR.CB2_x22, 3).getNumber(NumberFormat.UInt16LE, 1)
    }

    // ========== group="INPUT Spursensoren 2*16 Bit [r,l]"

    //% group="INPUT Spursensoren 2*16 Bit [r,l]"
    //% block="Spursensoren lesen" weight=4
    //% blockSetVariable=spursensoren
    export function readLINE_SEN_VALUE(): number[] {
        i2cWriteBuffer(eADDR.CB2_x22, Buffer.fromArray([eRegister.GET_LINE_SEN_VALUE]), true)
        return i2cReadBuffer(eADDR.CB2_x22, 5).slice(1, 4).toArray(NumberFormat.UInt16LE)
    }

    export enum eRL {
        //%block="Spursensor rechts"
        rechts = 0,
        //%block="Spursensor links"
        links = 1
    }
    export enum eVergleich {
        //%block=">"
        gt,
        //%block="<"
        lt
    }

    //% group="INPUT Spursensoren 2*16 Bit [r,l]"
    //% block="auswerten %sensoren %pRL %pVergleich %vergleich" weight=2
    //% inlineInputMode=inline
    export function getLINE_SEN_VALUE(sensoren: number[], pRL: eRL, pVergleich: eVergleich, vergleich: number) {
        let sensor = sensoren.get(pRL)
        switch (pVergleich) {
            case eVergleich.gt: return sensor > vergleich
            case eVergleich.lt: return sensor < vergleich
            default: return false
        }
    }


    // ========== advanced=true

    export enum eVersion { Typ, Firmware, Seriennummer }
    //% group="i2c Register lesen" advanced=true
    //% block="Version %pVersion HEX" weight=6
    export function readFW_VERSION(pVersion: eVersion) {
        i2cWriteBuffer(eADDR.CB2_x22, Buffer.fromArray([eRegister.GET_FW_VERSION]), true)
        switch (pVersion) {
            case eVersion.Typ: { return i2cReadBuffer(eADDR.CB2_x22, 2).slice(1, 1).toHex() }
            case eVersion.Firmware: { return i2cReadBuffer(eADDR.CB2_x22, 6).slice(2, 4).toHex() }
            case eVersion.Seriennummer: { return i2cReadBuffer(eADDR.CB2_x22, 10).slice(6, 4).toHex() }
            default: { return i2cReadBuffer(eADDR.CB2_x22, 10).toHex() }
        }
    }

    //% group="i2c Register lesen" advanced=true
    //% block="Versorgungsspannung mV" weight=5
    export function readPOWER(): number {
        i2cWriteBuffer(eADDR.CB2_x22, Buffer.fromArray([eRegister.GET_POWER]), true)
        return i2cReadBuffer(eADDR.CB2_x22, 3).getNumber(NumberFormat.UInt16LE, 1)
    }

    //% group="i2c Register lesen" advanced=true
    //% block="readRegister %pRegister size %size" weight=2
    //% pRegister.defl=calli2bot.eRegister.GET_INPUTS
    //% size.min=1 size.max=10 size.defl=1
    export function readRegister(pRegister: eRegister, size: number): Buffer {
        i2cWriteBuffer(eADDR.CB2_x22, Buffer.fromArray([pRegister]), true)
        return i2cReadBuffer(eADDR.CB2_x22, size)
    }


    // ========== advanced=true


    //% group="i2c Adressen" advanced=true
    //% block="i2c Fehlercode" weight=2
    export function i2cError() { return n_i2cError }

    export   function i2cWriteBuffer(pADDR: number, buf: Buffer, repeat: boolean = false) {
        if (n_i2cError == 0) { // vorher kein Fehler
            n_i2cError = pins.i2cWriteBuffer(pADDR, buf, repeat)
            if (n_i2cCheck && n_i2cError != 0)  // vorher kein Fehler, wenn (n_i2cCheck=true): beim 1. Fehler anzeigen
                basic.showString(Buffer.fromArray([pADDR]).toHex()) // zeige fehlerhafte i2c-Adresse als HEX
        } else if (!n_i2cCheck)  // vorher Fehler, aber ignorieren (n_i2cCheck=false): i2c weiter versuchen
            n_i2cError = pins.i2cWriteBuffer(pADDR, buf, repeat)
        //else { } // n_i2cCheck=true und n_i2cError != 0: weitere i2c Aufrufe blockieren
    }

    export   function i2cReadBuffer(pADDR: number, size: number, repeat: boolean = false): Buffer {
        if (!n_i2cCheck || n_i2cError == 0)
            return pins.i2cReadBuffer(pADDR, size, repeat)
        else
            return Buffer.create(size)
    }
}// callibot.ts
