const resetErrorList = (oldErrorList, errorGroup) => {
  let newErrorList = [];
  if (errorGroup !== 'all') {
    newErrorList = oldErrorList.filter(error => error.errorGroup !== errorGroup);
  }
  return newErrorList;
};

export function setLanguageLocale(state, languageLocale) {
  state.languageLocale = languageLocale;
}

export function loginSuccess(state, payload) {
  state.languageLocale = payload.responseData.user.language;
  state.token = payload.responseData.token;
  state.user = payload.responseData.user;
  if (state.user.active_profile) state.user.active_profile_id = state.user.active_profile.id;
  state.session = payload.responseData.session;
  state.errorList = resetErrorList(state.errorList, 'all');
}

export function logoutSuccess(state) {
  state.user = {};
  state.user.active_profile_id = null;
  state.token = null;
  state.session = {};
}

export function userBackendCallSetError(state, payload) {
  const errorGroup = payload.errorGroup || 'all';
  if (payload.errorTextArray) {
    payload.errorTextArray.forEach(errorText => state.errorList.push({
      errorText,
      errorGroup,
    }));
  }
}

export function userBackendCallInitialize(state, errorGroupParameter) {
  const errorGroup = errorGroupParameter || 'all';
  state.errorList = resetErrorList(state.errorList, errorGroup);
}

export function userUpdateFieldsSuccess(state, payload) {
  state.languageLocale = payload.responseData.user.language;
  state.user = payload.responseData.user;
  state.errorList = resetErrorList(state.errorList, payload.errorGroup);
}

export function userPrefenceSet(state, payload) {
  if (!state.user.preferences) state.user.preferences = {};
  if (state.user && state.user.preferences) {
    state.user.preferences = { ...state.user.preferences, [payload.key]: payload.value };
    // state.user.preferences[payload.key] = payload.value;
  }
}
