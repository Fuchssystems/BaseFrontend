// backend (laravel) requests (axios)

// cancel request: https://stackoverflow.com/questions/38329209/how-to-cancel-abort-ajax-request-in-axios

import { backendAxios } from './configBackend.js';
import { i18n } from '../boot/i18n.js';

export const backendRequest = function backendRequest(mode, URL, parameters, configObj) {
  const axiousConfig = {};
  axiousConfig.headers = {};
  axiousConfig.headers['X-localization'] = i18n.locale.substring(0, 2);
  if (configObj) {
    if (configObj.token) axiousConfig.headers.Authorization = `Bearer ${configObj.token}`;
    if (configObj.axiousCancelTokenSource) {
      axiousConfig.cancelToken = configObj.axiousCancelTokenSource.token;
    }
  }

  return backendAxios[mode](URL, parameters, axiousConfig)
    .then(response => response)
    .catch((e) => {
      // localize message
      let errorHandlingFinished = false;
      e.localizedMessagesArray = [];
      switch (URL) {
        case 'api/login':
          if (e.response && e.response.status && e.response.status === 401) {
            e.localizedMessagesArray.push(i18n.t('backend_error_login_unauthorized'));
            errorHandlingFinished = true;
          }
          break;
      }
      if (!errorHandlingFinished) {
        if (e.response && e.response.data && e.response.data.error) {
          const errorObjects = Object.values(e.response.data.error);
          const i18nMessageObj = i18n.messages[i18n.locale];
          errorObjects.forEach((errObj) => {
            errObj.forEach((errorText) => {
              if (i18nMessageObj[errorText]) errorText = i18n.t(errorText);
              e.localizedMessagesArray.push(errorText);
            });
          });
          errorHandlingFinished = true;
        }
      }

      if (!errorHandlingFinished) {
        if (e.message) {
          if (e.message === 'Network Error') {
            e.localizedMessagesArray.push(i18n.t('backend_error_Network_Error'));
            errorHandlingFinished = true;
          }
          if (!errorHandlingFinished) {
            e.localizedMessagesArray.push(e.message);
            errorHandlingFinished = true;
          }
        }
      }
      const errorToThrow = new Error();
      errorToThrow.localizedMessagesArray = e.localizedMessagesArray;
      errorToThrow.canceled = e.message && e.message === 'Canceled'; // axious request canceled by application

      console.log('throw error backend.js: e.response:');
      console.log(e.response);
      // if (!errorToThrow.canceled) debugger;

      throw errorToThrow;
    }); // bubble up error
};
