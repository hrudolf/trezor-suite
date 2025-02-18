import React from 'react';
import { WalletLayout } from 'src/components/wallet';
import { useCardanoStaking } from 'src/hooks/wallet/useCardanoStaking';
import { CardanoRewards } from './CardanoRewards';
import { CardanoStake } from './CardanoStake';
import { CardanoRedelegate } from './CardanoRedelegate';
import type { SelectedAccountLoaded } from '@suite-common/wallet-types';

interface CardanoStakingDashboardProps {
    selectedAccount: SelectedAccountLoaded;
}

export const CardanoStakingDashboard = ({ selectedAccount }: CardanoStakingDashboardProps) => {
    const { isActive, isStakingOnTrezorPool, isCurrentPoolOversaturated } = useCardanoStaking();

    return (
        <WalletLayout title="TR_NAV_STAKING" account={selectedAccount} showEmptyHeaderPlaceholder>
            <>
                {isActive && <CardanoRewards account={selectedAccount.account} />}
                {!isActive && <CardanoStake account={selectedAccount.account} />}
                {isActive && (isStakingOnTrezorPool === false || isCurrentPoolOversaturated) && (
                    <CardanoRedelegate />
                )}
            </>
        </WalletLayout>
    );
};
