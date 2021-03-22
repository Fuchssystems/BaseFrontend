import {
  call,
  fork,
  put,
  take,
} from 'redux-saga/effects';
import axios from 'axios';
import {
  CHAT_SEARCH,
  CHAT_CANCEL_SEARCH,
  CHAT_SEARCH_DISTANCE_MAX_KM,
  CHAT_SEARCH_AGE_MIN,
  CHAT_SEARCH_AGE_MAX,
  CHAT_FETCH_PROFILE_IMAGES,
  CHAT_CANCEL_FETCH_PROFILE_IMAGES,
  CHAT_SOCKET_MESSAGE_RECEIVED,
  CHAT_SOCKET_POST_MESSAGE_READ,
  CHAT_CHAT_MESSAGE_SEND,
  CHAT_FETCH_CHAT_MESSAGES,
  CHAT_CANCEL_FETCH_MESSAGES,
  CHAT_POST_UPDATE_PROFILE_RELATION,
  CHAT_WHISPER,
} from './constants';
import { backendRequest } from '../../lib/backend.js';

function* chatSearchFlow(payload) {
  yield put({
    type: 'chatSetIsFetching',
    isFetching: true,
    axiousCancelTokenSource: payload.axiousCancelTokenSource,
    fetchCounter: payload.fetchCounter,
  });

  // convert searchFilter.genders object to simple array
  if (payload.searchFilter.genders) {
    const simpleGendersArray = [];
    Object.entries(payload.searchFilter.genders).forEach(([key, value]) => {
      if (value) simpleGendersArray.push(key);
    });
    if (simpleGendersArray.length >= 1 && simpleGendersArray.length < 3) {
      payload.searchFilter.genders = simpleGendersArray;
    } else {
      delete payload.searchFilter.genders;
    }
  }
  // remove searchFilter.distance
  // if distance >= CHAT_SEARCH_DISTANCE_MAX_KM (= no distance search)
  if (payload.searchFilter.distance
    && payload.searchFilter.distance >= CHAT_SEARCH_DISTANCE_MAX_KM) {
    delete payload.searchFilter.distance;
  }
  // remove searchFilter.minAge/maxAge if not default value
  if (payload.searchFilter.minAge && payload.searchFilter.minAge <= CHAT_SEARCH_AGE_MIN) {
    delete payload.searchFilter.minAge;
  }
  // remove searchFilter.minAge/maxAge if not default value
  if (payload.searchFilter.maxAge && payload.searchFilter.maxAge >= CHAT_SEARCH_AGE_MAX) {
    delete payload.searchFilter.maxAge;
  }

  let response = {};
  try {
    response = yield call(backendRequest, 'put', 'api/chatProfileSearch',
      {
        sessionId: payload.sessionId,
        searchFilter: payload.searchFilter,
        queryPage: payload.queryPage,
      },
      { token: payload.token, axiousCancelTokenSource: payload.axiousCancelTokenSource });
    yield put({
      type: 'chatSetSearchByFilterResult',
      responseData: response.data,
      counter: payload.searchFilter.counter,
    });
    yield put({
      type: 'profileActiveProfileSetUnreadMessageCount',
      receiverProfileUnreadMessagesCount: response.data.receiverProfile_unread_messages_count,
    });
  } catch (e) {
    if (!e.canceled) { // not canceled by application
      yield put({ type: 'chatBackendCallSetError', errorTextArray: e.localizedMessagesArray });
    }
  }
  yield put({ type: 'chatSetIsFetching', isFetching: false, fetchCounter: payload.fetchCounter });
}

function* fetchProfileImages(payload) {
  yield put({
    type: 'chatSetFetchingProfileImages',
    fetchingProfileImages: true,
    axiousCancelTokenSource: payload.axiousCancelTokenSource,
    counterFetchingProfileImages: payload.counterFetchingProfileImages,
  });
  let response = {};
  try {
    response = yield call(backendRequest, 'put', 'api/getAllProfileFiles',
      {
        profileId: payload.profileId,
      },
      { token: payload.token, axiousCancelTokenSource: payload.axiousCancelTokenSource });
    yield put({
      type: 'chatSetProfileImagesFetchResult',
      responseData: response.data,
      profileId: payload.profileId,
      counterFetchingProfileImages: payload.counterFetchingProfileImages,
    });
  } catch (e) {
    if (e.canceled) console.log('saga: canceled');
    if (!e.canceled) { // not canceled by application
      yield put({ type: 'chatProfileImagesSetError', errorTextArray: e.localizedMessagesArray });
    }
  }
  yield put({
    type: 'chatSetFetchingProfileImages',
    fetchingProfileImages: false,
    counterFetchingProfileImages: payload.counterFetchingProfileImages,
  });
}

