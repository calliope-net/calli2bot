
namespace calli2bot {
    export class Calli2bot {
        private readonly i2cADDR: eADDR
        private in_Digital: number
        private in_Ultraschallsensor: number
        private in_Spursensoren: number[]

        constructor(pADDR: eADDR) { this.i2cADDR = pADDR }

        // ========== group="INPUT digital 6 Bit"

        //% group="INPUT digital 6 Bit"
        //% block="neu einlesen %Calli2bot Digitaleingänge" weight=6
        i2cReadINPUTS() {
            i2cWriteBuffer(eADDR.CB2_x22, Buffer.fromArray([eRegister.GET_INPUTS]), true)
            this.in_Digital = i2cReadBuffer(eADDR.CB2_x22, 1).getUint8(0)
        }

        //% group="INPUT digital 6 Bit" advanced=true
        //% block="%Calli2bot Digitaleingänge" weight=4
        getINPUTS() { return this.in_Digital }

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
            i2cWriteBuffer(eADDR.CB2_x22, Buffer.fromArray([eRegister.GET_INPUT_US]), true)
            this.in_Ultraschallsensor = i2cReadBuffer(eADDR.CB2_x22, 3).getNumber(NumberFormat.UInt16LE, 1)
        }

        //% group="INPUT Ultraschallsensor 16 Bit (mm)"
        //% block="%Calli2bot Ultraschallsensor" weight=4
        getINPUT_US() { return this.in_Digital }


        // ========== group="INPUT Spursensoren 2*16 Bit [r,l]"

        //% group="INPUT Spursensoren 2*16 Bit [r,l]"
        //% block="neu einlesen %Calli2bot Spursensoren" weight=6
        i2cReadLINE_SEN_VALUE() {
            i2cWriteBuffer(eADDR.CB2_x22, Buffer.fromArray([eRegister.GET_LINE_SEN_VALUE]), true)
            this.in_Spursensoren = i2cReadBuffer(eADDR.CB2_x22, 5).slice(1, 4).toArray(NumberFormat.UInt16LE)
        }

        //% group="INPUT Spursensoren 2*16 Bit [r,l]"
        //% block="%Calli2bot Spursensor %pRL" weight=4
        getLINE_SEN_VALUE(pRL: eRL) { return this.in_Spursensoren.get(pRL) }


        //% group="INPUT Spursensoren 2*16 Bit [r,l]"
        //% block="%Calli2bot %pRL %pVergleich %vergleich" weight=2
        //% inlineInputMode=inline
        bitLINE_SEN_VALUE(pRL: eRL, pVergleich: eVergleich, vergleich: number) {
            let sensor = this.in_Spursensoren.get(pRL)
            switch (pVergleich) {
                case eVergleich.gt: return sensor > vergleich
                case eVergleich.lt: return sensor < vergleich
                default: return false
            }
        }

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
    
    export enum eRL { rechts = 0, links = 1 }

    export enum eVergleich {
        //% block=">"
        gt,
        //% block="<"
        lt
    }

} // callibot2.ts
