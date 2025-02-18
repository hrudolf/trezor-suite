import React from 'react';
import styled from 'styled-components';

import GoogleClient from 'src/services/google';
import { ActionColumn, ActionSelect, SectionItem, TextColumn } from 'src/components/suite/Settings';
import * as suiteActions from 'src/actions/suite/suiteActions';
import { useSelector, useActions } from 'src/hooks/suite';
import type { OAuthServerEnvironment } from 'src/types/suite/metadata';
import { useAnchor } from 'src/hooks/suite/useAnchor';
import { SettingsAnchor } from 'src/constants/suite/anchors';

const StyledActionSelect = styled(ActionSelect)`
    min-width: 256px;
`;

export const OAuthApi = () => {
    const { setDebugMode } = useActions({
        setDebugMode: suiteActions.setDebugMode,
    });
    const { debug } = useSelector(state => ({
        debug: state.suite.settings.debug,
    }));
    const { anchorRef, shouldHighlight } = useAnchor(SettingsAnchor.OAuthApi);

    const options = Object.entries(GoogleClient.servers).map(([environment, server]) => ({
        label: server,
        value: environment,
    }));
    const selectedOption =
        options.find(option => option.value === debug.oauthServerEnvironment) || options[0];

    const handleChange = (item: { value: OAuthServerEnvironment }) => {
        setDebugMode({
            oauthServerEnvironment: item.value,
        });
        GoogleClient.setEnvironment(item.value);
    };

    return (
        <SectionItem
            data-test="@settings/debug/oauth-api"
            ref={anchorRef}
            shouldHighlight={shouldHighlight}
        >
            <TextColumn
                title="Google auth server"
                description="Set the authorisation server url for labeling in Google Drive"
            />
            <ActionColumn>
                <StyledActionSelect
                    onChange={handleChange}
                    value={selectedOption}
                    options={options}
                />
            </ActionColumn>
        </SectionItem>
    );
};
