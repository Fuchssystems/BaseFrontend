import { Notify } from 'quasar';
import {
  call,
  fork,
  put,
  take,
} from 'redux-saga/effects';
import {
  UPLOAD_REQUESTING,
  LOAD_FILE_REQUESTING,
  DELETE_FILE_REQUESTING,
  DELETE_FILES_REQUESTING,
  LOAD_ALL_PROFILE_FILES,
  CHANGE_FILE_SORTORDER_REQUESTING,
} from './constants';
import { m } from '../../lib/i18nCustomFormatMessage.js';
import { backendRequest } from '../../lib/backend.js';

function* uploadFlow(payload) {
  let response = {};
  try {
    response = yield call(backendRequest, 'put', 'api/addFileProfile',
      {
        filename: payload.file.name,
        filetype: payload.file.type,
        filecontent: payload.filecontent,
        fileIsProfileImage: payload.isProfileImage,
        profileId: payload.profileId,
      },
      { token: payload.token });
    yield put({ type: 'fileAddOrReplaceFile', responseData: response.data, oldProfileImageId: payload.oldProfileImageId });
    yield put({ type: 'profileUpdate1Profile', responseData: response.data });
    Notify.create(payload.onSuccessNotification);
  } catch (e) {
    yield put({ type: 'fileUploadSetError', errorTextArray: e.localizedMessagesArray });
  }
  yield put({ type: 'fileDeleteTemporaryFile', temporaryFileId: payload.temporaryFileId });
}

function* loadFileFlow(payload) {
  let response = {};
  try {
    response = yield call(backendRequest, 'put', 'api/loadFile',
      {
        fileId: payload.fileId,
      },
      { token: payload.token });
    yield put({ type: 'fileAddOrReplaceFile', responseData: response.data });
  } catch (e) {
    yield put({ type: 'fileUploadSetError', errorTextArray: e.localizedMessagesArray });
  }
}

function* deleteFileFlow(payload) {
  let response = {};
  try {
    response = yield call(backendRequest, 'put', 'api/deleteFile',
      {
        fileId: payload.fileId,
      },
      { token: payload.token });
    yield put({ type: 'fileDeleteFile', fileId: payload.fileId });
    yield put({ type: 'profileUpdate1Profile', responseData: response.data });
    Notify.create(payload.onSuccessNotification);
  } catch (e) {
    yield put({ type: 'fileUploadSetError', errorTextArray: e.localizedMessagesArray });
  }
}

function* deleteFilesFlow(payload) {
  let response = {};
  try {
    response = yield call(backendRequest, 'put', 'api/deleteFiles',
      {
        arrayFileIds: payload.arrayFileIds,
      },
      { token: payload.token });
    Notify.create(m(payload.onSuccessNotificationId, {
      ...payload.onSuccessNotificationParameter,
      count: response.data.counterRecordsFileDeleted,
    }));
  } catch (e) {
    yield put({ type: 'fileUploadSetError', errorTextArray: e.localizedMessagesArray });
  }
}

function* loadAllProfileFiles(payload) {
  let response = {};
  yield put({ type: 'fileSetFilesAreLoading', filesAreLoading: true });
  try {
    response = yield call(backendRequest, 'put', 'api/getAllProfileFiles',
      {
        profileId: payload.profileId,
      },
      { token: payload.token });
    yield put({ type: 'fileReplaceAllFiles', responseData: response.data, activeProfileImageId: payload.activeProfileImageId });
  } catch (e) {
    yield put({ type: 'fileUploadSetError', errorTextArray: e.localizedMessagesArray });
  }
  yield put({ type: 'fileSetFilesAreLoading', filesAreLoading: false });
}

function* changeFileSortorder(payload) {
  try {
    yield call(backendRequest, 'put', 'api/changeFileSortOrder',
      {
        fileId: payload.fileId,
        newSortValue: payload.newSortValue,
        oldSortValue: payload.oldSortValue,
      },
      { token: payload.token });
  } catch (e) {
    yield put({ type: 'fileUploadSetError', errorTextArray: e.localizedMessagesArray });
  }
}

export function* uploadWatcher() {
  while (true) {
    const { type, payload } = yield take([
      UPLOAD_REQUESTING,
      DELETE_FILE_REQUESTING,
      LOAD_FILE_REQUESTING,
      DELETE_FILES_REQUESTING,
      LOAD_ALL_PROFILE_FILES,
      CHANGE_FILE_SORTORDER_REQUESTING,
    ]);
    switch (type) {
      case UPLOAD_REQUESTING:
        yield fork(uploadFlow, payload);
        break;

      case DELETE_FILE_REQUESTING:
        yield fork(deleteFileFlow, payload);
        break;
      case DELETE_FILES_REQUESTING:
        yield fork(deleteFilesFlow, payload);
        break;

      case LOAD_FILE_REQUESTING:
        yield fork(loadFileFlow, payload);
        break;

      case LOAD_ALL_PROFILE_FILES:
        yield fork(loadAllProfileFiles, payload);
        break;

      case CHANGE_FILE_SORTORDER_REQUESTING:
        yield fork(changeFileSortorder, payload);
        break;
    }
  }
}

export const loadFileFlowInFileSaga = loadFileFlow;
