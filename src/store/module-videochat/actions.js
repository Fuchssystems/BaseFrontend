export function vcInitComponent({ commit }) {
  commit('vcInitComponent');
}

export function vcSetCall({ commit }, payload) {
  commit('vcSetCall', payload);
}

export function vcSetCallerStatus({ commit }, status) {
  commit('vcSetCallerStatus', status);
}

export function vcSetWebRTCstatus({ commit }, status) {
  commit('vcSetWebRTCstatus', status);
}

export function vcSetModeUseReceivedProfile({ commit }, payload) {
  commit('vcSetModeUseReceivedProfile', payload);
}

export function vcSetError({ commit }, payload) {
  commit('vcSetError', payload);
}

export function vcResetErrorlist({ commit }) {
  commit('vcResetErrorlist');
}
