import { useCallback, useEffect } from 'react';
import type {
    UseCoinmarketSavingsSetupWaitingProps,
    UseCoinmarketSavingsSetupWaitingValues,
} from 'src/types/wallet/coinmarketSavingsSetupWaiting';
import { useActions, useSelector } from 'src/hooks/suite';
import { useCoinmarketNavigation } from 'src/hooks/wallet/useCoinmarketNavigation';
import { useFormDraft } from 'src/hooks/wallet/useFormDraft';
import * as coinmarketCommonActions from 'src/actions/wallet/coinmarket/coinmarketCommonActions';
import * as coinmarketSavingsActions from 'src/actions/wallet/coinmarketSavingsActions';
import * as pollingActions from 'src/actions/wallet/pollingActions';
import {
    SavingsTradePollingIntervalMilliseconds,
    SavingsTradePollingMaxCount,
} from 'src/constants/wallet/coinmarket/savings';
import invityAPI, { SavingsTradeKYCFinalStatuses } from 'src/services/suite/invityAPI';
import { createReturnLink } from 'src/utils/wallet/coinmarket/savingsUtils';
import { isDesktop } from '@trezor/env-utils';

export const useCoinmarketSavingsSetupWaiting = ({
    selectedAccount,
}: UseCoinmarketSavingsSetupWaitingProps): UseCoinmarketSavingsSetupWaitingValues => {
    const { account } = selectedAccount;
    const { savingsTrade } = useSelector(state => ({
        savingsTrade: state.wallet.coinmarket.savings.savingsTrade,
    }));
    const { loadSavingsTrade, submitRequestForm, startPolling, stopPolling, isPolling } =
        useActions({
            loadSavingsTrade: coinmarketSavingsActions.loadSavingsTrade,
            submitRequestForm: coinmarketCommonActions.submitRequestForm,
            startPolling: pollingActions.startPolling,
            stopPolling: pollingActions.stopPolling,
            isPolling: pollingActions.isPolling,
        });

    const { navigateToSavingsSetup, navigateToSavingsSetupContinue } =
        useCoinmarketNavigation(account);

    const { getDraft, saveDraft } = useFormDraft('coinmarket-savings-setup-request');

    useEffect(() => {
        if (savingsTrade?.status === 'SetSavingsParameters') {
            navigateToSavingsSetup();
            return;
        }
        if (
            savingsTrade?.kycStatus &&
            SavingsTradeKYCFinalStatuses.includes(savingsTrade.kycStatus)
        ) {
            navigateToSavingsSetupContinue();
        }
    }, [
        navigateToSavingsSetup,
        navigateToSavingsSetupContinue,
        savingsTrade,
        savingsTrade?.kycStatus,
        savingsTrade?.status,
    ]);

    useEffect(() => {
        const pollingKey = `coinmarket-savings-trade/${account.descriptor}` as const;
        if (!isPolling(pollingKey)) {
            // NOTE: Suite Desktop and Web application might be still open -> start polling savings trade,
            // so the user sees refreshed UI after successful completion of savings flow on Invity.io page,
            // and show screen "Waiting for completion on Invity.io web page.".
            startPolling(
                pollingKey,
                () => loadSavingsTrade(),
                SavingsTradePollingIntervalMilliseconds,
                SavingsTradePollingMaxCount,
            );
        }
    }, [account.descriptor, isPolling, loadSavingsTrade, startPolling, stopPolling]);

    const handleGoToInvity = useCallback(async () => {
        const form = getDraft(account.descriptor) as Parameters<typeof submitRequestForm>[0];
        if (form) {
            submitRequestForm(form);
        } else if (
            savingsTrade?.fiatStringAmount &&
            savingsTrade.country &&
            savingsTrade.cryptoCurrency &&
            savingsTrade.fiatCurrency &&
            savingsTrade.paymentFrequency
        ) {
            const formResponse = await invityAPI.initSavingsTrade({
                amount: savingsTrade.fiatStringAmount,
                country: savingsTrade.country,
                cryptoCurrency: savingsTrade.cryptoCurrency,
                exchange: savingsTrade.exchange,
                fiatCurrency: savingsTrade.fiatCurrency,
                paymentFrequency: savingsTrade.paymentFrequency,
                returnUrl: await createReturnLink(),
            });
            if (formResponse?.form) {
                saveDraft(account.descriptor, formResponse.form);
                if (!isDesktop()) {
                    submitRequestForm(formResponse?.form);
                }
            }
        } else {
            // NOTE: Fallback - we don't want to leave user here if no draft exists.
            navigateToSavingsSetup();
        }
    }, [
        account.descriptor,
        getDraft,
        navigateToSavingsSetup,
        saveDraft,
        savingsTrade?.country,
        savingsTrade?.cryptoCurrency,
        savingsTrade?.exchange,
        savingsTrade?.fiatCurrency,
        savingsTrade?.fiatStringAmount,
        savingsTrade?.paymentFrequency,
        submitRequestForm,
    ]);

    return {
        handleGoToInvity,
    };
};
