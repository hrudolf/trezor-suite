import { SignValue } from '@suite-common/suite-types';
import { isSignValuePositive } from '@suite-common/suite-utils';

import { makeFormatter } from '../makeFormatter';

export const signValueFormatter = makeFormatter<SignValue | undefined, string>(value =>
    value ? `${isSignValuePositive(value) ? '+' : '-'}` : '',
);
