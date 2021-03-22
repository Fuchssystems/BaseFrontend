import {
  fork,
  put,
} from 'redux-saga/effects';

function* loadFeaturesFlow() {
  yield put({ type: 'featureLoadFeatures' });
}

export function* featureWatcher() {
  yield fork(loadFeaturesFlow);
}
