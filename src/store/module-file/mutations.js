export function fileAddOrReplaceFile(state, payload) {
  if (payload.oldProfileImageId) {
    const arrIndex = state.files.findIndex(file => file.id === payload.oldProfileImageId);
    if (arrIndex !== -1) {
      state.files.splice(arrIndex, 1);
    }
  }
  if (payload.responseData.file) {
    // remove array element with same file.id if exists
    const arrIndex = state.files.findIndex(file => file.id === payload.responseData.file.id);
    if (arrIndex !== -1) {
      state.files.splice(arrIndex, 1);
    }

    state.files.push({
      ...payload.responseData.file,
      key: `${payload.responseData.file.id}${payload.responseData.file.isProfileImage ? ' profileImage' : ''}`,
      selected: false,
    });
  }
}

export function fileReplaceAllFiles(state, payload) {
  if (payload.responseData.files) {
    // remove all array elements except active profile id
    for (let i = state.files.length - 1; i >= 0; i -= 1) {
      if (state.files[i].id !== payload.activeProfileImageId) state.files.splice(i, 1);
    }

    const fileArray = payload.responseData.files;
    fileArray.forEach((payloadFile) => {
      state.files.push({
        ...payloadFile,
        key: `${payloadFile.id}${payloadFile.isProfileImage ? ' profileImage' : ''}`,
        selected: false,
      });
    });
  }
}

export function fileDeleteFile(state, payload) {
  if (payload.fileId) {
    const arrIndex = state.files.findIndex(file => file.id === payload.fileId);
    if (arrIndex !== -1) {
      state.files.splice(arrIndex, 1);
    }
  }
}

export function fileDeleteFileArrayIds(state, fileIdsArray) {
  fileIdsArray.forEach((id) => {
    const arrIndex = state.files.findIndex(file => file.id === id);
    if (arrIndex !== -1) {
      state.files.splice(arrIndex, 1);
    }
  });
}

// add temporary file to upload
export function fileAddTemporaryFile(state, payload) {
  state.files.push({
    ...payload,
    key: payload.temporaryFileId,
    selected: false,
  });
}

// delete temporary file after upload
export function fileDeleteTemporaryFile(state, payload) {
  if (payload.temporaryFileId) {
    const arrIndex = state.files.findIndex((file) => {
      let returnValue = false;
      if (file.temporaryFileId) returnValue = file.temporaryFileId === payload.temporaryFileId;
      return returnValue;
    });
    if (arrIndex !== -1) {
      state.files.splice(arrIndex, 1);
    }
  }
}

const resetErrorList = (oldErrorList, errorGroup) => {
  let newErrorList = [];
  if (errorGroup !== 'all') {
    newErrorList = oldErrorList.filter(error => error.errorGroup !== errorGroup);
  }
  return newErrorList;
};

export function fileUploadInitialize(state, errorGroupParameter) {
  const errorGroup = errorGroupParameter || 'all';
  state.errorList = resetErrorList(state.errorList, errorGroup);
}

export function fileUploadSetError(state, payload) {
  const errorGroup = payload.errorGroup || 'all';
  if (payload.errorTextArray) {
    payload.errorTextArray.forEach(errorText => state.errorList.push({
      errorText,
      errorGroup,
    }));
  }
}

export function fileSetimageCarouselSlideKey(state, imageCarouselSlideKey) {
  state.imageCarouselSlideKey = imageCarouselSlideKey;
}

export function fileSetSelected(state, payload) {
  const arrIndex = state.files.findIndex(file => file.key === payload.key);
  if (arrIndex !== -1) {
    state.files[arrIndex].selected = payload.selected;
  }
}

export function fileSetSelectedAll(state, selected) {
  state.files.forEach((file) => { file.selected = selected; });
}

// reorder array elements (after drag & drop)
export function fileMoveArrayElements(state, payload) {
  let fromIndex = state.files.findIndex(file => file.key === payload.fromKey);
  const toIndex = state.files.findIndex(file => file.key === payload.toKey);
  if (fromIndex !== -1 && toIndex !== -1) {
    state.files.splice(toIndex, 0, { ...state.files[fromIndex] });
    if (fromIndex > toIndex) fromIndex += 1;
    state.files.splice(fromIndex, 1);
  }
}

export function fileSetFilesAreLoading(state, payload) {
  state.filesAreLoading = payload.filesAreLoading;
}
