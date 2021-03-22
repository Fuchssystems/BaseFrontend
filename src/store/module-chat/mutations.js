import {
  CHAT_SEARCH_DISTANCE_MAX_KM,
  CHAT_SEARCH_AGE_MIN,
  CHAT_SEARCH_AGE_MAX,
} from './constants.js';

export function chatRemoveProfilesFromSelection(state, arrayProfileIds) {
  const clonedArray = state.profiles.map(obj => ({ ...obj }));
  let index = -1;
  arrayProfileIds.forEach((id) => {
    index = clonedArray.findIndex(profile => profile.id === id);
    if (index !== -1) {
      clonedArray.splice(index, 1);
    }
  });
  state.profiles = clonedArray;

  // update selected profile id and index
  if (state.selectedProfileId) {
    state.selectedProfileIndex = state.profiles
      .findIndex(profile => profile.id === state.selectedProfileId);
    if (state.selectedProfileIndex !== -1) {
      state.selectedProfileId = state.profiles[state.selectedProfileIndex].id;
    }
  }
}

export function chatSetSelectedProfileId(state, id) {
  let idToUse = null; // null is an allowed value
  if (id) {
    // Check if called from saga (can only pass payload as object)
    idToUse = typeof id !== 'object' ? id : id.id;
  }
  state.selectedProfileId = idToUse;
  state.selectedProfileIndex = idToUse
    ? state.profiles.findIndex(profile => profile.id === idToUse) : -1;
}

export function chatSetSearchFilterAll(state, all) {
  state.searchFilter.all = all;
  if (all) {
    state.searchFilter.name = '';
    state.searchFilter.genders.male = true;
    state.searchFilter.genders.female = true;
    state.searchFilter.genders.diverse = true;
    state.searchFilter.minAge = CHAT_SEARCH_AGE_MIN;
    state.searchFilter.maxAge = CHAT_SEARCH_AGE_MAX;
    state.searchFilter.distance = CHAT_SEARCH_DISTANCE_MAX_KM;
    state.searchFilter.queryPage = 1;
  }
}

export function chatSetSearchFilterName(state, name) {
  state.searchFilter.name = name;
  state.searchFilter.all = false;
  state.searchFilter.queryPage = 1;

  let counterOldValue = state.searchFilter && state.searchFilter.counter;
  if (!counterOldValue) counterOldValue = 0;
  state.searchFilter.counter = counterOldValue + 1;
}

export function chatSetSearchFilterMode(state, mode) {
  state.searchFilter.mode = mode || 'profiles';
  // state.searchFilter.name = '';
  state.searchFilter.queryPage = 1;
}

export function chatSetSearchFilterToggleGender(state, gender) {
  const { genders } = state.searchFilter;
  genders[gender] = !genders[gender];
  // if no gender selected, switch on the other 2
  if (!genders.male && !genders.female
    && !genders.diverse) {
    if (gender !== 'male') genders.male = true;
    if (gender !== 'female') genders.female = true;
    if (gender !== 'diverse') genders.diverse = true;
  }
  state.searchFilter.all = false;
  state.searchFilter.queryPage = 1;

  let counterOldValue = state.searchFilter && state.searchFilter.counter;
  if (!counterOldValue) counterOldValue = 0;
  state.searchFilter.counter = counterOldValue + 1;
}

export function chatSetSearchFilterDistance(state, distance) {
  state.searchFilter.distance = distance;
  state.searchFilter.all = false;
  state.searchFilter.queryPage = 1;

  let counterOldValue = state.searchFilter && state.searchFilter.counter;
  if (!counterOldValue) counterOldValue = 0;
  state.searchFilter.counter = counterOldValue + 1;
}

export function chatSetSearchFilterAges(state, ages) {
  if (ages.minAge) state.searchFilter.minAge = ages.minAge;
  if (ages.maxAge) state.searchFilter.maxAge = ages.maxAge;
  state.searchFilter.all = false;
  state.searchFilter.queryPage = 1;

  let counterOldValue = state.searchFilter && state.searchFilter.counter;
  if (!counterOldValue) counterOldValue = 0;
  state.searchFilter.counter = counterOldValue + 1;
}

