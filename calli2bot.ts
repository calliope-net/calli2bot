
namespace calli2bot {
    export class Calli2bot {
        private readonly qSimulator: boolean = ("€".charCodeAt(0) == 8364)
        private readonly i2cADDR: eADDR
        private readonly i2cCheck: boolean // i2c-Check
        private i2cError: number = 0 // Fehlercode vom letzten WriteBuffer (0 ist kein Fehler)
        private readonly qLogEnabled: boolean
        private qLog: string[] // Array muss bei Verwendung initialisiert werden
        private qLEDs = [0, 0, 0, 0, 0, 0, 0, 0, 0] // LED Wert in Register 0x03 merken zum blinken

        private qStopandGoMotoran: boolean = false // für seite4StopandGo()
        private qFernsteuerungPower: boolean = false // für Fernsteuerung
        private qFernsteuerungStop: boolean = false   // für Fernsteuerung
        // interner Speicher für Sensoren
        private input_Digital: number
        private input_Ultraschallsensor: number
        private input_Spursensoren: number[]

        constructor(pADDR: eADDR, ck: boolean, pLogEnabled: boolean) {
            //basic.showNumber("€".charCodeAt(0))
            //this.qSimulator = ("€".charCodeAt(0) == 8364)
            if (this.qSimulator)
                this.i2cCheck = false // Simulator
            else {
                this.i2cADDR = pADDR
                this.i2cCheck = ck
                this.i2cError = 0 // Reset Fehlercode
                this.qLogEnabled = pLogEnabled

                this.i2cRESET_OUTPUTS()
            }
        }


        // ========== group="Motor (-100% .. 0 .. +100%)"

        //% group="Motor (-100% .. 0 .. +100%)"
        //% block="Motoren %Calli2bot links mit %pwm1 \\% rechts mit %pwm2 \\%" weight=8
        //% pwm1.shadow="speedPicker" pwm1.defl=0
        //% pwm2.shadow="speedPicker" pwm2.defl=0
        setMotoren2(pwm1: number, pwm2: number) {
            if (this.qLogEnabled) this.qLog = [pwm1 + " " + pwm2, ""] // init Array 2 Elemente
            let pRichtung1 = (pwm1 < 0 ? eDirection.r : eDirection.v)
            let pRichtung2 = (pwm2 < 0 ? eDirection.r : eDirection.v)
            pwm1 = Math.trunc(Math.abs(pwm1) * 255 / 100)
            pwm2 = Math.trunc(Math.abs(pwm2) * 255 / 100)

            if (this.qLogEnabled) this.qLog[1] = pwm1 + " " + pwm2

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

            if (!between(pwm, 0, 255)) { // falscher Parameter -> beide Stop
                pMotor = eMotor.beide
                pwm = 0
            }

            if (pMotor == eMotor.beide)
                this.i2cWriteBuffer(Buffer.fromArray([eRegister.SET_MOTOR, pMotor, pRichtung, pwm, pRichtung, pwm]))
            else
                this.i2cWriteBuffer(Buffer.fromArray([eRegister.SET_MOTOR, pMotor, pRichtung, pwm]))
        }



        // ========== group="LED"



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
        }

