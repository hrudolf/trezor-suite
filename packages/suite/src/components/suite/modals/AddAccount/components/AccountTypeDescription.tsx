import React from 'react';
import styled from 'styled-components';
import { P } from '@trezor/components';
import { Network } from 'src/types/wallet';
import { Translation, TrezorLink } from 'src/components/suite';
import { getAccountTypeDesc, getAccountTypeUrl } from '@suite-common/wallet-utils';

const Info = styled(P).attrs(() => ({
    size: 'small',
    textAlign: 'left',
}))`
    color: ${props => props.theme.TYPE_LIGHT_GREY};
    margin: 20px 0;
`;

interface AccountTypeDescriptionProps {
    bip43Path: Network['bip43Path'];
    hasMultipleAccountTypes: boolean;
}

export const AccountTypeDescription = ({
    bip43Path,
    hasMultipleAccountTypes,
}: AccountTypeDescriptionProps) => {
    if (!hasMultipleAccountTypes) return null;
    const accountTypeUrl = getAccountTypeUrl(bip43Path);
    const accountTypeDesc = getAccountTypeDesc(bip43Path);

    return (
        <Info>
            <Translation id={accountTypeDesc} />
            {accountTypeUrl && (
                <>
                    {' '}
                    <TrezorLink icon="EXTERNAL_LINK" href={accountTypeUrl} size="small">
                        <Translation id="TR_LEARN_MORE" />
                    </TrezorLink>
                </>
            )}
        </Info>
    );
};
