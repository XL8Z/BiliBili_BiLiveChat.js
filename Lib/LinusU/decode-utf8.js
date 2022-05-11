// {
//     "name": "decode-utf8",
//     "version": "1.0.1",
//     "license": "MIT",
//     "repository": "LinusU/decode-utf8",
//     "git-hub": "https://github.com/LinusU/decode-utf8"
//   }

function toUint8Array(input) {
    if (input instanceof Uint8Array) return input
    if (input instanceof ArrayBuffer) return new Uint8Array(input)

    throw new TypeError('Expected "input" to be an ArrayBuffer or Uint8Array')
}

function decodeUtf8(input) {
    const data = toUint8Array(input)
    const size = data.length

    let result = ''

    for (let index = 0; index < size; index++) {
        let byte1 = data[index]

        // US-ASCII
        if (byte1 < 0x80) {
            result += String.fromCodePoint(byte1)
            continue
        }

        // 2-byte UTF-8
        if ((byte1 & 0xE0) === 0xC0) {
            let byte2 = (data[++index] & 0x3F)
            result += String.fromCodePoint(((byte1 & 0x1F) << 6) | byte2)
            continue
        }

        if ((byte1 & 0xF0) === 0xE0) {
            let byte2 = (data[++index] & 0x3F)
            let byte3 = (data[++index] & 0x3F)
            result += String.fromCodePoint(((byte1 & 0x0F) << 12) | (byte2 << 6) | byte3)
            continue
        }

        if ((byte1 & 0xF8) === 0xF0) {
            let byte2 = (data[++index] & 0x3F)
            let byte3 = (data[++index] & 0x3F)
            let byte4 = (data[++index] & 0x3F)
            result += String.fromCodePoint(((byte1 & 0x07) << 0x12) | (byte2 << 0x0C) | (byte3 << 0x06) | byte4)
            continue
        }
    }

    return result
}