        // blinken
        setRgbLed31(pRgbLed: eRgbLed, buffer: Buffer, blink: boolean) {
            if (blink && this.qLEDs[pRgbLed] == buffer.getNumber(NumberFormat.UInt32BE, 1))
                buffer.setNumber(NumberFormat.UInt32BE, 1, 0) // alle Farben aus
            this.qLEDs[pRgbLed] = buffer.getNumber(NumberFormat.UInt32BE, 1)
            buffer[1] = pRgbLed // Led-Index 1,2,3,4 für RGB
            this.i2cWriteBuffer(buffer)
            basic.pause(10) // ms
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
                    basic.pause(10) // ms
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

        //% group="LED"
        //% block="LED %Calli2bot %led %onoff || blinken %blink Helligkeit %pwm" weight=2
        //% onoff.shadow="toggleOnOff"
        //% blink.shadow="toggleYesNo"
        //% pwm.min=1 pwm.max=16 pwm.defl=16
        //% inlineInputMode=inline 
        setLed1(pLed: eLed, on: boolean, blink = false, pwm?: number) {
            if (!on)
                pwm = 0 // LED aus schalten
            else if (!between(pwm, 0, 16))
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



        // ========== group="Reset"

        //% group="Reset"
        //% block="alles aus %Calli2bot Motor, LEDs, Servo"
        i2cRESET_OUTPUTS() {
            this.i2cWriteBuffer(Buffer.fromArray([eRegister.RESET_OUTPUTS]))
            this.qFernsteuerungPower = false
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
        bitINPUTS(pINPUTS: eINPUTS): boolean {
            switch (pINPUTS) {
                case eINPUTS.sp0: return (this.input_Digital & 0b00000011) == 0
                case eINPUTS.sp1r: return (this.input_Digital & 0b00000011) == 1
                case eINPUTS.sp2l: return (this.input_Digital & 0b00000011) == 2
                case eINPUTS.sp3b: return (this.input_Digital & 0b00000011) == 3
                case eINPUTS.sp4e: return this.bitINPUTS(eINPUTS.sp1r) || this.bitINPUTS(eINPUTS.sp2l) || this.bitINPUTS(eINPUTS.sp3b)
                case eINPUTS.st0: return (this.input_Digital & 0b00001100) == 0b00000000
                case eINPUTS.st1r: return (this.input_Digital & 0b00001100) == 0b00000100
                case eINPUTS.st2l: return (this.input_Digital & 0b00001100) == 0b00001000
                case eINPUTS.st3b: return (this.input_Digital & 0b00001100) == 0b00001100
                case eINPUTS.st4e: return this.bitINPUTS(eINPUTS.st1r) || this.bitINPUTS(eINPUTS.st2l) || this.bitINPUTS(eINPUTS.st3b)
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
        //% block="%Calli2bot Entfernung %pVergleich %cm cm" weight=2
        //% cm.min=1 cm.max=50 cm.defl=15
        bitINPUT_US(pVergleich: eVergleich, cm: number) {
            switch (pVergleich) {
                case eVergleich.gt: return this.input_Ultraschallsensor / 10 > cm
                case eVergleich.lt: return this.input_Ultraschallsensor / 10 < cm
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
            if (between(pwm1, 0, 255) && between(pwm2, 0, 255))
                this.i2cWriteBuffer(Buffer.fromArray([eRegister.SET_MOTOR, eMotor.beide, pRichtung1, pwm1, pRichtung2, pwm2]))
            else // falscher Parameter -> beide Stop
                this.i2cWriteBuffer(Buffer.fromArray([eRegister.SET_MOTOR, eMotor.beide, 0, 0, 0, 0]))
        }

        // ========== group="Fernsteuerung Motor (0 .. 128 .. 255) fahren und lenken"

        //% group="Fernsteuerung (0 .. 128 .. 255) fahren und lenken" subcategory="Fernsteuerung"
        //% block="fahre mit Joystick %Calli2bot receivedNumber: %pUInt32LE || blinken %blink Stoßstange %stStange Entfernung %cm cm" weight=6
        //% blink.shadow="toggleYesNo" blink.defl=1
        //% stStange.shadow="toggleYesNo"
        //% cm.min=1 cm.max=50
        //% inlineInputMode=inline
        fahreJoystick(pUInt32LE: number, blink = true, stStange = false, cm?: number) {
            let blinkColor = 0x0000FF
            let joyBuffer32 = Buffer.create(4)
            joyBuffer32.setNumber(NumberFormat.UInt32LE, 0, pUInt32LE)

            // Buffer[0] Register 3: Horizontal MSB 8 Bit (0 .. 128 .. 255)
            let joyHorizontal = joyBuffer32.getUint8(0)
            if (0x7C < joyHorizontal && joyHorizontal < 0x83) joyHorizontal = 0x80 // off at the outputs

            // Buffer[1] Register 5: Vertical MSB 8 Bit (0 .. 128 .. 255)
            let joyVertical = joyBuffer32.getUint8(1)
            if (0x7C < joyVertical && joyVertical < 0x83) joyVertical = 0x80 // off at the outputs

            // Buffer[2] 
            let joyProzent = joyBuffer32.getUint8(2) // (0 .. 100)

            // Buffer[3] Register 8: Button STATUS (1:war gedrückt)
            //let joyButton = joyBuffer32.getUint8(3) == 0 ? false : true
            // Motor Power ON ...
            if (joyBuffer32.getUint8(3) == 1)
                this.qFernsteuerungPower = true // Motor Power ON
            else if (this.qFernsteuerungPower)
                this.i2cRESET_OUTPUTS() // this.motorPower = false

            // fahren
            let fahren_minus255_0_255: number //= this.change(joyHorizontal) // (0.. 128.. 255) -> (-255 .. 0 .. +255)
            let signed_128_0_127 = sign(joyHorizontal)
            if (signed_128_0_127 < 0)
                fahren_minus255_0_255 = 2 * (128 + signed_128_0_127) // (u) 128 .. 255 -> (s) -128 .. -1  ->   0 .. 127
            else
                fahren_minus255_0_255 = -2 * (127 - signed_128_0_127) // (u)   0 .. 127 -> (s)    0 .. 127 -> 127 ..   0

            // minus ist rückwärts
            let fahren_Richtung: eDirection = (fahren_minus255_0_255 < 0 ? eDirection.r : eDirection.v)

            let fahren_0_255 = Math.abs(fahren_minus255_0_255)

            if (fahren_Richtung == eDirection.r) {
                this.qFernsteuerungStop = false
            }
            // wenn Stoßstange r oder l, dann nicht vorwärts fahren
            else if (fahren_Richtung == eDirection.v && stStange) {
                if (!this.qFernsteuerungStop) this.i2cReadINPUTS() // i2c Sensoren nur lesen, wenn nicht Stop
                if (this.bitINPUTS(eINPUTS.st4e)) {
                    this.qFernsteuerungStop = true
                    fahren_0_255 = 0
                    blinkColor = 0xFFFF00
                }
            }

            // wenn Entfernung angegeben und kleiner, dann nicht vorwärts fahren
            else if (fahren_Richtung == eDirection.v && cm != undefined) {
                if (!this.qFernsteuerungStop) this.i2cReadINPUT_US() // i2c Sensoren nur lesen, wenn nicht Stop
                if (this.bitINPUT_US(eVergleich.lt, cm)) {
                    this.qFernsteuerungStop = true
                    fahren_0_255 = 0
                    blinkColor = 0xFF00FF
                }
            }


            // max Geschwindigkeit wenn Buffer[2] (10 .. 100)
            if (between(joyProzent, 1, 8)) {
                fahren_0_255 *= (joyProzent + 1) / 10 // (0,2 .. 0,9)
            }

            let fahren_links = fahren_0_255
            let fahren_rechts = fahren_0_255

            // max Geschwindigkeit wenn Buffer[2] (10 .. 100)
            //if (between(joyProzent, 10, 100)) {
            //    fahren_links *= joyProzent / 100 // (0,1 .. 1,0)
            //    fahren_rechts *= joyProzent / 100 // (0,1 .. 1,0)
            //}

            // lenken
            let lenken_255_0_255 = sign(joyVertical)
            let lenken_100_50 = Math.round(Math.map(Math.abs(lenken_255_0_255), 0, 128, 50, 100))

            // lenken Richtung
            if (lenken_255_0_255 < 0) // minus ist rechts
                fahren_rechts = Math.round(fahren_rechts * lenken_100_50 / 100)
            else
                fahren_links = Math.round(fahren_links * lenken_100_50 / 100)

            if (this.qFernsteuerungPower)
                this.setMotoren(fahren_links, fahren_Richtung, fahren_rechts, fahren_Richtung)

            if (blink) {
                this.setRgbLed3(blinkColor, true, true, true, true, true)
            }

            if (this.qLogEnabled) {
                this.qLog = ["", ""] // init Array 2 Elemente
                this.qLog[0] = format4r(joyHorizontal)
                    + format4r(fahren_minus255_0_255)
                    + format4r(fahren_links)
                    + format4r(fahren_rechts)
                this.qLog[1] = format4r(joyVertical)
                    + format4r(lenken_255_0_255)
                    + format4r(lenken_100_50)
                    + " " + fahren_Richtung.toString().substr(0, 1)
                    + " " + this.qFernsteuerungPower.toString().substr(0, 1)
                //+ " " + format(fahren_Richtung, 1)
                //+ " " + format(this.motorPower, 1)
            }

        }

        //% group="Fernsteuerung (0 .. 128 .. 255) fahren und lenken" subcategory="Fernsteuerung"
        //% block="%Calli2bot Protokoll lesen [fahren,lenken]" weight=2 deprecated=true
        getLog(): string[] { return this.qLog }


        //% group="Protokoll lesen [fahren,lenken]" subcategory="Fernsteuerung"
        //% block="%Calli2bot Protokoll Zeile %1" weight=2
        //% index.min=0 index.max=1
        getLog2(index: number): string {
            if (this.qLog != undefined && index < this.qLog.length && index >= 0)
                return this.qLog.get(index)
            else
                return index.toString()
        }



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




        // ========== subcategory=Beispiele

        // ========== group="2 fahren und drehen" subcategory=Beispiele ⅒s • 

        //% group="2 fahren und drehen" subcategory=Beispiele
        //% block="Motoren %Calli2bot fahren %sf s • drehen %sd s • nach %rl" weight=8
        // sf.min=0 sf.max=10 sf.defl=5
        // sd.min=0 sd.max=10 sd.defl=2.5
        seite2Motor(sf: number, sd: number, rl: eRL) {
            this.setMotoren2(100, 100)

            pausesekunden(sf)
            if (rl == eRL.links) this.setMotoren2(-50, 50)
            else this.setMotoren2(50, -50)
            pausesekunden(sd)
            this.setMotoren2(0, 0)
        }


        // ========== group="4 Lautstärke, Stop and Go" subcategory=Beispiele


        private qLautMax = 0
        private qLautCount = 0

        //% group="4 Lautstärke, Stop and Go" subcategory=Beispiele
        //% block="(dauerhaft) %Calli2bot Lautstärke > %soundLevel" weight=5
        //% soundLevel.min=0 soundLevel.max=255 soundLevel.defl=30
        lautMessung(soundLevel: number) {
            let laut = input.soundLevel()
            if (laut > soundLevel) {
                this.qLautMax = laut
                this.qLautCount += 1
                pausesekunden(0.5) // 0,5 Sekunden nur nach Ereignis
            }
            if (this.qLogEnabled) {
                this.qLog = ["", ""] // init Array 2 Elemente
                this.qLog[0] = format4r(laut) + format4r(this.qLautMax)
                this.qLog[1] = format4r(soundLevel) + format4r(this.qLautCount)
            }
        }

        //% group="4 Lautstärke, Stop and Go" subcategory=Beispiele
        //% block="%Calli2bot es laut war" weight=4
        lautTest() {
            if (this.qLautCount > 0) {
                this.qLautMax = 0
                this.qLautCount = 0
                return true
            } else
                return false
        }

        //% group="4 Lautstärke, Stop and Go" subcategory=Beispiele
        //% block="Stop and Go %Calli2bot Motoren l %pwm1 \\% r %pwm2 \\% Lautstärke > %soundLevel" weight=2
        //% pwm1.shadow="speedPicker" pwm1.defl=80
        //% pwm2.shadow="speedPicker" pwm2.defl=80
        seite4StopandGo(pwm1: number, pwm2: number, soundLevel: number) {
            if (this.lautTest()) {
                this.qStopandGoMotoran = !(this.qStopandGoMotoran)
                // nur bei Änderung an i2c senden
                if (this.qStopandGoMotoran)
                    this.setMotoren2(pwm1, pwm2)
                else
                    this.setMotoren2(0, 0)
            }
            //let laut = input.soundLevel()
            /* if (!lautTest()) {
                if (this.qMotoran) {
                    this.setMotoren2(pwm1, pwm2)
                }
            } else {
                //lcd16x2rgb.writeText(lcd16x2rgb.lcd16x2_eADDR(lcd16x2rgb.eADDR_LCD.LCD_16x2_x3E), 0, 10, 14, laut, lcd16x2rgb.eAlign.right)
                this.qMotoran = !(this.qMotoran)
                this.setMotoren2(0, 0)
            } */
            if (this.qLogEnabled) this.qLog = [this.qStopandGoMotoran.toString()] // init Array

        }

        // ========== 

        //% group="9 Linienfolger" subcategory=Beispiele
        //% block="Linienfolger %Calli2bot fahren %pwm1 \\% • drehen %pwm2 \\% • stop %stop cm" weight=2
        //% pwm1.shadow="speedPicker" pwm1.defl=100
        //% pwm2.shadow="speedPicker" pwm2.defl=50
        //% stop.min=0 stop.max=50 stop.defl=10
        seite9Linienfolger(pwm1: number, pwm2: number, stop: number) {
            this.i2cReadINPUT_US()
            if (this.bitINPUT_US(eVergleich.lt, stop)) {
                this.setMotoren2(0, 0)
                return false
            } else {
                this.i2cReadINPUTS()
                if (this.bitINPUTS(calli2bot.eINPUTS.sp0)) {
                    this.setMotoren2(pwm1, pwm1) // dunkel,dunkel
                    this.setLed1(eLed.redb, false) // beide rote LED aus
                } else if (this.bitINPUTS(calli2bot.eINPUTS.sp1r)) {
                    this.setMotoren2(0, pwm2)
                    this.setLed1(eLed.redl, true)
                    this.setLed1(eLed.redr, false)
                } else {
                    this.setMotoren2(pwm2, 0)
                    this.setLed1(eLed.redl, false)
                    this.setLed1(eLed.redr, true)
                }
                return true
            }
        }



        // ========== private

        private i2cWriteBuffer(buf: Buffer) { // repeat funktioniert nicht
            if (this.i2cError == 0) { // vorher kein Fehler
                this.i2cError = pins.i2cWriteBuffer(this.i2cADDR, buf)
                // NaN im Simulator
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
