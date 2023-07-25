import * as firmwareActions from 'src/actions/firmware/firmwareActions';
import { useActions, useSelector } from 'src/hooks/suite';
import { isWebUsb } from 'src/utils/suite/transport';
import { MODAL } from 'src/actions/suite/constants';

export const useFirmware = () => {
    const firmware = useSelector(state => state.firmware);
    const transport = useSelector(state => state.suite.transport);
    const modal = useSelector(state => state.modal);

    const showFingerprintCheck =
        modal.context === MODAL.CONTEXT_DEVICE &&
        modal.windowType === 'ButtonRequest_FirmwareCheck';

    const actions = useActions({
        toggleHasSeed: firmwareActions.toggleHasSeed,
        setStatus: firmwareActions.setStatus,
        firmwareUpdate: firmwareActions.firmwareUpdate,
        firmwareCustom: firmwareActions.firmwareCustom,
        resetReducer: firmwareActions.resetReducer,
        checkFirmwareAuthenticity: firmwareActions.checkFirmwareAuthenticity,
    });

    return {
        ...firmware,
        ...actions,
        isWebUSB: isWebUsb(transport),
        showFingerprintCheck,
    };
};
