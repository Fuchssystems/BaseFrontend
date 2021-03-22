import {
  call,
  fork,
  put,
  take,
} from 'redux-saga/effects';
import { TRANSACTION_LIST_REQUESTING } from './constants';
import { backendRequest } from '../../lib/backend.js';

function* transactionListFlow(payload) {
  let response = {};
  yield put({ type: 'transactionSetLoading', loading: true });
  try {
    yield put({ type: 'transactionsResetErrorlist' });
    response = yield call(backendRequest, 'put', '/api/getUserPayments', null, { token: payload.token });
    yield put({ type: 'transactionSetData', responseData: response.data });
  } catch (e) {
    yield put({ type: 'transactionBackendCallSetError', errorTextArray: e.localizedMessagesArray });
  }
  yield put({ type: 'transactionSetLoading', loading: false });
}

export function* transactionWatcher() {
  while (true) {
    const { type, payload } = yield take([
      TRANSACTION_LIST_REQUESTING,
    ]);
    switch (type) {
      case TRANSACTION_LIST_REQUESTING:
        yield fork(transactionListFlow, payload);
    }
  }
}
