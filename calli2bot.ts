
namespace calli2bot {
    export class Calli2bot {
        private readonly i2cADDR: eADDR
        private readonly i2cCheck: boolean // i2c-Check
        private i2cError: number = 0 // Fehlercode vom letzten WriteBuffer (0 ist kein Fehler)
        private motorPower: boolean
        private log: string[]
        private qLEDs = [0, 0, 0, 0, 0, 0, 0, 0, 0] // LED Wert in Register 0x03 merken zum blinken

        private input_Digital: number
        private input_Ultraschallsensor: number
        private input_Spursensoren: number[]

        constructor(pADDR: eADDR, ck: boolean) {
            this.i2cADDR = pADDR
            this.i2cCheck = ck
            this.i2cError = 0 // Reset Fehlercode
            this.i2cRESET_OUTPUTS()
        }


        // ========== group="Motor (-100% .. 0 .. +100%)"

        //% group="Motor (-100% .. 0 .. +100%)"
        //% block="Motoren %Calli2bot links mit %pwm1 \\% rechts mit %pwm2 \\%" weight=8
        //% pwm1.shadow="speedPicker" pwm1.defl=0
        //% pwm2.shadow="speedPicker" pwm2.defl=0
        setMotoren2(pwm1: number, pwm2: number) {
            this.log = [pwm1 + " " + pwm2, ""]
            let pRichtung1 = (pwm1 < 0 ? eDirection.r : eDirection.v)
            let pRichtung2 = (pwm2 < 0 ? eDirection.r : eDirection.v)
            pwm1 = Math.trunc(Math.abs(pwm1) * 255 / 100)
            pwm2 = Math.trunc(Math.abs(pwm2) * 255 / 100)

            this.log[1] = pwm1 + " " + pwm2

            this.setMotoren(pwm1, pRichtung1, pwm2, pRichtung2)

            //if (this.between(pwm1, 0, 255) && this.between(pwm2, 0, 255))
            //    this.i2cWriteBuffer(Buffer.fromArray([eRegister.SET_MOTOR, eMotor.beide, pRichtung1, pwm1, pRichtung2, pwm2]))
            //else
            //    this.i2cWriteBuffer(Buffer.fromArray([eRegister.SET_MOTOR, eMotor.beide, 0, 0, 0, 0]))
        }

        //% group="Motor (-100% .. 0 .. +100%)"
        //% block="Motor %Calli2bot %pMotor mit %pwm \\%" weight=7
        //% pwm.shadow="speedPicker" pwm.defl=0
        setMotor(pMotor: eMotor, pwm: number) {
            let pRichtung = (pwm < 0 ? eDirection.r : eDirection.v)
            pwm = Math.trunc(Math.abs(pwm) * 255 / 100)

            if (this.between(pwm, 0, 255)) {
                //this.motorPower = true
            } else  // falscher Parameter -> beide Stop
                pMotor = eMotor.beide; pwm = 0

            if (pMotor == eMotor.beide)
                this.i2cWriteBuffer(Buffer.fromArray([eRegister.SET_MOTOR, pMotor, pRichtung, pwm, pRichtung, pwm]))
            else
                this.i2cWriteBuffer(Buffer.fromArray([eRegister.SET_MOTOR, pMotor, pRichtung, pwm]))
        }



        // ========== group="LED"



        //% group="LED"
        //% block="LED %Calli2bot %led %onoff || blinken %blink Helligkeit %pwm" weight=8
        //% onoff.shadow="toggleOnOff"
        //% blink.shadow="toggleYesNo"
        //% pwm.min=1 pwm.max=16 pwm.defl=16
        //% inlineInputMode=inline 
        setLed1(pLed: eLed, on: boolean, blink = false, pwm?: number) {
            if (!on)
                pwm = 0 // LED aus schalten
            else if (!this.between(pwm, 0, 16))
                pwm = 16 // bei ungültigen Werten max. Helligkeit

            if (pLed == eLed.redb) {
                this.setLed1(eLed.redl, on, blink, pwm) // 2 mal rekursiv aufrufen für beide rote LED
                this.setLed1(eLed.redr, on, blink, pwm)
            }
            else {
                if (blink && this.qLEDs.get(pLed) == pwm)
                    pwm = 0
                this.i2cWriteBuffer(Buffer.fromArray([eRegister.SET_LED, pLed, pwm]))
                this.qLEDs.set(pLed, pwm)
            }
        }


