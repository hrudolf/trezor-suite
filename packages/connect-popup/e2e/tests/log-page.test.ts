import { test, Page, expect } from '@playwright/test';
import { TrezorUserEnvLink } from '@trezor/trezor-user-env-link';

const url = process.env.URL || 'http://localhost:8088/';
const bridgeVersion = '2.0.31';

test.beforeAll(async () => {
    await TrezorUserEnvLink.connect();
});

// popup window reference
let popup: Page;

test('log page should contain logs from shared worker', async ({ page }) => {
    await TrezorUserEnvLink.api.stopBridge();
    await TrezorUserEnvLink.api.stopEmu();
    await TrezorUserEnvLink.api.startEmu({
        wipe: true,
    });
    await TrezorUserEnvLink.api.setupEmu({
        mnemonic: 'alcohol woman abuse must during monitor noble actual mixed trade anger aisle',
        pin: '',
        passphrase_protection: false,
        label: 'My Trevor',
        needs_backup: false,
    });
    await TrezorUserEnvLink.api.startBridge(bridgeVersion);

    await page.goto(`${url}#/method/verifyMessage`);
    await page.waitForSelector("button[data-test='@submit-button']", { state: 'visible' });
    [popup] = await Promise.all([
        page.waitForEvent('popup'),
        page.click("button[data-test='@submit-button']"),
    ]);

    await popup.goto(`${url}log.html`);

    const selector = await popup.waitForSelector("div[data-test='@log-container']");
    const text = await selector.textContent();

    const contains = text && text.includes('Initializing transports');
    expect(contains).toBeTruthy();
});
