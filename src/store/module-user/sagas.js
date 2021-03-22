import { Loading, Notify, SessionStorage } from 'quasar';
import {
  call,
  delay,
  fork,
  put,
  take,
} from 'redux-saga/effects';
import {
  LOGIN_REQUESTING,
  LOGOUT_REQUESTING,
  REGISTER_REQUESTING,
  USER_SAVE_PREFERENCES,
  USER_UPDATE_FIELDS,
  USER_UPDATE_FIELDS_SILENT,
  USER_DELETE_USER,
} from './constants';
import { loadFileFlowInFileSaga } from '../module-file/sagas.js';
import { i18n, defaultLocale } from '../../boot/i18n.js';
import { backendRequest } from '../../lib/backend.js';

function* logoutFlow(payload) {
  Loading.show({ message: i18n.t('backend_message_logging_out') });
  window.logout = true; // prevent call of alive after logout
  yield put({ type: 'logoutSuccess' });
  yield put({ type: 'profileUnsetData' });
  window.sessionStorage.clear();
  yield call(backendRequest, 'put', '/api/logout',
    { sessionId: payload.sessionId },
    { token: payload.token });
  Notify.create(i18n.t('app_logout_notification_logout_successful'));
  Loading.hide();
  document.location.assign('/'); // redircect to root
}

// send still alive status in intervalls
function* postStillAliveFlow(payload) {
  while (true) {
    yield delay(60000); // 1 min
    if (!window.logout) {
      yield call(backendRequest, 'put', '/api/alive',
        { sessionId: payload.sessionId },
        { token: payload.token });
    }
  }
}

function* loginFlow(payload) {
  let response = {};
  Loading.show({ message: i18n.t('backend_message_logging_in') });
  try {
    yield put({ type: 'userBackendCallInitialize' });
    response = yield call(backendRequest, 'put', 'api/login', { email: payload.email, password: payload.password });
    yield put({ type: 'loginSuccess', responseData: response.data });
    yield put({ type: 'profileSetData', responseData: response.data });
    yield put({ type: 'fileAddOrReplaceFile', responseData: response.data });
    i18n.locale = response.data.user.language;
    Notify.create(i18n.t('app_log_notification_login_successful', { username: response.data.user.name }));
    yield fork(postStillAliveFlow,
      { token: response.data.token, sessionId: response.data.session.id });
    if (payload.redirectTo) {
      payload.router.push(payload.redirectTo);
    } else {
      document.location.assign('/'); // redircect to root
    }
  } catch (e) {
    yield put({ type: 'userBackendCallSetError', errorTextArray: e.localizedMessagesArray });
  }
  Loading.hide();
}

function* registerFlow(payload) {
  let response = {};
  try {
    Loading.show({ message: i18n.t('backend_message_registering') });
    yield put({ type: 'userBackendCallInitialize' });
    response = yield call(backendRequest, 'put', 'api/register', {
      name: payload.name,
      email: payload.email,
      password: payload.password,
      c_password: payload.confirmPassword,
      language: payload.languageLocale,
    });
    yield put({ type: 'loginSuccess', responseData: response.data });
    yield put({ type: 'profileSetData', responseData: response.data });
    Notify.create(i18n.t('app_register_notification_login_successful', { username: response.data.user.name }));
    yield fork(postStillAliveFlow,
      { token: response.data.token, sessionId: response.data.session.id });
    if (payload.redirectTo) {
      payload.router.push(payload.redirectTo);
    } else {
      document.location.assign('/'); // redircect to root
    }
  } catch (e) {
    yield put({ type: 'userBackendCallSetError', errorTextArray: e.localizedMessagesArray });
  }
  Loading.hide();
}

function* userSavePrefencesFlow(payload) {
  yield call(backendRequest, 'patch', '/api/userPreferences',
    { fields: { user: { id: payload.userId, language: payload.language } } },
    { token: payload.token });
}

