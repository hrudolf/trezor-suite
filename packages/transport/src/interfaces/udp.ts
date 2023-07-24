import UDP from 'dgram';

import { AbstractInterface } from './abstract';
import { AsyncResultWithTypedError, ResultWithTypedError } from '../types';

import * as ERRORS from '../errors';

type ConstructorParams = ConstructorParameters<typeof AbstractInterface>[0];

export class UdpInterface extends AbstractInterface {
    interface = UDP.createSocket('udp4');
    protected communicating = false;

    constructor({ logger }: ConstructorParams) {
        super({ logger });
    }

    public async write(path: string, buffer: Buffer) {
        const [hostname, port] = path.split(':');
        console.log('== write start');

        const p = new Promise<
            ResultWithTypedError<
                undefined,
                typeof ERRORS.INTERFACE_DATA_TRANSFER | typeof ERRORS.UNEXPECTED_ERROR
            >
        >(resolve => {
            this.interface.send(buffer, Number.parseInt(port, 10), hostname, err => {
                if (err) {
                    console.log('send error', err);
                    return resolve(
                        this.error({
                            error: ERRORS.INTERFACE_DATA_TRANSFER,
                            message: err.message,
                        }),
                    );
                }
                return resolve(this.success(undefined));
            });
        });
        await p;
        console.log('== write end');
        return p;
    }

    public async read(
        _path: string,
    ): AsyncResultWithTypedError<
        ArrayBuffer,
        | typeof ERRORS.DEVICE_NOT_FOUND
        | typeof ERRORS.INTERFACE_UNABLE_TO_OPEN_DEVICE
        | typeof ERRORS.INTERFACE_DATA_TRANSFER
        | typeof ERRORS.DEVICE_DISCONNECTED_DURING_ACTION
        | typeof ERRORS.UNEXPECTED_ERROR
        | typeof ERRORS.ABORTED_BY_TIMEOUT
    > {
        this.communicating = true;

        console.log('== read start');

        const p = new Promise<
            ResultWithTypedError<
                ArrayBuffer,
                typeof ERRORS.INTERFACE_DATA_TRANSFER | typeof ERRORS.ABORTED_BY_TIMEOUT
            >
        >(resolve => {
            const onError = (err: Error) => {
                resolve(
                    this.error({
                        error: ERRORS.INTERFACE_DATA_TRANSFER,
                        message: err.message,
                    }),
                );
                this.interface.removeListener('error', onError);
                // eslint-disable-next-line @typescript-eslint/no-use-before-define
                this.interface.removeListener('message', onMessage);
            };
            const onMessage = (message: Buffer, _info: UDP.RemoteInfo) => {
                if (message.toString() === 'PONGPONG') {
                    return;
                }
                // clearTimeout(timeout);
                this.interface.removeListener('error', onError);
                this.interface.removeListener('message', onMessage);
                resolve(this.success(message));
            };
            this.interface.addListener('error', onError);
            this.interface.addListener('message', onMessage);
        });
        await p;
        console.log('== read done');
        this.communicating = false;

        return p;
    }

    private async ping(path: string) {
        await this.write(path, Buffer.from('PINGPING'));

        const pinged = new Promise<boolean>(resolve => {
            const onMessage = (message: Buffer, info: UDP.RemoteInfo) => {
                console.log('on message', info, message.toString());
                if (message.toString() === 'PONGPONG') {
                    resolve(true);
                    this.interface.removeListener('message', onMessage);
                    // eslint-disable-next-line @typescript-eslint/no-use-before-define
                    clearTimeout(timeout);
                }
            };
            this.interface.addListener('message', onMessage);

            const timeout = setTimeout(
                () => {
                    this.interface.removeListener('message', onMessage);
                    resolve(false);
                },
                this.communicating ? 10000 : 500,
            );
        });

        return pinged;
    }

    public async enumerate() {
        // in theory we could support multiple devices, but we don't yet
        const paths = ['127.0.0.1:21324'];

        const enumerateResult = await Promise.all(
            paths.map(path =>
                this.ping(path).then(pinged => {
                    if (pinged) {
                        return path;
                    }
                    return false;
                }),
            ),
        ).then((res): string[] =>
            // @ts-expect-error typescript is not smart enough to understand that we filtered out all false values
            res.filter(res => typeof res === 'string'),
        );

        return this.success(enumerateResult);
    }

    public openDevice(_path: string, _first: boolean) {
        // todo: maybe ping?
        return Promise.resolve(this.success(undefined));
    }

    public closeDevice(_path: string) {
        return Promise.resolve(this.success(undefined));
    }
}