        //% group="LED"
        //% block="RGB LED %Calli2bot %color || ↖ %lv ↙ %lh ↘ %rh ↗ %rv blinken %blink" weight=7
        //% color.shadow="callibot_colorPicker"
        //% lv.shadow="toggleYesNo" lh.shadow="toggleYesNo" rh.shadow="toggleYesNo" rv.shadow="toggleYesNo"
        //% blink.shadow="toggleYesNo"
        //% inlineInputMode=inline expandableArgumentMode="toggle"
        setRgbLed3(color: number, lv = true, lh = true, rh = true, rv = true, blink = false) {
            //basic.showString(lv.toString())
            let buffer = Buffer.create(5)
            buffer[0] = eRegister.SET_LED
            buffer.setNumber(NumberFormat.UInt32BE, 1, color) // [1]=0 [2]=r [3]=g [4]=b
            buffer[2] = buffer[2] >>> 4 // durch 16, gültige rgb Werte für callibot: 0-15
            buffer[3] = buffer[3] >>> 4
            buffer[4] = buffer[4] >>> 4

            if (lv) this.setRgbLed31(eRgbLed.LV, buffer, blink)
            if (lh) this.setRgbLed31(eRgbLed.LH, buffer, blink)
            if (rh) this.setRgbLed31(eRgbLed.RH, buffer, blink)
            if (rv) this.setRgbLed31(eRgbLed.RV, buffer, blink)

            //if (lv) { buffer[1] = eRgbLed.LV; this.i2cWriteBuffer(buffer); basic.pause(10) }
            //if (lh) { buffer[1] = eRgbLed.LH; this.i2cWriteBuffer(buffer); basic.pause(10) }
            //if (rh) { buffer[1] = eRgbLed.RH; this.i2cWriteBuffer(buffer); basic.pause(10) }
            //if (rv) { buffer[1] = eRgbLed.RV; this.i2cWriteBuffer(buffer); basic.pause(10) }

        }

        // blinken
        setRgbLed31(pRgbLed: eRgbLed, buffer: Buffer, blink: boolean) {
            if (blink && this.qLEDs[pRgbLed] == buffer.getNumber(NumberFormat.UInt32BE, 1))
                buffer.setNumber(NumberFormat.UInt32BE, 1, 0) // alle Farben aus
            this.qLEDs[pRgbLed] = buffer.getNumber(NumberFormat.UInt32BE, 1)
            buffer[1] = pRgbLed // Led-Index 1,2,3,4 für RGB
            this.i2cWriteBuffer(buffer)
            basic.pause(10)
        }

        //% group="LED" deprecated=true
        //% block="RGB LED %Calli2bot %led %color" weight=6
        //% color.shadow="callibot_colorPicker"
        setRgbLed2(led: eRgbLed, color: number) {
            let buffer = Buffer.create(5)
            buffer[0] = eRegister.SET_LED
            buffer.setNumber(NumberFormat.UInt32BE, 1, color) // [1]=0 [2]=r [3]=g [4]=b
            buffer[2] = buffer[2] >>> 4 // durch 16, gültige rgb Werte für callibot: 0-15
            buffer[3] = buffer[3] >>> 4
            buffer[4] = buffer[4] >>> 4
            if (led != eRgbLed.All) {
                buffer[1] = led
                this.i2cWriteBuffer(buffer)
            } else // all leds, repeat 4 times
                for (let i = 1; i < 5; i++) {
                    buffer[1] = i
                    this.i2cWriteBuffer(buffer)
                    basic.pause(10)
                }
        }

        //% group="LED" deprecated=true
        //% block="RGB LED %Calli2bot %led rot %red grün %green blau %blue" weight=4
        //% red.min=0 red.max=16 red.defl=16
        //% green.min=0 green.max=16 green.defl=16
        //% blue.min=0 blue.max=16 blue.defl=16
        //% inlineInputMode=inline
        setRgbLed1(led: eRgbLed, red: number, green: number, blue: number) {
            if (red >= 0 && green >= 0 && blue >= 0) {
                let buffer = Buffer.fromArray([eRegister.SET_LED, led, red, green, blue])
                if (led != eRgbLed.All)
                    this.i2cWriteBuffer(buffer);
                else // all leds, repeat 4 times
                    for (let i = 1; i < 5; i++) {
                        buffer[1] = i
                        this.i2cWriteBuffer(buffer)
                        basic.pause(10)
                    }
            }
        }

        // ========== group="Reset"

