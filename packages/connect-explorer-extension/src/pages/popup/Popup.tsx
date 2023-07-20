import React from 'react';

export const Popup = () => {
    const openManagerTab = () => {
        chrome.tabs.create({ url: 'connect-manager.html' });
    };

    const openExplorerTab = () => {
        chrome.tabs.create({ url: 'connect-explorer.html' });
    };

    return (
        <div className="App">
            <p>Welcome to Trezor Connect!</p>

            <button type="button" onClick={openManagerTab}>
                Open Connect Manager
            </button>
            <button type="button" onClick={openExplorerTab}>
                Open Connect Explorer
            </button>
        </div>
    );
};
