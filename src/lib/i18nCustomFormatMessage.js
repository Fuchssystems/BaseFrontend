// customized i18n format message


import { i18n } from '../boot/i18n.js';

const m = (messageId, parameterObjReceived) => {
  let localizedMessage = '';
  if (parameterObjReceived) {
    const messages = i18n.messages[i18n.locale];
    const parameterObjExtended = parameterObjReceived;
    if (parameterObjExtended.count && parameterObjExtended.count > 1) { // plural
      const messageIdPlural = `${messageId}_plural`;
      if (messages[messageIdPlural]) messageId = messageIdPlural;
    }
    if (parameterObjExtended.field) {
      const { field } = parameterObjExtended;
      // parameterObjExtended.fieldName = messages[field];
      // parameterObjExtended.fieldNamePlural = messages[`${field}_plural`];
      // parameterObjExtended.fieldGender = messages[`${field}_gender`];
      parameterObjExtended.fieldNameAkkusativSingular = messages[`${field}_akkusativSingular`];
    }
    if (parameterObjExtended.recordname) {
      const { recordname } = parameterObjExtended;
      if (!parameterObjExtended.count) { // no pluralisation
        parameterObjExtended.recordname_selected_number = messages[`recordname_${recordname}_selected_number`];
        parameterObjExtended.recordname = messages[`recordname_${recordname}`];
        parameterObjExtended.recordnames = messages[`recordname_${recordname}_plural`]; // Example: Keine Profile gefunden
      } else if (parameterObjExtended.count === 1) {
        parameterObjExtended.recordname_selected_number = messages[`recordname_${recordname}_selected_number_singular`];
        parameterObjExtended.recordname = messages[`recordname_${recordname}_singular`];
      } else { // plural with count > 1
        parameterObjExtended.recordname_selected_number = messages[`recordname_${recordname}_selected_number_plural`];
        parameterObjExtended.recordname = messages[`recordname_${recordname}_plural`];
      }
    }
    localizedMessage = i18n.t(messageId, parameterObjExtended);
    if (parameterObjExtended.count) localizedMessage = localizedMessage.replace('{count}', parameterObjExtended.count);
    const firstCharToUpper = !!parameterObjExtended.firstCharToUpper;
    if (localizedMessage && firstCharToUpper) localizedMessage = `${localizedMessage.charAt(0).toUpperCase()}${localizedMessage.slice(1)}`;
  } else {
    localizedMessage = i18n.t(messageId);
  }

  return localizedMessage;
};

export { m };
