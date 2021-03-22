export function paymentSetmessage(state, messageTextArray) {
  if (messageTextArray.length) {
    messageTextArray.forEach(messageText => state.messageList.push(messageText));
  }
}

export function paymentBackendCallSetError(state, payload) {
  const { errorTextArray } = payload;
  if (errorTextArray.length) {
    errorTextArray.forEach(errorText => state.errorList.push(errorText));
  }
}
export function resetPaymentMessageErrorLists(state) {
  state.messageList = [];
  state.errorList = [];
}
