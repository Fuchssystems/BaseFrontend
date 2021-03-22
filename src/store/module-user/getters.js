import { i18n } from '../../boot/i18n.js';

const preferencesDefaults = {
  chatSearchModeTab: 'profiles',
  profileImagesTab: 'administration',
  // videochat
  showMyVido: true,
  remoteAudioMuted: false,
  divPositionMyVideo: {
    top: 100,
    left: 200,
  },
  showDebugConsole: false,
};

export function getUser(state) {
  return state.user;
}

export function getUserId(state) {
  return state.user.id;
}

export function getUserLanguageLocale(state) {
  return state.languageLocale;
}

export function getUserLanguageShort(state) {
  return state.languageLocale.substring(0, 2);
}

export function getUserToken(state) {
  return state.token;
}

export function getUserSessionId(state) {
  return state.session && state.session.id;
}

export function getUserIsGuest(state) {
  return state.user.guest;
}

export function getIsLoggedIn(state) {
  return state.token && !state.user.guest;
}

export function getUserActiveProfileId(state) {
  return state.user.active_profile_id;
}
export function getUserName(state) {
  let userName = '';
  if (state.token) {
    userName = state.user.guest ? i18n.t('app_guest_Name') : state.user.name;
  }
  return userName;
}


export function getErrorlist(state) {
  // get all errors
  const errorTextArray = [];
  state.errorList.forEach(error => errorTextArray.push(error.errorText));
  return errorTextArray;
}

export function getErrorGroup(state) {
  return (errorGroup) => {
    // get only errors of a group
    const errorTextArray = [];
    state.errorList.forEach((error) => {
      if (error.errorGroup === errorGroup) {
        errorTextArray.push(error.errorText);
      }
    });
    return errorTextArray;
  };
}

export function getUserPreferenceObject(state) {
  return state.user.preferences;
}

export function getUserPreference(state) {
  return (key) => {
    const propertyIsDefined = state.user.preferences && state.user.preferences[key];
    const returnValue = propertyIsDefined
      ? state.user.preferences[key] : preferencesDefaults[key];
    return returnValue;
  };
}

export function getUserPreferenceChatSearchMode(state) {
  return (state.user.preferences && state.user.preferences.chatSearchModeTab)
    ? state.user.preferences.chatSearchModeTab : preferencesDefaults.chatSearchModeTab;
}

export function getUserPreferenceChatSearchModeIsProfiles(state) {
  if (!(state.user.preferences && state.user.preferences.chatSearchModeTab)) {
    return true;
  }
  return !!(state.user.preferences.chatSearchModeTab === 'profiles');
}

// videochat
export function getUserVCPostionMyVideo(state) {
  // parametername example: divPositionMyVideo_1920x1280
  const propertyname = `divPositionMyVideo_${window.screen.width}x${window.screen.height}`;
  let returnDefault = true;
  if (state.user.preferences && state.user.preferences[propertyname]) {
    const postition = state.user.preferences[propertyname];
    if (postition.top >= 100 && postition.top < (window.screen.height - 30)
      && postition.left >= 0 && postition.left < (window.screen.width + 100)) {
      returnDefault = false;
    }
  }
  return returnDefault ? preferencesDefaults.divPositionMyVideo
    : state.user.preferences[propertyname];
}

export function getUserVCPreferenceShowMyVideo(state) {
  return (state.user.preferences && Object.prototype.hasOwnProperty.call(state.user.preferences, 'showMyVido'))
    ? state.user.preferences.showMyVido
    : preferencesDefaults.showMyVido;
}

export function getUserVCPreferenceRemoteAudioMuted(state) {
  return (state.user.preferences && Object.prototype.hasOwnProperty.call(state.user.preferences, 'remoteAudioMuted'))
    ? state.user.preferences.remoteAudioMuted
    : preferencesDefaults.remoteAudioMuted;
}

export function getUserVCPreferenceShowDebugConsole(state) {
  return (state.user.preferences && Object.prototype.hasOwnProperty.call(state.user.preferences, 'showDebugConsole'))
    ? state.user.preferences.showDebugConsole
    : preferencesDefaults.showDebugConsole;
}
