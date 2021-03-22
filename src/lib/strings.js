// string utility functions

import { i18n } from '../boot/i18n.js';

const strCountCharInStr = (inputString, charToCount) => {
  let counter = 0;
  for (let i = 0; i < inputString.length; i += 1) {
    if (inputString[i] === charToCount) counter += 1;
  }
  return counter;
};

// convert localizes number string to float
export const strLocalizedStringToFloat = function strLocalizedStringToNumber(localizedString) {
  let convertedFloat = 0;
  if (localizedString && (typeof (localizedString) !== 'number')) {
    // if user entered a thousand seperator and no decimal point:
    // if only 1 thousand seperator, convert to decimal point
    const thousendSeperator = i18n.t('app_locale_thousandsSeperator');
    const decimalPoint = i18n.t('app_locale_decimalPoint');
    if (strCountCharInStr(localizedString, thousendSeperator) === 1) {
      if (localizedString.indexOf(decimalPoint) === -1) {
        localizedString = localizedString.replace(thousendSeperator, decimalPoint);
      }
    }
    convertedFloat = parseFloat(localizedString.replace(thousendSeperator, '')
      .replace(decimalPoint, '.'));
  }
  if (Number.isNaN(convertedFloat)) convertedFloat = 0;
  return convertedFloat;
};