// called after profile search or fetch other videochat profile
// fetch videochat profile: no counter
export function chatSetSearchByFilterResult(state, payload) {
  if (!payload.counter || (payload.counter === state.searchFilter.counter)) {
    // pagination metadata - copy all properties except profiles.data
    // https://stackoverflow.com/questions/34698905/how-can-i-clone-a-javascript-object-except-for-one-key
    state.paginationMetaProfiles = (({ data, ...o }) => o)(payload.responseData.profiles);
    state.profiles = payload.responseData.profiles.data;
    state.searchNothingFound = !state.profiles.length;
    state.selectedProfileId = null;
    state.selectedProfileIndex = -1;
  }
}

export function chatClearSearchByFilterResult(state) {
  state.profiles = [];
  state.paginationMetaProfiles = null;
  state.paginatePageNumberSelected = 1;
  state.searchNothingFound = false;
  state.selectedProfileId = null;
  state.selectedProfileIndex = -1;
  state.searchFilter.queryPage = 1;
}

export function chatBackendCallSetError(state, payload) {
  const { errorTextArray } = payload;
  if (errorTextArray && errorTextArray.length) {
    errorTextArray.forEach(errorText => state.errorList.push(errorText));
  }
}

export function chatSetIsFetching(state, payload) {
  if (payload.isFetching) {
    state.isFetching = true;
    state.searchNothingFound = false;
    state.fetchCounter = payload.fetchCounter;
  } else if (payload.fetchCounter >= state.fetchCounter) {
    state.isFetching = false;
  }
}

export function chatResetErrorlist(state) {
  state.errorList = [];
}

// profile pagination
export function chatSetProfilesPageNumberSelected(state, pageNumber) {
  state.paginatePageNumberSelected = pageNumber;
}

export function chatSetSearchFilterQueryPage(state, queryPage) {
  state.searchFilter.queryPage = queryPage;
}

// profile images
export function chatSetFetchingProfileImages(state, payload) {
  if (payload.fetchingProfileImages) {
    state.fetchingProfileImages = true;
    state.profileHasNoImages = false;
    state.counterFetchingProfileImages = payload.counterFetchingProfileImages;
  } else if (payload.counterFetchingProfileImages >= state.counterFetchingProfileImages) {
    state.fetchingProfileImages = false;
  }
}

export function chatSetProfileImagesFetchResult(state, payload) {
  if (payload.counterFetchingProfileImages === state.counterFetchingProfileImages) {
    state.profileImages = [...payload.responseData.files];
    state.profileHasNoImages = !state.profileImages.length;
    state.profileImagesProfileIdSet = payload.profileId;
  }
}

export function chatClearProfileImagesFetchResult(state) {
  state.profileImages = [];
  state.profileHasNoImages = false;
  state.profileImagesSelectedId = null;
  state.profileImagesProfileIdSet = null;
}

export function chatProfileImagesSetError(state, payload) {
  const { errorTextArray } = payload;
  if (errorTextArray && errorTextArray.length) {
    errorTextArray.forEach(errorText => state.profileImagesErrorList.push(errorText));
  }
}

export function chatSetSelectedProfileImageId(state, id) {
  state.profileImagesSelectedId = id;
}

export function chatProfileImagesResetErrorlist(state) {
  state.profileImagesErrorList = [];
}

export function chatProfileUpdate1Profile(state, payload) {
  const updatedProfile = payload.profile;
  const arrayindex = state.profiles.findIndex(profile => profile.id === updatedProfile.id);
  if (arrayindex !== -1) {
    const clonedArray = state.profiles.map(obj => ({ ...obj }));
    clonedArray[arrayindex] = updatedProfile;
    state.profiles = clonedArray;
  }
}

// websocket messages
export function chatSocketMessageUpdateOnlineStatus(state, payload) {
  const { message } = payload;
  const arrayindex = state.profiles.findIndex(profile => profile.id === message.profileId);
  if (arrayindex !== -1) {
    const clonedArray = state.profiles.map(obj => ({ ...obj }));
    clonedArray[arrayindex].online = message.online;
    // message.last_online is optional
    if (message.last_online) clonedArray[arrayindex].last_online = message.last_online;
    state.profiles = clonedArray;
  }
}

