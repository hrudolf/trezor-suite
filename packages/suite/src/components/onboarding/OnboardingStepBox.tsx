import React from 'react';
import styled from 'styled-components';
import TrezorConnect from '@trezor/connect';
import {
    ConfirmOnDevice,
    Backdrop,
    CollapsibleCard,
    CollapsibleCardProps,
} from '@trezor/components';
import { Translation } from 'src/components/suite';
import { DeviceModel } from '@trezor/device-utils';
import { useIntl } from 'react-intl';
import messages from 'src/support/messages';

const ConfirmWrapper = styled.div`
    margin-bottom: 20px;
    height: 62px;
    z-index: 2;
`;

const InnerActions = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 32px;
`;

const OuterActions = styled.div<{ smallMargin?: boolean }>`
    display: flex;
    margin-top: ${({ smallMargin }) => (smallMargin ? '0px' : '20px')};
    width: 100%;
    justify-content: center;
    z-index: 2;
`;

export const StyledBackdrop = styled(Backdrop)<{ show: boolean }>`
    transition: all 0.3s;
    opacity: ${({ show }) => (show ? '1' : '0')};
    pointer-events: ${({ show }) => (show ? 'initial' : 'none')};
    z-index: 1;
`;

const StyledCollapsibleCard = styled(CollapsibleCard)<{ $isBackDropVisible: boolean }>`
    z-index: ${({ $isBackDropVisible }) => ($isBackDropVisible ? 3 : 0)};
`;

export interface OnboardingStepBoxProps extends CollapsibleCardProps {
    innerActions?: React.ReactNode;
    outerActions?: React.ReactNode;
    deviceModel?: DeviceModel; //  the device prompt is displayed when this is set
    disableConfirmWrapper?: boolean;
    nested?: boolean;
    devicePromptTitle?: React.ReactNode;
    isActionAbortable?: boolean;
}

export const OnboardingStepBox = ({
    heading,
    description,
    image,
    innerActions,
    outerActions,
    deviceModel,
    isActionAbortable,
    disableConfirmWrapper,
    nested,
    devicePromptTitle,
    children,
    ...rest
}: OnboardingStepBoxProps) => {
    const intl = useIntl();

    const isBackDropVisible = !!deviceModel && !disableConfirmWrapper;

    return (
        <>
            <StyledBackdrop show={isBackDropVisible} />
            {!disableConfirmWrapper && (
                <ConfirmWrapper data-test="@onboarding/confirm-on-device">
                    {deviceModel && (
                        <ConfirmOnDevice
                            title={devicePromptTitle || <Translation id="TR_CONFIRM_ON_TREZOR" />}
                            deviceModel={deviceModel}
                            onCancel={
                                isActionAbortable
                                    ? () =>
                                          TrezorConnect.cancel(
                                              intl.formatMessage(messages.TR_CANCELLED),
                                          )
                                    : undefined
                            }
                        />
                    )}
                </ConfirmWrapper>
            )}

            <StyledCollapsibleCard
                image={image}
                heading={heading}
                description={description}
                nested={nested}
                $isBackDropVisible={isBackDropVisible}
                {...rest}
            >
                {(children || innerActions) && (
                    <>
                        {children}
                        {innerActions && <InnerActions>{innerActions}</InnerActions>}
                    </>
                )}
            </StyledCollapsibleCard>

            {outerActions && <OuterActions smallMargin={nested}>{outerActions}</OuterActions>}
        </>
    );
};
