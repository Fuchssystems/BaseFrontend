export function setLanguageLocale({ commit }, languageLocale) {
  commit('setLanguageLocale', languageLocale);
}

export function userBackendCallInitialize({ commit }, errorGroup) {
  commit('userBackendCallInitialize', errorGroup);
}

export function userBackendCallSetError({ commit }, errorGroup) {
  commit('userBackendCallSetError', errorGroup);
}

export function userPrefenceSet({ commit }, errorGroup) {
  commit('userPrefenceSet', errorGroup);
}