export function chatSocketMessageNewChatmassage(state, payload) {
  const { message } = payload;
  if (message.senderProfile.id === state.selectedProfileId) {
    state.chatMessages.push(message.chatmessage);
    state.chatScrollMessagesDown = { value: true };
  } else {
    // update total unread messages of sending profile
    const index = state.profiles.findIndex(profile => profile.id === message.senderProfile.id);
    if (index !== -1) {
      const clonedArray = state.profiles.map(obj => ({ ...obj }));
      clonedArray[index].relation_unread_messages_count = message.relation_unread_messages_count;
      state.profiles = clonedArray;
    }
  }
}

export function chatChatmessageSetReadPostServerResponse(state, payload) {
  // update chatmessage after server added read on dates
  let index = state.chatMessages.findIndex(chatMessage => chatMessage.id
    === payload.responseData.chatmessage.id);
  if (index !== -1) {
    const clonedArray = state.chatMessages.map(obj => ({ ...obj }));
    clonedArray[index] = payload.responseData.chatmessage;
    state.chatMessages = clonedArray;
    state.chatScrollMessagesDown = { value: true };
  }

  // update total unread messages of sending profile
  const { profileRelation } = payload.responseData;
  index = state.profiles.findIndex(profile => profile.id === profileRelation.related_profile_id);
  if (index !== -1) {
    const clonedArray = state.profiles.map(obj => ({ ...obj }));
    clonedArray[index]
      .relation_unread_messages_count = profileRelation.relation_unread_messages_count;
    state.profiles = clonedArray;
  }
}

// chat messages
export function chatChatMessageSend(state, payload) {
  state.chatMessages.push({
    profile_id_sender: payload.profileIdSender,
    profile_id_receiver: payload.profileIdReceiver,
    temporaryMessageId: payload.temporaryMessageId,
    messageText: payload.messageText,
  });
  state.chatScrollMessagesDown = { value: true };
}

export function chatChatSetMessageSendConfirmed(state, payload) {
  const arrayindex = state.chatMessages.findIndex(chatMessage => chatMessage.temporaryMessageId
    === payload.responseData.temporaryMessageId);
  if (arrayindex !== -1) {
    const clonedArray = state.chatMessages.map(obj => ({ ...obj }));
    clonedArray[arrayindex].send_at = payload.responseData.chatmessage.send_at;
    state.chatMessages = clonedArray;
    state.chatScrollMessagesDown = { value: true };
  }
}

export function chatSetFetchingChatMessages(state, payload) {
  if (payload.fetchingChatMessages) {
    state.fetchingChatMessages = true;
    state.counterFetchingChatMessages = payload.counterFetchingChatMessages;
  } else if (payload.counterFetchingChatMessages >= state.counterFetchingChatMessages) {
    state.fetchingChatMessages = false;
  }
}

export function chatSetChatmessagesFetchResult(state, payload) {
  if (payload.counterFetchingChatMessages === state.counterFetchingChatMessages) {
    if (Array.isArray(payload.responseData.chatmessages)) {
      state.chatMessages = [...payload.responseData.chatmessages];
      state.chatMessagesProfileIdSet = payload.profileIdReceiver;
      state.chatScrollMessagesDown = { value: true };

      // update profile unread messages counter
      const { profileRelation } = payload.responseData;
      const index = state.profiles
        .findIndex(profile => profile.id === profileRelation.related_profile_id);
      if (index !== -1) {
        const clonedArray = state.profiles.map(obj => ({ ...obj }));
        clonedArray[index]
          .relation_unread_messages_count = profileRelation.relation_unread_messages_count;
        state.profiles = clonedArray;
      }
    }
  }
}

export function chatClearChatMessagesFetchResult(state) {
  state.chatMessages = [];
  state.chatMessagesProfileIdSet = null;
}

export function chatChatMessagesSetError(state, payload) {
  const { errorTextArray } = payload;
  if (errorTextArray && errorTextArray.length) {
    errorTextArray.forEach(errorText => state.chatMessagesErrorList.push(errorText));
  }
}

export function chatChatMessagesResetErrorlist(state) {
  state.chatMessagesErrorList = [];
}

export function chatSetScrollMessagesDown(state, payload) {
  state.chatScrollMessagesDown = { value: payload.scrollDownValue };
}
export function chatSetProfileSetIsWriting(state, payload) {
  state.chatProfileSetIsWriting = { value: payload.isWriting };
}
