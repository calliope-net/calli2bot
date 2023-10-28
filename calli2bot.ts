
namespace calli2bot {
    export class Calli2bot {
        private readonly i2cADDR: eADDR
        private in_Digital: number

        constructor(pADDR: eADDR) {
            this.i2cADDR = pADDR
        }


        //% group="INPUT digital 6 Bit"
        //% block="neu einlesen %Calli2bot Digitaleingänge" weight=6
        i2cReadINPUTS() {
            i2cWriteBuffer(eADDR.CB2_x22, Buffer.fromArray([eRegister.GET_INPUTS]), true)
            this.in_Digital = i2cReadBuffer(eADDR.CB2_x22, 1).getUint8(0)
        }

        //% group="INPUT digital 6 Bit"
        //% block="%Calli2bot %pINPUTS" weight=4
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

        //% group="INPUT digital 6 Bit"
        //% block="%Calli2bot Digitaleingänge" weight=2
        getINPUTS() { return this.in_Digital }
    }

    }

