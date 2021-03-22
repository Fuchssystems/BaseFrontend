import {
  call,
  fork,
  put,
  take,
} from 'redux-saga/effects';
import {
  VC_CALL_UPDATE_CALL_STATUS,
  VC_FETCH_RECEIVER_PROFILE,
  VC_REQUEST_NEW_CALL,
} from './constants';
import { backendRequest } from '../../lib/backend.js';

function* requestNewCallFlow(payload) {
  let response = {};
  try {
    response = yield call(backendRequest, 'put', 'api/videochatRequestNewCall',
      { profileIdReceiver: payload.profileIdReceiver },
      { token: payload.token });
    yield put({
      type: 'vcSetCall',
      responseData: response.data,
    });
  } catch (e) {
    yield put({ type: 'vcSetError', errorTextArray: e.localizedMessagesArray });
  }
}

function* updateCallStatusFlow(payload) {
  let response = {};
  try {
    response = yield call(backendRequest, 'put', 'api/videochatUpdateCallStatus',
      {
        id: payload.id,
        status: payload.status,
        sessionIdReceiver: payload.sessionIdReceiver || null,
      },
      { token: payload.token });
    yield put({
      type: 'vcSetCall',
      responseData: response.data,
    });
  } catch (e) {
    yield put({ type: 'vcSetError', errorTextArray: e.localizedMessagesArray });
  }
}

function* fetchReceiverProfileFlow(payload) {
  yield put({ type: 'vcSetIsFetchingReceiverProfile', isFetchingReceiverProfile: true });
  let response = {};
  try {
    response = yield call(backendRequest, 'put', 'api/chatGet1Profile',
      { id: payload.id },
      { token: payload.token });
    yield put({
      type: 'chatSetSearchByFilterResult',
      responseData: response.data,
    });
    if (response.data.profiles.data.length) {
      yield put({
        type: 'chatSetSelectedProfileId',
        id: response.data.profiles.data[0].id,
      });
    }
  } catch (e) {
    yield put({ type: 'vcSetError', errorTextArray: e.localizedMessagesArray });
  }
  yield put({ type: 'vcSetIsFetchingReceiverProfile', isFetchingReceiverProfile: false });
}

export function* videochatWatcher() {
  while (true) {
    const { type, payload } = yield take([
      VC_REQUEST_NEW_CALL,
      VC_CALL_UPDATE_CALL_STATUS,
      VC_FETCH_RECEIVER_PROFILE,
    ]);
    switch (type) {
      case VC_REQUEST_NEW_CALL:
        yield call(requestNewCallFlow, payload);
        break;
      case VC_CALL_UPDATE_CALL_STATUS:
        yield fork(updateCallStatusFlow, payload);
        break;
      case VC_FETCH_RECEIVER_PROFILE:
        yield fork(fetchReceiverProfileFlow, payload);
        break;
    }
  }
}
