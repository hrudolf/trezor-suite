import React, { useEffect } from 'react';
import { formatNetworkAmount } from '@suite-common/wallet-utils';
import { Icon, Warning } from '@trezor/components';
import { Translation } from 'src/components/suite/Translation';
import { HiddenPlaceholder } from 'src/components/suite/HiddenPlaceholder';
import { useCardanoStaking, getReasonForDisabledAction } from 'src/hooks/wallet/useCardanoStaking';
import { CardanoActionPending } from './CardanoActionPending';
import { Account } from 'src/types/wallet';
import {
    Title,
    Row,
    Column,
    Actions,
    Heading,
    Value,
    Text,
    Content,
    StyledH1,
    StyledCard,
} from './CardanoPrimitives';
import { DeviceModel } from '@trezor/device-utils';
import { useDeviceModel } from 'src/hooks/suite/useDeviceModel';
import { DeviceButton } from 'src/components/suite';

interface CardanoStakeProps {
    account: Account;
}

export const CardanoStake = ({ account }: CardanoStakeProps) => {
    const {
        address,
        delegate,
        deposit,
        calculateFeeAndDeposit,
        fee,
        loading,
        delegatingAvailable,
        deviceAvailable,
        pendingStakeTx,
    } = useCardanoStaking();
    const deviceModel = useDeviceModel() as DeviceModel.TT | DeviceModel.T2B1; // only T and T2B1 have Capability_Cardano

    useEffect(() => {
        calculateFeeAndDeposit('delegate');
    }, [calculateFeeAndDeposit]);

    const reasonMessageId = getReasonForDisabledAction(delegatingAvailable?.reason);
    const isStakingDisabled =
        account.availableBalance === '0' ||
        !delegatingAvailable.status ||
        !deviceAvailable.status ||
        !!pendingStakeTx;

    return (
        <StyledCard>
            <StyledH1>
                <Icon icon="CROSS" size={25} />
                <Heading>
                    <Translation id="TR_STAKING_STAKE_TITLE" />
                </Heading>
            </StyledH1>
            <Text>
                <Translation id="TR_STAKING_STAKE_DESCRIPTION" values={{ br: <br /> }} />
            </Text>
            <Row>
                <Content>
                    <Column>
                        <Title>
                            <Translation id="TR_STAKING_STAKE_ADDRESS" />
                        </Title>
                        <HiddenPlaceholder>
                            <Value>{address}</Value>
                        </HiddenPlaceholder>
                    </Column>
                </Content>
            </Row>
            {delegatingAvailable.status && !pendingStakeTx ? (
                // delegation is allowed
                <>
                    <Row>
                        <Column>
                            <Title>
                                <Translation id="TR_STAKING_DEPOSIT" />
                            </Title>
                            <Value>
                                {formatNetworkAmount(deposit || '0', account.symbol)}{' '}
                                {account.symbol.toUpperCase()}
                            </Value>
                        </Column>
                    </Row>
                    <Row>
                        <Column>
                            <Title>
                                <Translation id="TR_STAKING_FEE" />
                            </Title>
                            <Value>
                                {formatNetworkAmount(fee || '0', account.symbol)}{' '}
                                {account.symbol.toUpperCase()}
                            </Value>
                        </Column>
                    </Row>
                </>
            ) : (
                // If building a transaction fails we don't have the information about used deposit and fee required
                <>
                    {!delegatingAvailable.status &&
                        delegatingAvailable.reason === 'UTXO_BALANCE_INSUFFICIENT' && (
                            <Row>
                                <Column>
                                    <Warning variant="info">
                                        <div>
                                            <Translation id="TR_STAKING_NOT_ENOUGH_FUNDS" />
                                            <br />
                                            <Translation
                                                id="TR_STAKING_DEPOSIT_FEE_DECRIPTION"
                                                values={{ feeAmount: 2 }}
                                            />
                                        </div>
                                    </Warning>
                                </Column>
                            </Row>
                        )}
                    {pendingStakeTx && (
                        <Row>
                            <CardanoActionPending />
                        </Row>
                    )}
                </>
            )}
            <Actions>
                <DeviceButton
                    isDisabled={isStakingDisabled}
                    isLoading={loading}
                    onClick={delegate}
                    deviceModel={deviceModel}
                    tooltipContent={
                        !reasonMessageId ||
                        (deviceAvailable.status && delegatingAvailable.status) ? undefined : (
                            <Translation id={reasonMessageId} />
                        )
                    }
                >
                    <Translation id="TR_STAKING_DELEGATE" />
                </DeviceButton>
            </Actions>
        </StyledCard>
    );
};
