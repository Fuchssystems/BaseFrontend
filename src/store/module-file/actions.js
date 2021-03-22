export function fileAddTemporaryFile({ commit }, file) {
  commit('fileAddTemporaryFile', file);
}

export function fileUploadInitialize({ commit }, errorGroup) {
  commit('fileUploadInitialize', errorGroup);
}

export function fileSetimageCarouselSlideKey({ commit }, imageCarouselSlideKey) {
  commit('fileSetimageCarouselSlideKey', imageCarouselSlideKey);
}

export function fileSetSelected({ commit }, payload) {
  commit('fileSetSelected', payload);
}

export function fileSetSelectedAll({ commit }, payload) {
  commit('fileSetSelectedAll', payload);
}

export function fileDeleteFileArrayIds({ commit }, fileIdsArray) {
  commit('fileDeleteFileArrayIds', fileIdsArray);
}

export function fileMoveArrayElements({ commit }, fileIdsArray) {
  commit('fileMoveArrayElements', fileIdsArray);
}