function* socketMessageReceivedFlow(message) {
  switch (message.type) {
    case 'onlineStatus':
      yield put({ type: 'chatSocketMessageUpdateOnlineStatus', message });
      break;

    case 'newChatmessage':
      yield put({ type: 'chatSocketMessageNewChatmassage', message });
      yield put({
        type: 'profileActiveProfileSetUnreadMessageCount',
        receiverProfileUnreadMessagesCount: message.unreadMessagecounter,
      });
      break;
  }
}

function* socketPostMessageReadFlow(payload) {
  let response = {};
  try {
    response = yield call(backendRequest, 'put', 'api/confirmChatmessageRead',
      {
        chatMessageId: payload.chatMessageId,
      },
      { token: payload.token });
    yield put({
      type: 'chatChatmessageSetReadPostServerResponse',
      responseData: response.data,
    });
    yield put({
      type: 'profileActiveProfileSetUnreadMessageCount',
      receiverProfileUnreadMessagesCount: response.data.receiverProfile_unread_messages_count,
    });
  } catch (e) {
    yield put({ type: 'chatChatMessagesSetError', errorTextArray: e.localizedMessagesArray });
  }
}

function* chatMessageSendFlow(payload) {
  let response = {};
  try {
    response = yield call(backendRequest, 'put', 'api/chatmessagePost',
      {
        message: payload.message,
        temporaryMessageId: payload.temporaryMessageId,
      },
      { token: payload.token });
    yield put({ type: 'chatChatSetMessageSendConfirmed', responseData: response.data });
  } catch (e) {
    if (e.canceled) console.log('saga: canceled');
    if (!e.canceled) { // not canceled by application
      yield put({ type: 'chatChatMessagesSetError', errorTextArray: e.localizedMessagesArray });
    }
  }
}

function* fetchProfileChatMessages(payload) {
  yield put({
    type: 'chatSetFetchingChatMessages',
    fetchingChatMessages: true,
    axiousCancelTokenSource: payload.axiousCancelTokenSource,
    counterFetchingChatMessages: payload.counterFetchingChatMessages,
  });
  let response = {};
  try {
    response = yield call(backendRequest, 'put', 'api/getProfileChatmessages',
      {
        profileIdSender: payload.profileIdSender,
        profileIdReceiver: payload.profileIdReceiver,
      },
      { token: payload.token, axiousCancelTokenSource: payload.axiousCancelTokenSource });
    yield put({
      type: 'chatSetChatmessagesFetchResult',
      responseData: response.data,
      profileIdReceiver: payload.profileIdReceiver,
      counterFetchingChatMessages: payload.counterFetchingChatMessages,
    });
    yield put({
      type: 'profileActiveProfileSetUnreadMessageCount',
      receiverProfileUnreadMessagesCount: response.data.receiverProfile_unread_messages_count,
    });
  } catch (e) {
    if (e.canceled) console.log('saga: canceled');
    if (!e.canceled) { // not canceled by application
      yield put({ type: 'chatChatMessagesSetError', errorTextArray: e.localizedMessagesArray });
    }
  }
  yield put({ type: 'chatSetFetchingChatMessages', fetchingChatMessages: false, counterFetchingChatMessages: payload.counterFetchingChatMessages });
}

function* chatPostUpdateProfileRelationFlow(payload) {
  yield put({
    type: 'chatProfileUpdate1Profile',
    profile: payload.profile,
  });
  try {
    yield call(backendRequest, 'put', 'api/updateProfileRelation',
      {
        profileRelation: {
          profile_id: payload.thisProfileId,
          related_profile_id: payload.profile.id,
          is_contact: payload.profile.is_contact,
        },
      },
      { token: payload.token });
  } catch (e) {
    yield put({ type: 'chatChatMessagesSetError', errorTextArray: e.localizedMessagesArray });
  }
}

