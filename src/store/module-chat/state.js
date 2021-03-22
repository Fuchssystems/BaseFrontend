import {
  CHAT_SEARCH_DISTANCE_MAX_KM,
  CHAT_SEARCH_AGE_MIN,
  CHAT_SEARCH_AGE_MAX,
} from './constants.js';

export default {
  searchFilter: {
    mode: 'profiles',
    all: false,
    name: '',
    genders: {
      male: true,
      female: true,
      diverse: true,
    },
    minAge: CHAT_SEARCH_AGE_MIN,
    maxAge: CHAT_SEARCH_AGE_MAX,
    distance: CHAT_SEARCH_DISTANCE_MAX_KM, // max. distance = all distances
    queryPage: 1,
  },
  profiles: [],
  paginationMetaProfiles: null,
  paginatePageNumberSelected: 1,
  selectedProfileId: null,
  selectedProfileIndex: -1,
  isFetching: false,
  searchNothingFound: false,
  fetchCounter: 0,
  errorList: [],

  // profile images
  profileImages: [],
  fetchingProfileImages: false,
  counterFetchingProfileImages: 0,
  profileHasNoImages: false,
  profileImagesSelectedId: null,
  profileImagesProfileIdSet: null,
  profileImagesErrorList: [],

  // profile chat messages
  chatMessages: [],
  chatMessagesProfileIdSet: null,
  fetchingChatMessages: false,
  counterFetchingChatMessages: 0,
  chatMessagesErrorList: [],
  chatScrollMessagesDown: {},
  chatProfileSetIsWriting: {},
};
