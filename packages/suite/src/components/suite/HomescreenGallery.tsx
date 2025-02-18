import React from 'react';
import styled from 'styled-components';
import { analytics, EventType } from '@trezor/suite-analytics';
import { resolveStaticPath } from '@suite-common/suite-utils';

import { homescreensBW64x128, homescreensColor240x240 } from 'src/constants/suite/homescreens';
import * as deviceSettingsActions from 'src/actions/settings/deviceSettingsActions';
import { imagePathToHex } from 'src/utils/suite/homescreen';
import { useActions, useDevice } from 'src/hooks/suite';
import { DeviceModel, getDeviceModel } from '@trezor/device-utils';

type AnyImageName = (typeof homescreensBW64x128)[number] | (typeof homescreensColor240x240)[number];

const Wrapper = styled.div`
    display: flex;
    justify-content: center;
`;

const BackgroundGalleryWrapper64x128 = styled.div`
    display: flex;
    gap: 10px;
    justify-content: center;
    flex-wrap: wrap;
`;

const BackgroundGalleryWrapper240x240 = styled(BackgroundGalleryWrapper64x128)`
    width: 400px;
`;

const BackgroundImageBW64x128 = styled.img`
    border-radius: 3px;
    cursor: pointer;
    width: 64px;
    height: 32px;
`;

const BackgroundImageColor240x240 = styled(BackgroundImageBW64x128)`
    width: 120px;
    height: 120px;
`;

type HomescreenGalleryProps = {
    onConfirm?: () => void;
};

export const HomescreenGallery = ({ onConfirm }: HomescreenGalleryProps) => {
    const { device, isLocked } = useDevice();
    const { applySettings } = useActions({ applySettings: deviceSettingsActions.applySettings });
    const deviceModel = getDeviceModel(device);

    if (!deviceModel) return null;

    const setHomescreen = async (imagePath: string, image: AnyImageName) => {
        if (isLocked()) return;

        const hex = await imagePathToHex(imagePath, deviceModel);

        applySettings({ homescreen: hex });

        if (onConfirm) {
            onConfirm();
        }

        analytics.report({
            type: EventType.SettingsDeviceBackground,
            payload: {
                image,
            },
        });
    };

    return (
        <Wrapper>
            {[DeviceModel.T1, DeviceModel.T2B1].includes(deviceModel) && (
                <BackgroundGalleryWrapper64x128>
                    {homescreensBW64x128.map(image => (
                        <BackgroundImageBW64x128
                            data-test={`@modal/gallery/bw_64x128/${image}`}
                            key={image}
                            id={image}
                            onClick={e =>
                                setHomescreen((e.target as HTMLImageElement).currentSrc, image)
                            }
                            src={resolveStaticPath(`images/homescreens/BW_64x128/${image}.png`)}
                        />
                    ))}
                </BackgroundGalleryWrapper64x128>
            )}
            {deviceModel === DeviceModel.TT && (
                <BackgroundGalleryWrapper240x240>
                    {homescreensColor240x240.map(image => (
                        <BackgroundImageColor240x240
                            data-test={`@modal/gallery/color_240x240/${image}`}
                            key={image}
                            id={image}
                            onClick={e =>
                                setHomescreen((e.target as HTMLImageElement).currentSrc, image)
                            }
                            src={resolveStaticPath(`images/homescreens/COLOR_240x240/${image}.jpg`)}
                        />
                    ))}
                </BackgroundGalleryWrapper240x240>
            )}
        </Wrapper>
    );
};
