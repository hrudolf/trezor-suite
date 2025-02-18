import React from 'react';
import styled from 'styled-components';

import * as suiteActions from 'src/actions/suite/suiteActions';
import * as routerActions from 'src/actions/suite/routerActions';
import { Translation } from 'src/components/suite';
import { TextColumn } from 'src/components/suite/Settings';
import { SettingsAnchor } from 'src/constants/suite/anchors';
import { useActions, useDevice } from 'src/hooks/suite';
import { Button, Card } from '@trezor/components';

const StyledCard = styled(Card)`
    align-items: flex-start;
    border-left: 10px solid ${props => props.theme.TYPE_GREEN};
    box-shadow: 0 2px 5px 0 ${props => props.theme.BOX_SHADOW_BLACK_20};
    flex-direction: row;
    justify-content: space-between;
`;

const StyledButton = styled(Button)`
    display: inline;
`;

export const FirmwareTypeSuggestion = () => {
    const { goto, setFlag } = useActions({
        goto: routerActions.goto,
        setFlag: suiteActions.setFlag,
    });
    const { device } = useDevice();

    const bitcoinOnlyFirmware = device?.firmwareType === 'bitcoin-only';
    const translationId = bitcoinOnlyFirmware
        ? 'TR_SETTINGS_COINS_UNIVERSAL_FIRMWARE_SUGGESTION'
        : 'TR_SETTINGS_COINS_BITCOIN_FIRMWARE_SUGGESTION';

    const handleClose = () => setFlag('firmwareTypeBannerClosed', true);
    const goToFirmwareType = () =>
        goto('settings-device', {
            anchor: SettingsAnchor.FirmwareType,
        });

    return (
        <StyledCard>
            <TextColumn
                description={
                    <Translation
                        id={translationId}
                        values={{
                            button: chunks => (
                                <StyledButton variant="tertiary" onClick={goToFirmwareType}>
                                    {chunks}
                                </StyledButton>
                            ),
                        }}
                    />
                }
            />
            <Button variant="tertiary" onClick={handleClose}>
                <Translation id="TR_GOT_IT" />
            </Button>
        </StyledCard>
    );
};
