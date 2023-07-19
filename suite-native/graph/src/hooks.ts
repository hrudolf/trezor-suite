import { useEffect, useMemo, useRef } from 'react';
import { useSelector } from 'react-redux';

import { useAtom } from 'jotai';

import {
    AccountItem,
    CommonUseGraphParams,
    useGetTimeFrameForHistoryHours,
    useGraphForAccounts,
} from '@suite-common/graph';
import { selectAccountByKey, selectMainnetAccounts } from '@suite-common/wallet-core';
import { AccountKey } from '@suite-common/wallet-types';
import { analytics, EventType } from '@suite-native/analytics';
import { NetworkSymbol } from '@suite-common/wallet-config';
import { atomWithUnecryptedStorage } from '@suite-native/storage';

import { timeSwitchItems } from './components/TimeSwitch';

type TimeframeHoursValue = number | null;

// Default is 720 hours (1 month).
const DEFAULT_GRAPH_TIMEFRAME = 720;

const portfolioGraphTimeframeAtom = atomWithUnecryptedStorage<TimeframeHoursValue>(
    'portfolioGraphTimeframe',
    DEFAULT_GRAPH_TIMEFRAME,
);

const accountToGraphTimeframeMapAtom = atomWithUnecryptedStorage<
    Record<AccountKey, TimeframeHoursValue>
>('accountToGraphTimeframeMap', {});

const useWatchTimeframeChangeForAnalytics = (
    timeframe: TimeframeHoursValue,
    networkSymbol?: NetworkSymbol,
) => {
    const isFirstRender = useRef(true);

    useEffect(() => {
        if (isFirstRender.current) {
            // Do not report default value on first render.
            isFirstRender.current = false;
            return;
        }

        const timeframeLabel = timeSwitchItems.find(
            item => item.valueBackInHours === timeframe,
        )?.label;

        if (timeframeLabel) {
            if (networkSymbol) {
                // TODO: Report tokenSymbol if displaying ERC20 token account graph.
                // related to issue: https://github.com/trezor/trezor-suite/issues/7839
                analytics.report({
                    type: EventType.AssetDetailTimeframeChange,
                    payload: { timeframe: timeframeLabel, assetSymbol: networkSymbol },
                });
            } else {
                analytics.report({
                    type: EventType.WatchPortfolioTimeframeChange,
                    payload: { timeframe: timeframeLabel },
                });
            }
        }
    }, [timeframe, networkSymbol, isFirstRender]);
};

export const useGraphForSingleAccount = ({
    accountKey,
    fiatCurrency,
}: CommonUseGraphParams & { accountKey: AccountKey }) => {
    const account = useSelector((state: any) => selectAccountByKey(state, accountKey));
    const [accountToGraphTimeframeMap, setAccountToGraphTimeframeMap] = useAtom(
        accountToGraphTimeframeMapAtom,
    );

    const timeframe =
        accountKey in accountToGraphTimeframeMap
            ? accountToGraphTimeframeMap[accountKey]
            : DEFAULT_GRAPH_TIMEFRAME;

    // Save selected timeframe to the persistent storage.
    const handleSelectTimeFrame = (newValue: TimeframeHoursValue) =>
        setAccountToGraphTimeframeMap(prevValue => ({
            ...prevValue,
            [accountKey]: newValue,
        }));

    const { startOfTimeFrameDate, endOfTimeFrameDate } = useGetTimeFrameForHistoryHours(timeframe);

    const accounts = useMemo(() => {
        if (!account) return [];
        return [
            {
                coin: account.symbol,
                descriptor: account.descriptor,
            },
        ] as AccountItem[];
    }, [account]);

    useWatchTimeframeChangeForAnalytics(timeframe, account?.symbol);

    return {
        ...useGraphForAccounts({
            accounts,
            fiatCurrency,
            startOfTimeFrameDate,
            endOfTimeFrameDate,
            isPortfolioGraph: false,
        }),
        timeframe,
        onSelectTimeFrame: handleSelectTimeFrame,
    };
};

export const useGraphForAllAccounts = ({ fiatCurrency }: CommonUseGraphParams) => {
    const accounts = useSelector(selectMainnetAccounts);
    const [portfolioGraphTimeframe, setPortfolioGraphTimeframe] = useAtom(
        portfolioGraphTimeframeAtom,
    );
    const { startOfTimeFrameDate, endOfTimeFrameDate } =
        useGetTimeFrameForHistoryHours(portfolioGraphTimeframe);

    const accountItems = useMemo(
        () =>
            accounts.map(account => ({
                coin: account.symbol,
                descriptor: account.descriptor,
            })),
        [accounts],
    );

    useWatchTimeframeChangeForAnalytics(portfolioGraphTimeframe);

    return {
        ...useGraphForAccounts({
            accounts: accountItems,
            fiatCurrency,
            startOfTimeFrameDate,
            endOfTimeFrameDate,
            isPortfolioGraph: true,
        }),
        timeframe: portfolioGraphTimeframe,
        onSelectTimeFrame: setPortfolioGraphTimeframe,
    };
};
