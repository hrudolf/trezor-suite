import { createMigrate, persistReducer } from 'redux-persist';
import { Reducer } from '@reduxjs/toolkit';

import { initMmkvStorage } from './storage';
import { migrateAccountLabel, PartialStateForMigration } from './migrations';

export const preparePersistReducer = async <TReducerInitialState>({
    reducer,
    persistedKeys,
    key,
    version,
}: {
    reducer: Reducer<TReducerInitialState>;
    persistedKeys: Array<keyof TReducerInitialState>;
    key: string;
    version: number;
}) => {
    const migrations = {
        2: (oldState: any) => {
            const oldAccountsState: PartialStateForMigration = { accounts: oldState.accounts };
            const migratedAccounts = migrateAccountLabel(oldAccountsState.accounts);
            const migratedState = { ...oldState, accounts: migratedAccounts };
            return migratedState;
        },
    };

    const persistConfig = {
        key,
        storage: await initMmkvStorage(),
        whitelist: persistedKeys as string[],
        version,
        migrate: createMigrate(migrations, { debug: false }),
    };

    return persistReducer(persistConfig, reducer);
};
