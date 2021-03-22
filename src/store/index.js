import Vue from 'vue';
import Vuex from 'vuex';
import { VuexSaga } from 'vuex-coolstory';
import { SessionStorage } from 'quasar';
import { cloneDeep } from 'lodash';

import user from './module-user';
import profile from './module-profile';
import file from './module-file';
import payment from './module-payment';
import transaction from './module-transaction';
import feature from './module-feature';
import chat from './module-chat';
import videochat from './module-videochat';
import { userWatcher } from './module-user/sagas.js';
import { uploadWatcher } from './module-file/sagas.js';
import { transactionWatcher } from './module-transaction/sagas.js';
import { paymentWatcher } from './module-payment/sagas.js';
import { featureWatcher } from './module-feature/sagas.js';
import { chatWatcher } from './module-chat/sagas.js';
import { videochatWatcher } from './module-videochat/sagas.js';

const localStoreVersion = 57; // version number of localStore state format

// restore state from browser localStorage
const localStoreState = SessionStorage.getItem('store');
if (localStoreState) {
  if (localStoreVersion === localStoreState.version) {
    if (localStoreState.profile) profile.state = localStoreState.profile;
    if (localStoreState.user) user.state = localStoreState.user;
    if (localStoreState.payment) payment.state = localStoreState.payment;
    if (localStoreState.transaction) transaction.state = localStoreState.transaction;
    if (localStoreState.feature) feature.state = localStoreState.feature;
    if (localStoreState.file) file.state = localStoreState.file;
    if (localStoreState.chat) chat.state = localStoreState.chat;
    if (localStoreState.videochat) videochat.state = localStoreState.videochat;
    // file content image data not in localStoreState
    // file content reloaded in guestflow of module-user saga
  }
}

Vue.use(Vuex);

/*
 * If not building with SSR mode, you can
 * directly export the Store instantiation
 */

export default function (/* { ssrContext } */) {
  const Store = new Vuex.Store({
    modules: {
      user,
      profile,
      file,
      payment,
      transaction,
      feature,
      chat,
      videochat,
    },

    plugins: [
      VuexSaga({
        sagas: [
          userWatcher,
          uploadWatcher,
          transactionWatcher,
          paymentWatcher,
          featureWatcher,
          chatWatcher,
          videochatWatcher,
        ], // pass your sagas to plugin
      }),
    ],

    // enable strict mode (adds overhead!)
    // for dev mode only
    strict: process.env.DEV,
  });

  // Subscribe to store updates
  Store.subscribe((mutation, state) => {
    // remove profile image file content from state because of browser quota
    const stateLocalStorage = cloneDeep(state);
    stateLocalStorage.version = localStoreVersion;
    if (stateLocalStorage.file) {
      const activeProfileImageId = stateLocalStorage.profile
        && stateLocalStorage.profile.activeProfile
        && stateLocalStorage.profile.activeProfile.profileImage_id;
      const newFilesArray = [];
      if (activeProfileImageId) {
        const filesArray = stateLocalStorage.file.files;
        const arrIndex = filesArray.findIndex(f => f.id === activeProfileImageId);
        if (arrIndex !== -1) {
          newFilesArray.push(filesArray[arrIndex]);
        }
      }
      stateLocalStorage.file.files = newFilesArray;
    }
    SessionStorage.set('store', stateLocalStorage);
  });

  return Store;
}
