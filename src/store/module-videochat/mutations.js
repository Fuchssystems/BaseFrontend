import {
  VC_CALL_CONNECTED,
  VC_CALL_IS_RINGING,
  VC_CALL_NEW_CALL_REQUESTED,
  VC_STATUS_CONNECTED,
  VC_STATUS_FREE,
  VC_STATUS_REQUEST_NEW_CALL,
  VC_WEBRTC_STATUS_NEGOTIATING,
  VC_WEBRTC_STATUS_NONE,
} from './constants';

export function vcInitComponent(state) {
  state.call = {};
  state.callerStatus = VC_STATUS_FREE;
  state.errorList = [];
}

export function vcSetCallerStatus(state, status) {
  state.callerStatus = status;
}

export function vcSetCall(state, payload) {
  let newCallIsNewer = true;
  if (state.call && state.call.last_log_id) {
    newCallIsNewer = payload.responseData.call.last_log_id > state.call.last_log_id;
  }
  if (newCallIsNewer) {
    if (payload.status) state.callerStatus = payload.status;
    state.call = payload.responseData.call;

    if (state.call.status === VC_CALL_CONNECTED) {
      state.callerStatus = VC_STATUS_CONNECTED;
      state.webRTCstatus = VC_WEBRTC_STATUS_NEGOTIATING;
    }
    if ((state.call.status === VC_STATUS_REQUEST_NEW_CALL)
      || (state.call.status === VC_CALL_IS_RINGING)) {
      state.webRTCstatus = VC_WEBRTC_STATUS_NONE;
    }

    let setStatusFree = false;
    if (!state.call.status) {
      setStatusFree = state.callerStatus !== VC_STATUS_REQUEST_NEW_CALL;
    } else {
      setStatusFree = (state.call.status !== VC_CALL_NEW_CALL_REQUESTED)
        && (state.call.status !== VC_CALL_IS_RINGING)
        && (state.call.status !== VC_CALL_CONNECTED);
    }
    if (setStatusFree) state.callerStatus = VC_STATUS_FREE;
  }
}

export function vcSetWebRTCstatus(state, status) {
  state.webRTCstatus = status;
}

export function vcSetIsFetchingReceiverProfile(state, payload) {
  state.isFetchingReceiverProfile = payload.isFetchingReceiverProfile;
}

export function vcSetModeUseReceivedProfile(state, payload) {
  state.modeUseReceivedProfile = payload.modeUseReceivedProfile;
}

export function vcSetError(state, payload) {
  const { errorTextArray } = payload;
  if (errorTextArray && errorTextArray.length) {
    errorTextArray.forEach(errorText => state.errorList.push(errorText));
  }
}

export function vcResetErrorlist(state) {
  state.errorList = [];
}
