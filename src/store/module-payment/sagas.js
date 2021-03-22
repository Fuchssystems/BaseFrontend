import {
  call,
  fork,
  put,
  take,
} from 'redux-saga/effects';
import { PAYMENT_POST_NEW_PAYMENT_BACKEND } from './constants';
import { backendRequest } from '../../lib/backend.js';

function* postNewPaymentFlow(payload) {
  try {
    yield call(backendRequest, 'put', '/api/newUserPayment', { details: payload.details }, { token: payload.token });
  } catch (e) {
    yield put({ type: 'paymentBackendCallSetError', errorTextArray: e.localizedMessagesArray });
  }
}

export function* paymentWatcher() {
  while (true) {
    const { type, payload } = yield take([
      PAYMENT_POST_NEW_PAYMENT_BACKEND,
    ]);
    switch (type) {
      case PAYMENT_POST_NEW_PAYMENT_BACKEND:
        yield fork(postNewPaymentFlow, payload);
    }
  }
}
