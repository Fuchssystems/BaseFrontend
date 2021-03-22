import { VC_STATUS_FREE, VC_WEBRTC_STATUS_NONE } from './constants';

export default {
  call: {},
  callerStatus: VC_STATUS_FREE,
  isFetchingReceiverProfile: false,
  modeUseReceivedProfile: false,
  webRTCstatus: VC_WEBRTC_STATUS_NONE,
  errorList: [],
};
