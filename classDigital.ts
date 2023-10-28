
namespace calli2bot {
/* 
    export class Digital {
        private bits: number
        private readonly iADDR: calli2bot.eADDR

        constructor(pADDR: eADDR) {
            this.iADDR = pADDR
        }

        //% group="INPUT digital 6 Bit"
        //% block="neu einlesen %in_Digital Digitaleingänge" weight=6
        readINPUTS() {
            i2cWriteBuffer(eADDR.CB2_x22, Buffer.fromArray([eRegister.GET_INPUTS]), true)
            this.bits = i2cReadBuffer(eADDR.CB2_x22, 1).getUint8(0)
        }

        //% group="INPUT digital 6 Bit"
        //% block="%in_Digital %pINPUTS" weight=4
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

        //% group="INPUT digital 6 Bit"
        //% block="%in_Digital GET_INPUTS" weight=2
        getINPUTS() { return this.bits }
    } */
}