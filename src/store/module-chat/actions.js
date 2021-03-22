export function chatRemoveProfilesFromSelection({ commit }, arrayProfileIds) {
  commit('chatRemoveProfilesFromSelection', arrayProfileIds);
}

export function chatSetSelectedProfileId({ commit }, id) {
  commit('chatSetSelectedProfileId', id);
}

export function chatSetSearchFilterAll({ commit }, all) {
  commit('chatSetSearchFilterAll', all);
}

export function chatSetSearchFilterName({ commit }, name) {
  commit('chatSetSearchFilterName', name);
}

export function chatSetSearchFilterMode({ commit }, mode) {
  commit('chatSetSearchFilterMode', mode);
}

export function chatSetSearchFilterToggleGender({ commit }, gender) {
  commit('chatSetSearchFilterToggleGender', gender);
}

export function chatSetSearchFilterDistance({ commit }, distance) {
  commit('chatSetSearchFilterDistance', distance);
}

export function chatSetSearchFilterAges({ commit }, ages) {
  commit('chatSetSearchFilterAges', ages);
}

export function chatClearSearchByFilterResult({ commit }, file) {
  commit('chatClearSearchByFilterResult', file);
}

export function chatResetErrorlist({ commit }, errorGroup) {
  commit('chatResetErrorlist', errorGroup);
}

// profile pagination
export function chatSetSearchFilterQueryPage({ commit }, queryPage) {
  commit('chatSetSearchFilterQueryPage', queryPage);
}

export function chatSetProfilesPageNumberSelected({ commit }, errorGroup) {
  commit('chatSetProfilesPageNumberSelected', errorGroup);
}

// profile images
export function chatClearProfileImagesFetchResult({ commit }, file) {
  commit('chatClearProfileImagesFetchResult', file);
}

export function chatProfileImagesResetErrorlist({ commit }, errorGroup) {
  commit('chatProfileImagesResetErrorlist', errorGroup);
}

export function chatSetSelectedProfileImageId({ commit }, id) {
  commit('chatSetSelectedProfileImageId', id);
}

// profile chat messages
export function chatChatMessageSend({ commit }, payload) {
  commit('chatChatMessageSend', payload);
}

export function chatClearChatMessagesFetchResult({ commit }) {
  commit('chatClearChatMessagesFetchResult');
}

export function chatchatMessagesResetErrorlist({ commit }, errorGroup) {
  commit('chatChatMessagesResetErrorlist', errorGroup);
}

export function chatSetScrollMessagesDown({ commit }, payload) {
  commit('chatSetScrollMessagesDown', payload);
}


export function chatSetProfileSetIsWriting({ commit }, payload) {
  commit('chatSetProfileSetIsWriting', payload);
}
