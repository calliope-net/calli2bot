
namespace calli2bot {
    export class Calli2bot {
        private readonly i2cADDR: eADDR
        private readonly i2cCheck: boolean // i2c-Check
        private i2cError: number = 0 // Fehlercode vom letzten WriteBuffer (0 ist kein Fehler)

        private in_Digital: number
        private in_Ultraschallsensor: number
        private in_Spursensoren: number[]

        constructor(pADDR: eADDR, ck: boolean) {
            this.i2cADDR = pADDR
            this.i2cCheck = ck
            this.i2cError = 0 // Reset Fehlercode
        }

        //% group="beim Start" advanced=true
        //% block="%Calli2bot RESET_OUTPUTS" weight=2
        i2cRESET_OUTPUTS() {
            this.i2cWriteBuffer(Buffer.fromArray([eRegister.RESET_OUTPUTS]))
        }

        // ========== group="INPUT digital 6 Bit"

        //% group="INPUT digital 6 Bit"
        //% block="neu einlesen %Calli2bot Digitaleingänge" weight=6
        i2cReadINPUTS() {
            this.i2cWriteBuffer(Buffer.fromArray([eRegister.GET_INPUTS]))
            this.in_Digital = this.i2cReadBuffer(1).getUint8(0)
        }

        //% group="INPUT digital 6 Bit"
        //% block="%Calli2bot %pINPUTS" weight=2
        bitINPUTS(pINPUTS: eINPUTS) {
            switch (pINPUTS) {
                case eINPUTS.sp0: return (this.in_Digital & 0b00000011) == 0
                case eINPUTS.sp1: return (this.in_Digital & 0b00000011) == 1
                case eINPUTS.sp2: return (this.in_Digital & 0b00000011) == 2
                case eINPUTS.sp3: return (this.in_Digital & 0b00000011) == 3
                case eINPUTS.st0: return (this.in_Digital & 0b00001100) == 0b00000000
                case eINPUTS.st1: return (this.in_Digital & 0b00001100) == 0b00000100
                case eINPUTS.st2: return (this.in_Digital & 0b00001100) == 0b00001000
                case eINPUTS.st3: return (this.in_Digital & 0b00001100) == 0b00001100
                case eINPUTS.ont: return (this.in_Digital & 0b00010000) == 0b00010000
                case eINPUTS.off: return (this.in_Digital & 0b00100000) == 0b00100000
                default: return false
            }
        }


        // ========== group="INPUT Ultraschallsensor 16 Bit (mm)"

        //% group="INPUT Ultraschallsensor 16 Bit (mm)"
        //% block="neu einlesen %Calli2bot Ultraschallsensor" weight=6
        i2cReadINPUT_US() {
            this.i2cWriteBuffer(Buffer.fromArray([eRegister.GET_INPUT_US]))
            this.in_Ultraschallsensor = this.i2cReadBuffer(3).getNumber(NumberFormat.UInt16LE, 1)
        }

        //% group="INPUT Ultraschallsensor 16 Bit (mm)"
        //% block="%Calli2bot Entfernung %pVergleich %vergleich" weight=2
        bitINPUT_US(pVergleich: eVergleich, vergleich: number) {
            switch (pVergleich) {
                case eVergleich.gt: return this.in_Ultraschallsensor > vergleich
                case eVergleich.lt: return this.in_Ultraschallsensor < vergleich
                default: return false
            }
        }

        // ========== group="INPUT Spursensoren 2*16 Bit [r,l]"

        //% group="INPUT Spursensoren 2*16 Bit [r,l]"
        //% block="neu einlesen %Calli2bot Spursensoren" weight=6
        i2cReadLINE_SEN_VALUE() {
            this.i2cWriteBuffer(Buffer.fromArray([eRegister.GET_LINE_SEN_VALUE]))
            this.in_Spursensoren = this.i2cReadBuffer(5).slice(1, 4).toArray(NumberFormat.UInt16LE)
        }

        //% group="INPUT Spursensoren 2*16 Bit [r,l]"
        //% block="%Calli2bot Spursensor %pRL %pVergleich %vergleich" weight=2
        //% inlineInputMode=inline
        bitLINE_SEN_VALUE(pRL: eRL, pVergleich: eVergleich, vergleich: number) {
            let sensor = this.in_Spursensoren.get(pRL)
            switch (pVergleich) {
                case eVergleich.gt: return sensor > vergleich
                case eVergleich.lt: return sensor < vergleich
                default: return false
            }
        }



        // ========== subcategory="LED"

        setRGB() {

        }

