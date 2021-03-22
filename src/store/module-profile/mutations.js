export function profileSetData(state, payload) {
  state.profiles = payload.responseData.profiles;
  if (state.profiles && state.profiles.length) {
    [state.activeProfile] = state.profiles; // assignment of arrayindex 0
  } else {
    state.activeProfile = null;
  }
}

export function profileUpdate1Profile(state, payload) {
  const newProfile = payload.responseData.profile;
  if (newProfile) {
    const arrIndex = state.profiles.findIndex(p => p.id === newProfile.id);
    if (arrIndex !== -1) {
      state.profiles[arrIndex] = newProfile;
    }
    state.activeProfile = newProfile;
  }
}

export function profileUnsetData(state) {
  state.profiles = {};
  state.activeProfile = null;
}

export function profileActiveProfileSetUnreadMessageCount(state,
  payload) {
  if (state.activeProfile) {
    state = { ...state };
    state.activeProfile.unread_messages_count = payload
      .receiverProfileUnreadMessagesCount;
  }
}
