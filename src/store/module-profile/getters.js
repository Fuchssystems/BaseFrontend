// get active profile
export function getActiveProfile(state) {
  return state.activeProfile;
}

export function getActiveProfileId(state) {
  return state.activeProfile.id;
}

export function getActiveProfileImageId(state) {
  return state.activeProfile ? state.activeProfile.profileImage_id : null;
}

export function getActiveProfileUnreadMessagesCount(state) {
  return state.activeProfile ? state.activeProfile.unread_messages_count : null;
}
