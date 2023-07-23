import ByteBuffer from 'bytebuffer';

import {
    HEADER_SIZE,
    MESSAGE_HEADER_BYTE,
    BUFFER_SIZE,
    MESSAGE_MAGIC_HEADER_BYTE,
} from '../../constants';

type Options<Chunked> = {
    chunked: Chunked;
    addTrezorHeaders: boolean;
    messageType: number;
};

// this file is basically combination of "trezor v1 protocol" and "bridge protocol"
// there is actually no officially described bridge protocol, but in fact there is one
// it is because bridge does some parts of the protocol itself (like chunking)
function encode(data: ByteBuffer, options: Options<true>): Buffer[];
function encode(data: ByteBuffer, options: Options<false>): Buffer;
function encode(data: any, options: any): any {
    const { addTrezorHeaders, chunked, messageType } = options;
    const fullSize = (addTrezorHeaders ? HEADER_SIZE : HEADER_SIZE - 3) + data.limit;

    const encodedByteBuffer = new ByteBuffer(fullSize);

    if (addTrezorHeaders) {
        // 2*1 byte
        encodedByteBuffer.writeByte(MESSAGE_HEADER_BYTE);
        encodedByteBuffer.writeByte(MESSAGE_HEADER_BYTE);
    }

    // 2 bytes
    encodedByteBuffer.writeUint16(messageType);

    // 4 bytes (so 8 in total)
    encodedByteBuffer.writeUint32(data.limit);

    // then put in the actual message
    encodedByteBuffer.append(data.buffer);

    encodedByteBuffer.reset();

    if (!chunked) {
        const result = new ByteBuffer(encodedByteBuffer.limit);
        if (addTrezorHeaders) {
            result.writeByte(MESSAGE_MAGIC_HEADER_BYTE);
        }
        result.append(encodedByteBuffer);
        result.reset();
        return result;
    }

    const size = BUFFER_SIZE - 1;

    const chunkCount = Math.ceil(encodedByteBuffer.limit / size) || 1;

    // size with one reserved byte for header

    const result = [];
    // How many pieces will there actually be
    // slice and dice
    for (let i = 0; i < chunkCount; i++) {
        const start = i * size;
        const end = Math.min((i + 1) * size, encodedByteBuffer.limit);

        const buffer = new ByteBuffer(BUFFER_SIZE);

        buffer.writeByte(MESSAGE_MAGIC_HEADER_BYTE);

        const slice = encodedByteBuffer.slice(start, end);
        slice.compact();

        buffer.append(slice);
        result.push(buffer.buffer);
    }

    return result;
}

export { encode };
