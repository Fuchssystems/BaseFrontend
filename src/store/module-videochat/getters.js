import { m } from '../../lib/i18nCustomFormatMessage';
import {
  VC_CALL_CONNECTED,
  VC_CALL_DECLINED,
  VC_CALL_IS_BUSY,
  VC_CALL_IS_RINGING,
  VC_CALL_NEW_CALL_REQUESTED,
  VC_CALL_RECEIVER_DID_NOT_ANSWER,
  VC_STATUS_FREE,
  VC_STATUS_REQUEST_NEW_CALL,
  VC_WEBRTC_STATUS_NEGOTIATING,
  VC_WEBRTC_STATUS_TIMEDOUT,
} from './constants';

export function getVCcallEntity(state) {
  return state.call;
}

export function getVCplayRingbacktone(state, getters) {
  if (state.call && state.call.profile_id_caller) {
    return (state.call.profile_id_caller === getters.getActiveProfileId)
      && (state.call.status === VC_CALL_IS_RINGING);
  }
  return false;
}

export function getVCcallIsOutgoing(state, getters) {
  return !!(state.call && state.call.profile_id_caller === getters.getActiveProfileId);
}

export function getVCcallStatusIsConnected(state) {
  return !!(state.call && state.call.status === VC_CALL_CONNECTED);
}

export function getVCcallerStatus(state) {
  return state.callerStatus;
}

export function getVCReceiverStatusDisplay(state, getters) {
  if (state.call
    && (state.call.profile_id_caller === getters.getActiveProfileId)) { // outgoing call
    if (state.call && state.call.status === VC_CALL_RECEIVER_DID_NOT_ANSWER) {
      return m('vcReceiverStatusDisplay_receiver_did_not_answer');
    }
    if (state.call && state.call.status === VC_CALL_NEW_CALL_REQUESTED) {
      return m('vcReceiverStatusDisplay_contact_server');
    }
    if (state.call && state.call.status === VC_CALL_IS_RINGING) {
      return m('vcReceiverStatusDisplay_caller_ringing');
    }
    if (state.call && state.call.status === VC_CALL_DECLINED) {
      return m('vcReceiverStatusDisplay_declined');
    }
    if (state.call && state.call.status === VC_CALL_IS_BUSY) {
      return m('vcReceiverStatusDisplay_receiver_is_busy');
    }
  }
  if (state.call && state.call.status === VC_CALL_CONNECTED) {
    let returnValue = m('vcReceiverStatusDisplay_connected');
    if (state.webRTCstatus === VC_WEBRTC_STATUS_NEGOTIATING) {
      returnValue = `${returnValue}. ${m('vcWebRTC_StatusDisplay_negotiating')}`;
    }
    return returnValue;
  }
  if (state.callerStatus === VC_STATUS_REQUEST_NEW_CALL) {
    return m('vcReceiverStatusDisplay_outgoing_call');
  }
  if (state.callerStatus === VC_STATUS_FREE && state.webRTCstatus === VC_WEBRTC_STATUS_TIMEDOUT) {
    return m('vcWebRTC_StatusDisplay_timed_out');
  }
  if (!getters.getUserVCPreferenceShowMyVideo) {
    return m('vcReceiverStatusDisplay_turn_on_camera');
  }
  return '';
}

export function getVCreceiverProfile(state) {
  return state.receiverProfile;
}

export function getVCisFetchingReceiverProfile(state) {
  return state.isFetchingReceiverProfile;
}

export function getVCmodeUseReceivedProfile(state) {
  return state.modeUseReceivedProfile;
}

export function getVCwebRTCStatus(state) {
  return state.webRTCstatus;
}

export function getVCerrorList(state) {
  return state.errorList;
}