        //% group="Reset"
        //% block="alles aus %Calli2bot Motor, LEDs, Servo"
        i2cRESET_OUTPUTS() {
            this.i2cWriteBuffer(Buffer.fromArray([eRegister.RESET_OUTPUTS]))
            this.motorPower = false
        }



        // ========== subcategory="Sensoren"

        // ========== group="INPUT digital" subcategory="Sensoren"

        //% group="INPUT digital" subcategory="Sensoren"
        //% block="neu einlesen %Calli2bot Digitaleingänge" weight=7
        i2cReadINPUTS() {
            this.i2cWriteBuffer(Buffer.fromArray([eRegister.GET_INPUTS]))
            this.input_Digital = this.i2cReadBuffer(1).getUint8(0)
        }

        //% group="INPUT digital" subcategory="Sensoren"
        //% block="%Calli2bot %pINPUTS" weight=6
        bitINPUTS(pINPUTS: eINPUTS) {
            switch (pINPUTS) {
                case eINPUTS.sp0: return (this.input_Digital & 0b00000011) == 0
                case eINPUTS.sp1: return (this.input_Digital & 0b00000011) == 1
                case eINPUTS.sp2: return (this.input_Digital & 0b00000011) == 2
                case eINPUTS.sp3: return (this.input_Digital & 0b00000011) == 3
                case eINPUTS.st0: return (this.input_Digital & 0b00001100) == 0b00000000
                case eINPUTS.st1: return (this.input_Digital & 0b00001100) == 0b00000100
                case eINPUTS.st2: return (this.input_Digital & 0b00001100) == 0b00001000
                case eINPUTS.st3: return (this.input_Digital & 0b00001100) == 0b00001100
                case eINPUTS.ont: return (this.input_Digital & 0b00010000) == 0b00010000
                case eINPUTS.off: return (this.input_Digital & 0b00100000) == 0b00100000
                default: return false
            }
        }

        //% group="INPUT digital" subcategory="Sensoren"
        //% block="%Calli2bot Digitaleingänge 6 Bit" weight=5
        getINPUTS() { return this.input_Digital }



        // ========== group="INPUT Ultraschallsensor" subcategory="Sensoren"

        //% group="INPUT Ultraschallsensor" subcategory="Sensoren"
        //% block="neu einlesen %Calli2bot Ultraschallsensor" weight=3
        i2cReadINPUT_US() {
            this.i2cWriteBuffer(Buffer.fromArray([eRegister.GET_INPUT_US]))
            this.input_Ultraschallsensor = this.i2cReadBuffer(3).getNumber(NumberFormat.UInt16LE, 1)
        }

        //% group="INPUT Ultraschallsensor" subcategory="Sensoren"
        //% block="%Calli2bot Entfernung %pVergleich %vergleich mm" weight=2
        bitINPUT_US(pVergleich: eVergleich, vergleich: number) {
            switch (pVergleich) {
                case eVergleich.gt: return this.input_Ultraschallsensor > vergleich
                case eVergleich.lt: return this.input_Ultraschallsensor < vergleich
                default: return false
            }
        }

        //% group="INPUT Ultraschallsensor" subcategory="Sensoren"
        //% block="%Calli2bot Ultraschallsensor 16 Bit (mm)" weight=1
        getINPUT_US() { return this.input_Ultraschallsensor }



        // ========== group="INPUT Spursensoren 2*16 Bit [r,l]" subcategory="Sensoren"

        // ========== group="INPUT Spursensoren 2*16 Bit [r,l]"

        //% group="INPUT Spursensoren 2*16 Bit [r,l]" subcategory="Sensoren"
        //% block="neu einlesen %Calli2bot Spursensoren" weight=6
        i2cReadLINE_SEN_VALUE() {
            this.i2cWriteBuffer(Buffer.fromArray([eRegister.GET_LINE_SEN_VALUE]))
            this.input_Spursensoren = this.i2cReadBuffer(5).slice(1, 4).toArray(NumberFormat.UInt16LE)
        }

        //% group="INPUT Spursensoren 2*16 Bit [r,l]" subcategory="Sensoren"
        //% block="%Calli2bot Spursensor %pRL %pVergleich %vergleich" weight=2
        //% inlineInputMode=inline
        bitLINE_SEN_VALUE(pRL: eRL, pVergleich: eVergleich, vergleich: number) {
            let sensor = this.input_Spursensoren.get(pRL)
            switch (pVergleich) {
                case eVergleich.gt: return sensor > vergleich
                case eVergleich.lt: return sensor < vergleich
                default: return false
            }
        }