function* userUpdateFieldsFlow(payload) {
  let response = {};
  Loading.show({ message: i18n.t('backend_message_saving_data') });
  try {
    yield put({ type: 'userBackendCallInitialize', errorGroup: payload.errorGroup });
    response = yield call(backendRequest, 'patch', '/api/user', { fields: payload.fields }, { token: payload.token });
    yield put({ type: 'userUpdateFieldsSuccess', responseData: response.data });
    yield put({ type: 'profileSetData', responseData: response.data });
    Notify.create(i18n.t(payload.onSuccessNotificationId));
  } catch (e) {
    yield put({ type: 'userBackendCallSetError', errorTextArray: e.localizedMessagesArray, errorGroup: payload.errorGroup });
  }
  Loading.hide();
}

// update fields silent without notifications, loading indicator
// stripped version of userUpdateFieldsFlow
function* userUpdateFieldsSilentFlow(payload) {
  const mutateStateAfterResponse = !!payload.mutateStateAfterResponse;
  let response = {};
  try {
    yield put({ type: 'userBackendCallInitialize', errorGroup: payload.errorGroup });
    response = yield call(backendRequest, 'patch', '/api/user', { fields: payload.fields }, { token: payload.token });
    if (mutateStateAfterResponse) {
      yield put({ type: 'userUpdateFieldsSuccess', responseData: response.data });
    }
  } catch (e) {
    yield put({ type: 'userBackendCallSetError', errorTextArray: e.localizedMessagesArray, errorGroup: payload.errorGroup });
  }
}

// create a guest user if not logged in on startup
function* guestFlow() {
  try {
    // lookup user.token in sessionStorage
    let token = '';
    const localStoreState = SessionStorage.getItem('store');
    if (localStoreState && localStoreState.user) {
      ({ token } = localStoreState.user);
    }

    // restore image file content not stored in sessionStorage because of browser quota
    if (token && localStoreState.file && localStoreState.file.files) {
      yield put({ type: 'fileUploadInitialize' });
      const filesArray = localStoreState.file.files;
      for (let i = 0; i < filesArray.length; i += 1) {
        yield fork(loadFileFlowInFileSaga, { fileId: filesArray[i].id, token });
      }
    }

    // post still alive in intervall
    if (token && localStoreState.user && localStoreState.user.session) {
      yield fork(postStillAliveFlow, { token, sessionId: localStoreState.user.session.id });
    }

    if (!token) {
      // create new webuser entity on server
      yield put({ type: 'userBackendCallInitialize' });
      const response = yield call(backendRequest, 'put', 'api/createWebuser', {
        language: defaultLocale,
      });
      yield put({ type: 'loginSuccess', responseData: response.data });
      yield put({ type: 'profileUnsetData' });
    }
  } catch (e) {
    console.log(e);
  }
}

function* deleteUserFlow(payload) {
  Loading.show({ message: i18n.t('backend_message_delete_webuser') });
  try {
    yield put({ type: 'userBackendCallInitialize' });
    yield call(backendRequest, 'put', 'api/deleteWebuser', { password: payload.password }, { token: payload.token });
    yield fork(logoutFlow);
    Notify.create(i18n.t(payload.onSuccessNotificationId));
  } catch (e) {
    yield put({ type: 'userBackendCallSetError', errorTextArray: e.localizedMessagesArray, errorGroup: payload.errorGroup });
  }
  Loading.hide();
}

export function* userWatcher() {
  yield fork(guestFlow);
  while (true) {
    const { type, payload } = yield take([
      LOGIN_REQUESTING,
      LOGOUT_REQUESTING,
      REGISTER_REQUESTING,
      USER_SAVE_PREFERENCES,
      USER_UPDATE_FIELDS,
      USER_UPDATE_FIELDS_SILENT,
      USER_DELETE_USER,
    ]);
    switch (type) {
      case LOGIN_REQUESTING:
        yield fork(loginFlow, payload);
        break;

      case REGISTER_REQUESTING:
        yield fork(registerFlow, payload);
        break;

      case LOGOUT_REQUESTING:
        yield call(logoutFlow, payload);
        break;

      case USER_SAVE_PREFERENCES:
        yield fork(userSavePrefencesFlow, payload);
        break;

      case USER_UPDATE_FIELDS:
        yield call(userUpdateFieldsFlow, payload);
        break;

      case USER_UPDATE_FIELDS_SILENT:
        yield fork(userUpdateFieldsSilentFlow, payload);
        break;

      case USER_DELETE_USER:
        yield call(deleteUserFlow, payload);
        break;
    }
  }
}