        //% group="RGB LED" subcategory="LED"
        //% block="%Calli2bot V2 Schalte Beleuchtung $led rot $red grün $green blau $blue"
        //% red.min=0 red.max=16
        //% green.min=0 green.max=16
        //% blue.min=0 blue.max=16
        //% inlineInputMode=inline
        setRgbLed(led: eRgbLed, red: number, green: number, blue: number) {
            let index = 0;
            let buffer = pins.createBuffer(5)
            //init()
            if (led != eRgbLed.All) {
                switch (led) {
                    case eRgbLed.LH:
                        index = 2;
                        break;
                    case eRgbLed.RH:
                        index = 3;
                        break;
                    case eRgbLed.LV:
                        index = 1;
                        break;
                    case eRgbLed.RV:
                        index = 4;
                        break;

                }
                buffer[0] = 0x03;
                buffer[1] = index;
                buffer[2] = red;
                buffer[3] = green;
                buffer[4] = blue;
                this.i2cWriteBuffer(buffer);
            }
            else { // all leds, repeat 4 times
                for (index = 1; index < 5; index++) {
                    buffer[0] = 0x03;
                    buffer[1] = index;
                    buffer[2] = red;
                    buffer[3] = green;
                    buffer[4] = blue;
                    this.i2cWriteBuffer(buffer);
                }
            }
        }


        // ========== advanced=true

        // ========== group="gespeicherte Werte lesen" advanced=true

        //% group="gespeicherte Werte lesen" advanced=true
        //% block="%Calli2bot Digitaleingänge" weight=8
        getINPUTS() { return this.in_Digital }

        //% group="gespeicherte Werte lesen" advanced=true
        //% block="%Calli2bot Ultraschallsensor" weight=4
        getINPUT_US() { return this.in_Ultraschallsensor }

        //% group="gespeicherte Werte lesen" advanced=true
        //% block="%Calli2bot Spursensor %pRL" weight=2
        getLINE_SEN_VALUE(pRL: eRL) { return this.in_Spursensoren.get(pRL) }


        // ========== group="i2c Register lesen"

        //% group="i2c Register lesen" advanced=true
        //% block="%Calli2bot Version %pVersion HEX" weight=6
        i2cReadFW_VERSION(pVersion: eVersion) {
            this.i2cWriteBuffer(Buffer.fromArray([eRegister.GET_FW_VERSION]))
            switch (pVersion) {
                case eVersion.Typ: { return this.i2cReadBuffer(2).slice(1, 1).toHex() }
                case eVersion.Firmware: { return this.i2cReadBuffer(6).slice(2, 4).toHex() }
                case eVersion.Seriennummer: { return this.i2cReadBuffer(10).slice(6, 4).toHex() }
                default: { return this.i2cReadBuffer(10).toHex() }
            }
        }

        //% group="i2c Register lesen" advanced=true
        //% block="%Calli2bot Versorgungsspannung mV" weight=4
        i2cReadPOWER(): number {
            this.i2cWriteBuffer(Buffer.fromArray([eRegister.GET_POWER]))
            return this.i2cReadBuffer(3).getNumber(NumberFormat.UInt16LE, 1)
        }

        //% group="i2c Register lesen" advanced=true
        //% block="%Calli2bot readRegister %pRegister size %size" weight=2
        //% pRegister.defl=calli2bot.eRegister.GET_INPUTS
        //% size.min=1 size.max=10 size.defl=1
        i2cReadRegister(pRegister: eRegister, size: number): Buffer {
            this.i2cWriteBuffer(Buffer.fromArray([pRegister]))
            return this.i2cReadBuffer(size)
        }

        //% group="i2c Register lesen" advanced=true
        //% block="%Calli2bot i2c Fehlercode" weight=1
        geti2cError() { return this.i2cError }


        // ========== private

        private i2cWriteBuffer(buf: Buffer) { // repeat funktioniert nicht
            if (this.i2cError == 0) { // vorher kein Fehler
                this.i2cError = pins.i2cWriteBuffer(this.i2cADDR, buf)
                if (this.i2cCheck && this.i2cError != 0)  // vorher kein Fehler, wenn (n_i2cCheck=true): beim 1. Fehler anzeigen
                    basic.showString(Buffer.fromArray([this.i2cADDR]).toHex()) // zeige fehlerhafte i2c-Adresse als HEX
            } else if (!this.i2cCheck)  // vorher Fehler, aber ignorieren (n_i2cCheck=false): i2c weiter versuchen
                this.i2cError = pins.i2cWriteBuffer(this.i2cADDR, buf)
            //else { } // n_i2cCheck=true und n_i2cError != 0: weitere i2c Aufrufe blockieren
        }

        private i2cReadBuffer(size: number): Buffer { // repeat funktioniert nicht
            if (!this.i2cCheck || this.i2cError == 0)
                return pins.i2cReadBuffer(this.i2cADDR, size)
            else
                return Buffer.create(size)
        }

    } // class Calli2bot



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

    export enum eRL { rechts = 0, links = 1 } // Index im Array

    export enum eVergleich {
        //% block=">"
        gt,
        //% block="<"
        lt
    }

    export enum eVersion { Typ, Firmware, Seriennummer }

} // callibot2.ts