        //% group="INPUT Spursensoren 2*16 Bit [r,l]" subcategory="Sensoren"
        //% block="%Calli2bot Spursensor %pRL" weight=1
        getLINE_SEN_VALUE(pRL: eRL) { return this.input_Spursensoren.get(pRL) }



        // ========== advanced=true


        // ========== group="Encoder 2*32 Bit [l,r]" advanced=true

        //% group="Encoder 2*32 Bit [l,r]" advanced=true
        //% block="Encoder %Calli2bot Zähler löschen %encoder"
        //% encoder.defl=calli2bot.eMotor.beide
        resetEncoder(encoder: eMotor) {
            /* let bitMask = 0;
            switch (encoder) {
                case C2eMotor.links:
                    bitMask = 1;
                    break;
                case C2eMotor.rechts:
                    bitMask = 2;
                    break;
                case C2eMotor.beide:
                    bitMask = 3;
                    break;
            }

            let buffer = pins.createBuffer(2)
            buffer[0] = eRegister.RESET_ENCODER // 5
            buffer[1] = bitMask; */
            this.i2cWriteBuffer(Buffer.fromArray([eRegister.RESET_ENCODER, encoder]))
        }

        //% group="Encoder 2*32 Bit [l,r]" advanced=true
        //%  block="Encoder %Calli2bot Werte lesen"
        encoderValue(): number[] {
            this.i2cWriteBuffer(Buffer.fromArray([eRegister.GET_ENCODER_VALUE]))
            return this.i2cReadBuffer(9).slice(1, 8).toArray(NumberFormat.Int32LE)

            /* 
                        let result: number;
                        let index: number;
            
                        let wbuffer = pins.createBuffer(1);
                        wbuffer[0] = 0x91;
                        pins.i2cWriteBuffer(0x22, wbuffer);
                        let buffer = pins.i2cReadBuffer(0x22, 9);
                        if (encoder == C2eSensor.links) {
                            index = 1;
                        }
                        else {
                            index = 5;
                        }
                        result = buffer[index + 3];
                        result = result * 256 + buffer[index + 2];
                        result = result * 256 + buffer[index + 1];
                        result = result * 256 + buffer[index];
                        result = -(~result + 1);
                        return result; */
        }



        // ==========  subcategory="Fernsteuerung"

        // ========== group="Motor (0 .. 255)" subcategory="Fernsteuerung"

        //% group="Motor (0 .. 255)" subcategory="Fernsteuerung"
        //% block="Motoren %Calli2bot links %pPWM1 (0-255) %pRichtung1 rechts %pPWM2 %pRichtung2" weight=2
        //% pwm1.min=0 pwm1.max=255 pwm1.defl=128 pwm2.min=0 pwm2.max=255 pwm2.defl=128
        //% inlineInputMode=inline
        setMotoren(pwm1: number, pRichtung1: eDirection, pwm2: number, pRichtung2: eDirection) {
            if (this.between(pwm1, 0, 255) && this.between(pwm2, 0, 255))
                this.i2cWriteBuffer(Buffer.fromArray([eRegister.SET_MOTOR, eMotor.beide, pRichtung1, pwm1, pRichtung2, pwm2]))
            else
                this.i2cWriteBuffer(Buffer.fromArray([eRegister.SET_MOTOR, eMotor.beide, 0, 0, 0, 0]))
        }

        // ========== group="Fernsteuerung Motor (0 .. 128 .. 255) fahren und lenken"

