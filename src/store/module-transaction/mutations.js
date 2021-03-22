export function transactionBackendCallSetError(state, payload) {
  const { errorTextArray } = payload;
  if (errorTextArray.length) {
    errorTextArray.forEach(errorText => state.errorList.push(errorText));
  }
}

export function transactionSetLoading(state, payload) {
  state.loading = payload.loading;
}

export function transactionSetData(state, payload) {
  state.transactions = payload.responseData.payments;
}

export function transactionsResetErrorlist(state) {
  state.errorList = [];
}
