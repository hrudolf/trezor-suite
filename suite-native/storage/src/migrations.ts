import { Account, MetadataItem } from '@suite-common/wallet-types';

interface AccountMetadata {
    accountLabel?: MetadataItem;
}

type OldAccount = {
    metadata: AccountMetadata;
    [key: string]: any;
};

type MigratedAccount = {
    accountLabel?: string;
    [key: string]: any;
};

export interface PartialStateForMigration {
    accounts: Account[];
}

export const migrateAccountLabel = (oldAccounts: OldAccount[]): MigratedAccount[] =>
    oldAccounts.map(oldAccount => {
        if (!oldAccount.metadata || !oldAccount.metadata.accountLabel) {
            return oldAccount;
        }

        const { accountLabel, ...metadataWithoutAccountLabel } = oldAccount.metadata;

        return {
            ...oldAccount,
            metadata: {
                ...metadataWithoutAccountLabel,
                accountLabel,
            },
        };
    });
