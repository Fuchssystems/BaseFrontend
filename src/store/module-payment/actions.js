export function paymentSetmessage({ commit }, messageText) {
  commit('paymentSetmessage', messageText);
}

export function resetPaymentMessageErrorLists({ commit }) {
  commit('resetPaymentMessageErrorLists');
}

export function paymentBackendCallSetError({ commit }) {
  commit('paymentBackendCallSetError');
}