        //% group="Fernsteuerung (0 .. 128 .. 255) fahren und lenken" subcategory="Fernsteuerung"
        //% block="fahre mit Joystick %Calli2bot receivedNumber: %pUInt32LE" weight=6
        fahreJoystick(pUInt32LE: number) {
            let joyBuffer32 = Buffer.create(4)
            joyBuffer32.setNumber(NumberFormat.UInt32LE, 0, pUInt32LE)

            // Buffer[0] Register 3: Horizontal MSB 8 Bit (0 .. 128 .. 255)
            let joyHorizontal = joyBuffer32.getUint8(0)
            if (0x7C < joyHorizontal && joyHorizontal < 0x83) joyHorizontal = 0x80 // off at the outputs

            // Buffer[1] Register 5: Vertical MSB 8 Bit (0 .. 128 .. 255)
            let joyVertical = joyBuffer32.getUint8(1)
            if (0x7C < joyVertical && joyVertical < 0x83) joyVertical = 0x80 // off at the outputs

            // Buffer[2] Register 7: Current Button Position (0:gedrückt)
            // joyBuffer32.getUint8(2) wird nicht ausgewertet

            // Buffer[3] Register 8: Button STATUS (1:war gedrückt)
            //let joyButton = joyBuffer32.getUint8(3) == 0 ? false : true
            // Motor Power ON ...
            if (joyBuffer32.getUint8(3) == 1)
                this.motorPower = true // Motor Power ON
            else if (this.motorPower)
                this.i2cRESET_OUTPUTS() // this.motorPower = false

            // fahren
            let fahren_minus255_0_255: number //= this.change(joyHorizontal) // (0.. 128.. 255) -> (-255 .. 0 .. +255)
            let signed_128_0_127 = this.sign(joyHorizontal)
            if (signed_128_0_127 < 0)
                fahren_minus255_0_255 = 2 * (128 + signed_128_0_127) // (u) 128 .. 255 -> (s) -128 .. -1  ->   0 .. 127
            else
                fahren_minus255_0_255 = -2 * (127 - signed_128_0_127) // (u)   0 .. 127 -> (s)    0 .. 127 -> 127 ..   0

            // minus ist rückwärts
            let fahren_Richtung: eDirection = (fahren_minus255_0_255 < 0 ? eDirection.r : eDirection.v)

            let fahren_0_255 = Math.abs(fahren_minus255_0_255)
            let fahren_links = fahren_0_255
            let fahren_rechts = fahren_0_255

            // lenken
            let lenken_255_0_255 = this.sign(joyVertical)
            let lenken_100_50 = Math.round(Math.map(Math.abs(lenken_255_0_255), 0, 128, 50, 100))

            // lenken Richtung
            if (lenken_255_0_255 < 0) // minus ist rechts
                fahren_rechts = Math.round(fahren_rechts * lenken_100_50 / 100)
            else
                fahren_links = Math.round(fahren_links * lenken_100_50 / 100)

            if (this.motorPower)
                this.setMotoren(fahren_links, fahren_Richtung, fahren_rechts, fahren_Richtung)

            this.log = ["", ""]
            this.log[0] = this.format(joyHorizontal, 4, true)
                + this.format(fahren_minus255_0_255, 4, true)
                + this.format(fahren_links, 4, true)
                + this.format(fahren_rechts, 4, true)
            this.log[1] = this.format(joyVertical, 4, true)
                + this.format(lenken_255_0_255, 4, true)
                + this.format(lenken_100_50, 4, true)
                + " " + this.format(fahren_Richtung, 1)
                + " " + this.format(this.motorPower, 1)

        }

        //% group="Fernsteuerung (0 .. 128 .. 255) fahren und lenken" subcategory="Fernsteuerung"
        //% block="%Calli2bot Protokoll lesen [fahren,lenken]" weight=2
        getLog(): string[] { return this.log }



        // ========== advanced=true

        // ========== group="i2c Register lesen" advanced=true

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


        // ========== group="i2c Register schreiben"

        //% group="i2c Register schreiben" advanced=true
        //% block="%Calli2bot writeRegister %pRegister Bytes %bytes" weight=1
        i2cWriteRegister(pRegister: eRegister, bytes: number[]) {
            bytes.insertAt(0, pRegister)
            this.i2cWriteBuffer(Buffer.fromArray(bytes))
        }


        // ========== group="i2c Fehlercode"

        //% group="i2c Fehlercode" advanced=true
        //% block="%Calli2bot i2c Fehlercode" weight=1
        geti2cError() { return this.i2cError }



        // ========== private

        private between(i0: number, i1: number, i2: number): boolean { return (i0 >= i1 && i0 <= i2) }

        private sign(i: number, e: number = 7): number {
            if (i < 2 ** e) return i
            else return -((~i & ((2 ** e) - 1)) + 1)
        }

        private format(pValue: any, pLength: number, pFormat: boolean = false) {
            let pText = convertToText(pValue)
            if (pText.length > pLength) { return pText.substr(0, pLength) }
            else if (pText.length < pLength && !pFormat) { return pText + this.replicate(" ", pLength - pText.length) }
            else if (pText.length < pLength && pFormat) { return this.replicate(" ", pLength - pText.length) + pText }
            else { return pText }
        }

        private replicate(pChar: string, pLength: number) {
            let s: string = ""
            if (pChar.length > 0 && pLength > 0)
                while (s.length < pLength)
                    s = s + pChar
            return s
        }

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

} // calli2bot.ts
