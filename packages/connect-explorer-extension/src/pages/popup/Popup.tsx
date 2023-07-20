import React from 'react';

export const Popup = () => {
    const openTab = () => {
        chrome.tabs.create({ url: 'connect-manager.html' });
    };

    return (
        <div className="App">
            <p>Welcome to Trezor Connect!</p>

            <button type="button" onClick={openTab}>
                Open Connect Manager
            </button>
        </div>
    );
};
