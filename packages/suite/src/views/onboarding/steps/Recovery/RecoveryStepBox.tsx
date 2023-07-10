import React from 'react';
import {
    OnboardingButtonBack,
    OnboardingStepBox,
    OnboardingStepBoxProps,
} from 'src/components/onboarding';
import { Translation } from 'src/components/suite';
import { goToPreviousStep } from 'src/actions/onboarding/onboardingActions';
import { setStatus } from 'src/actions/recovery/recoveryActions';
import { useDispatch, useSelector } from 'src/hooks/suite';
import { DeviceModel } from '@trezor/device-utils';
import { useDeviceModel } from 'src/hooks/suite/useDeviceModel';

const RecoveryStepBox = (props: OnboardingStepBoxProps) => {
    const recovery = useSelector(state => state.recovery);
    const dispatch = useDispatch();

    const deviceModel = useDeviceModel();

    if (!deviceModel) {
        return null;
    }

    const handleBack = () => {
        if (recovery.status === 'select-recovery-type') {
            return dispatch(setStatus('initial'));
        }
        // allow to change recovery settings for T1 in case of error
        if (recovery.status === 'finished' && recovery.error && deviceModel === DeviceModel.T1) {
            return dispatch(setStatus('initial'));
        }
        return dispatch(goToPreviousStep());
    };

    const isBackButtonVisible = () => {
        if (recovery.status === 'finished' && recovery.error) {
            return true;
        }
        if (!['finished', 'in-progress', 'waiting-for-confirmation'].includes(recovery.status)) {
            return true;
        }
        return false;
    };

    return (
        <OnboardingStepBox
            image="RECOVERY"
            outerActions={
                isBackButtonVisible() ? (
                    <OnboardingButtonBack
                        onClick={() => handleBack()}
                        data-test="@onboarding/recovery/back-button"
                    >
                        <Translation id="TR_BACK" />
                    </OnboardingButtonBack>
                ) : undefined
            }
            {...props}
        />
    );
};

export default RecoveryStepBox;