function* chatWhisperFlow(payload) {
  try {
    yield call(backendRequest, 'put', 'api/whisper', payload);
  } catch (e) {
    yield put({ type: 'chatChatMessagesSetError', errorTextArray: e.localizedMessagesArray });
  }
}

export function* chatWatcher() {
  let fetchCounter = 0;
  let counterFetchingProfileImages = 0;
  let counterFetchingChatMessages = 0;
  let lastCancelTokenSourceChatSearch = null;
  let lastCancelTokenSourceProfileImages = null;
  let lastCancelTokenSourceChatMessages = null;
  while (true) {
    const { type, payload } = yield take([
      CHAT_SEARCH,
      CHAT_CANCEL_SEARCH,
      CHAT_FETCH_PROFILE_IMAGES,
      CHAT_CANCEL_FETCH_PROFILE_IMAGES,
      CHAT_SOCKET_MESSAGE_RECEIVED,
      CHAT_SOCKET_POST_MESSAGE_READ,
      CHAT_CHAT_MESSAGE_SEND,
      CHAT_FETCH_CHAT_MESSAGES,
      CHAT_CANCEL_FETCH_MESSAGES,
      CHAT_POST_UPDATE_PROFILE_RELATION,
      CHAT_WHISPER,
    ]);
    switch (type) {
      case CHAT_SEARCH:
        fetchCounter += 1;
        payload.fetchCounter = fetchCounter;
        // cancel previous axious request
        if (lastCancelTokenSourceChatSearch) {
          lastCancelTokenSourceChatSearch.cancel();
          lastCancelTokenSourceChatSearch = null;
        }
        payload.axiousCancelTokenSource = axios.CancelToken.source();
        lastCancelTokenSourceChatSearch = payload.axiousCancelTokenSource;
        yield fork(chatSearchFlow, payload);
        break;

      case CHAT_FETCH_PROFILE_IMAGES:
        counterFetchingProfileImages += 1;
        payload.counterFetchingProfileImages = counterFetchingProfileImages;
        // cancel previous axious request
        if (lastCancelTokenSourceProfileImages) {
          lastCancelTokenSourceProfileImages.cancel();
          lastCancelTokenSourceProfileImages = null;
        }
        payload.axiousCancelTokenSource = axios.CancelToken.source();
        lastCancelTokenSourceProfileImages = payload.axiousCancelTokenSource;
        yield fork(fetchProfileImages, payload);
        break;

      case CHAT_CANCEL_SEARCH:
        if (lastCancelTokenSourceChatSearch) {
          lastCancelTokenSourceChatSearch.cancel();
          lastCancelTokenSourceChatSearch = null;
        }
        break;

      case CHAT_CANCEL_FETCH_PROFILE_IMAGES:
        if (lastCancelTokenSourceProfileImages) {
          lastCancelTokenSourceProfileImages.cancel();
          lastCancelTokenSourceProfileImages = null;
        }
        break;

      case CHAT_SOCKET_MESSAGE_RECEIVED:
        yield fork(socketMessageReceivedFlow, payload);
        break;

      case CHAT_SOCKET_POST_MESSAGE_READ:
        yield fork(socketPostMessageReadFlow, payload);
        break;

      case CHAT_CHAT_MESSAGE_SEND:
        yield fork(chatMessageSendFlow, payload);
        break;

      case CHAT_FETCH_CHAT_MESSAGES:
        counterFetchingChatMessages += 1;
        payload.counterFetchingChatMessages = counterFetchingChatMessages;
        // cancel previous axious request
        if (lastCancelTokenSourceChatMessages) {
          lastCancelTokenSourceChatMessages.cancel();
          lastCancelTokenSourceChatMessages = null;
        }
        payload.axiousCancelTokenSource = axios.CancelToken.source();
        lastCancelTokenSourceChatMessages = payload.axiousCancelTokenSource;
        yield fork(fetchProfileChatMessages, payload);
        break;

      case CHAT_CANCEL_FETCH_MESSAGES:
        if (lastCancelTokenSourceChatMessages) {
          lastCancelTokenSourceChatMessages.cancel();
          lastCancelTokenSourceChatMessages = null;
        }
        break;

      case CHAT_POST_UPDATE_PROFILE_RELATION:
        yield fork(chatPostUpdateProfileRelationFlow, payload);
        break;

      case CHAT_WHISPER:
        yield fork(chatWhisperFlow, payload);
        break;
    }
  }
}
