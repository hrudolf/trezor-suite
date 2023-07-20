/* eslint-disable no-console */
import React, { useEffect, useState } from 'react';

// eslint-disable-next-line import/no-extraneous-dependencies
import TrezorConnect from '@trezor/connect-web';

export const ConnectManager = () => {
    const [response, setResponse] = useState('');

    const getPublicKey = () => {
        TrezorConnect.getPublicKey({
            path: "m/49'/0'/0'",
            coin: 'btc',
        }).then((response: any) => {
            console.log(response);
            setResponse(JSON.stringify(response));
        });
    };
    const getFeatures = () => {
        TrezorConnect.getFeatures().then(response => {
            console.log(response);
            setResponse(JSON.stringify(response));
        });
    };

    const getAddress = () => {
        TrezorConnect.getAddress({
            showOnTrezor: true,
            path: "m/49'/0'/0'/0/0",
            coin: 'btc',
        }).then(response => {
            console.info(response);
            setResponse(JSON.stringify(response));
        });
    };

    useEffect(() => {
        TrezorConnect.on('DEVICE_EVENT', (event: any) => {
            console.log(event);
        });

        // Initialize TrezorConnect
        TrezorConnect.init({
            debug: false, // see whats going on inside iframe
            lazyLoad: true, // set to "false" (default) if you want to start communication with bridge on application start (and detect connected device right away)
            // set it to "true", then @trezor/connect will not be initialized until you call some TrezorConnect.method()
            // this is useful when you don't know if you are dealing with Trezor user
            manifest: {
                email: 'email@developer.com',
                appUrl: 'electron-app-boilerplate',
            },
            transports: ['BridgeTransport'],
        })
            .then(() => {
                console.log('TrezorConnect is ready!');
            })
            .catch((error: Error) => {
                console.log(`TrezorConnect init error: ${error}`);
            });
    }, []);

    return (
        <div>
            <button type="button" onClick={getPublicKey}>
                Get Public Key
            </button>
            <button type="button" data-test="get-features" onClick={getFeatures}>
                Get Features
            </button>
            <button type="button" data-test="get-address" onClick={getAddress}>
                Get Address
            </button>

            <div id="result">{response}</div>
        </div>
    );
};
