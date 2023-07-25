import BigNumber from 'bignumber.js';
import { AccountUtxo } from '@trezor/connect';
import { useIntl } from 'react-intl';

import { getUtxoOutpoint } from '@suite-common/wallet-utils';
import { Account, CoinjoinUtxoSelectionContext } from '@suite-common/wallet-types';
import { useSelector, useTranslation } from 'src/hooks/suite';
import {
    selectCoinjoinAccountByKey,
    selectCoinjoinClient,
    selectCurrentTargetAnonymity,
    selectBlockedUtxosByAccountKey,
} from 'src/reducers/wallet/coinjoinReducer';

interface UseCoinjoinUtxosProps {
    account: Account;
}

export const useCoinjoinUtxoSelection = ({
    account,
}: UseCoinjoinUtxosProps): CoinjoinUtxoSelectionContext => {
    const coinjoinAccount = useSelector(state => selectCoinjoinAccountByKey(state, account.key));
    const coinjoinClient = useSelector(state => selectCoinjoinClient(state, account.key));
    const targetAnonymity = useSelector(selectCurrentTargetAnonymity);
    const sessionPrison = useSelector(state => selectBlockedUtxosByAccountKey(state, account.key));

    const intl = useIntl();
    const { translationString } = useTranslation();

    const coinjoinBlockedUtxos: AccountUtxo[] = [];
    const coinjoinBannedUtxos: AccountUtxo[] = [];
    const coinjoinAmountTooLowUtxos: AccountUtxo[] = [];
    const coinjoinAmountTooHighUtxos: AccountUtxo[] = [];
    const allowedInputAmounts = coinjoinClient?.allowedInputAmounts;
    const unavailableMessage: Record<string, string | undefined> = {};

    if (allowedInputAmounts) {
        const { min, max } = allowedInputAmounts;
        account?.utxo?.forEach(utxo => {
            const outpoint = getUtxoOutpoint(utxo);
            const amountBN = new BigNumber(utxo.amount);
            const imprisonedUtxo = coinjoinAccount?.prison?.[outpoint];

            if (imprisonedUtxo) {
                if (imprisonedUtxo.roundId && sessionPrison?.[outpoint]) {
                    coinjoinBlockedUtxos.push(utxo);
                } else if (!imprisonedUtxo.roundId) {
                    coinjoinBannedUtxos.push(utxo);
                    unavailableMessage[outpoint] = translationString('TR_UTXO_BANNED_IN_COINJOIN', {
                        sentenceEnd: intl.formatDate(imprisonedUtxo.sentenceEnd, {
                            dateStyle: 'full',
                            timeStyle: 'medium', // TODO: date/time format
                        }),
                    });
                }
            } else if (amountBN.lt(min)) {
                coinjoinAmountTooLowUtxos.push(utxo);
                unavailableMessage[outpoint] = translationString(
                    'TR_AMOUNT_TOO_SMALL_FOR_COINJOIN',
                );
            } else if (amountBN.gt(max)) {
                coinjoinAmountTooHighUtxos.push(utxo);
                unavailableMessage[outpoint] = translationString('TR_AMOUNT_TOO_BIG_FOR_COINJOIN');
            }
        });
    }

    const coinjoinUtxoUnavailableMessage = (utxo: AccountUtxo) =>
        unavailableMessage[getUtxoOutpoint(utxo)];

    return {
        targetAnonymity,
        coinjoinBlockedUtxos,
        coinjoinBannedUtxos,
        coinjoinAmountTooLowUtxos,
        coinjoinAmountTooHighUtxos,
        coinjoinUtxoUnavailableMessage,
    };
};
