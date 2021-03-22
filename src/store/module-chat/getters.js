import { m } from '../../lib/i18nCustomFormatMessage';
import {
  CHAT_SEARCH_AGE_MAX,
  CHAT_SEARCH_DISTANCE_MAX_KM,
} from './constants.js';

export function getChatProfiles(state) {
  return state.profiles;
}

export function getChatSelectedProfile(state) {
  return state.selectedProfileIndex !== -1 ? state.profiles[state.selectedProfileIndex] : null;
}

export function getChatSelectedProfileId(state) {
  return state.selectedProfileId;
}

export function getChatSelectedProfileIndex(state) {
  return state.selectedProfileIndex;
}

export function getChatSearchFilter(state) {
  return state.searchFilter;
}

export function getChatSearchAgeMinLabel(state) {
  return m('chat_slider_ageMin_age_from', { min: state.searchFilter.minAge });
}

export function getChatSearchAgeMaxLabel(state) {
  if (state.searchFilter.maxAge < CHAT_SEARCH_AGE_MAX) {
    return m('chat_slider_ageMax_age_to', { max: state.searchFilter.maxAge, firstCharToUpper: false });
  }
  return m('chat_slider_ageMax_and_older', { max: state.searchFilter.maxAge, firstCharToUpper: false });
}

export function getChatSearchDistanceLabel(state) {
  return state.searchFilter.distance < CHAT_SEARCH_DISTANCE_MAX_KM ? `${state.searchFilter.distance} km` : m('chat_slider_distance_all_distances');
}

export function getChatIsFetching(state) {
  return state.isFetching;
}

export function getChatSearchNothingFound(state) {
  return state.searchNothingFound;
}

export function getChatProfileSetIsWriting(state) {
  return state.chatProfileSetIsWriting.value;
}

export function getChatErrorList(state) {
  return state.errorList;
}

// pagination profiles
export function getChatPaginationMetaProfiles(state) {
  return state.paginationMetaProfiles;
}

export function getChatPageSliderLabel(state) {
  if (state.paginationMetaProfiles && state.paginationMetaProfiles.last_page
    && state.paginationMetaProfiles.last_page > 1) {
    const from = (state.paginatePageNumberSelected - 1) * state.paginationMetaProfiles.per_page + 1;
    let to = 0;
    if (state.paginatePageNumberSelected < state.paginationMetaProfiles.last_page) {
      to = from - 1 + state.paginationMetaProfiles.per_page;
    } else { // last page selected
      to = from - 1
        + (state.paginationMetaProfiles.total % state.paginationMetaProfiles.per_page);
    }
    return m('app_search_label_paginator', {
      from,
      to,
      total: state.paginationMetaProfiles.total,
    });
  }
  return '';
}

export function getChatPaginationLastPage(state) {
  return state.paginationMetaProfiles && state.paginationMetaProfiles.last_page
    ? state.paginationMetaProfiles.last_page : 0;
}

export function getChatPaginatePageNumberSelected(state) {
  return state.paginatePageNumberSelected >= 1 ? state.paginatePageNumberSelected : 1;
}

// profile images
export function getChatProfileImagesErrorList(state) {
  return state.profileImagesErrorList;
}

export function getChatProfileImagesIsFetching(state) {
  return state.fetchingProfileImages;
}

export function getChatProfileImages(state) {
  return state.profileImages;
}

export function getChatProfileImagesSelectedId(state) {
  if (state.profileImagesSelectedId) return state.profileImagesSelectedId;
  return state.profileImages.length ? state.profileImages[0].id : null;
}

export function getChatProfileImagesProfileIdSet(state) {
  return state.profileImagesProfileIdSet;
}

export function getChatProfileImagesShowNoImagesFound(state) {
  return !state.fetchingProfileImages && !state.profileImages.length
    && (state.selectedProfileId === state.profileImagesProfileIdSet);
}

// chat messages
export function getChatChatMessages(state) {
  return state.chatMessages;
}

export function getChatChatMessagesIsFetching(state) {
  return state.fetchingChatMessages;
}

export function getChatChatMessagesProfileIdSet(state) {
  return state.chatMessagesProfileIdSet;
}

export function getChatChatMessagesErrorList(state) {
  return state.chatMessagesErrorList;
}

export function getChatSetScrollMessagesDown(state) {
  return state.chatScrollMessagesDown.value;
}

// videochat
export function getChatVCReceiverOnlineStatus(state) {
  let returnValue = '';
  // get selected profile
  const selectedProfile = state.selectedProfileIndex !== -1
    ? state.profiles[state.selectedProfileIndex] : null;
  if (selectedProfile && !selectedProfile.online) {
    returnValue = m('vcReceiverStatusDisplay_not_online');
  }
  return returnValue;
}
