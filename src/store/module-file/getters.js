// get image file content of active profile id
export function getActiveProfileImageContent(state, getters) {
  let content = '';
  const activeProfile = getters.getActiveProfile;
  const imageId = activeProfile ? activeProfile.profileImage_id : null;
  if (imageId) {
    const arrIndex = state.files.findIndex(file => file.id === imageId);
    if (arrIndex !== -1) {
      content = state.files[arrIndex].filecontent;
    }
  }
  return content;
}

// get images files for profile without active profile image
export function getProfileImages(state, getters) {
  const profileImages = [...state.files];
  // remove active profile image from return array
  if (getters.getActiveProfileImageId) {
    const activeProfileImageId = getters.getActiveProfileImageId;
    const filesArray = Object.values(profileImages);
    const arrIndex = filesArray.findIndex((file) => {
      let returnValue = false;
      if (file.id) returnValue = file.id === activeProfileImageId;
      return returnValue;
    });
    if (arrIndex !== -1) {
      profileImages.splice(arrIndex, 1);
    }
  }
  return profileImages;
}

// get file uploading status with temporary file id
export function getFileProcessingStatusWithTemporaryFileId(state) {
  return (temporaryFileId) => {
    let isProcessing = false;
    const arrIndex = state.files.findIndex(file => file.temporaryFileId === temporaryFileId);
    if (arrIndex !== -1) {
      ({ isProcessing } = state.files[arrIndex]);
    }
    return isProcessing;
  };
}

// get file uploading status with key
export function getFileProcessingStatusWithKey(state) {
  return (key) => {
    let isProcessing = false;
    const arrIndex = state.files.findIndex(file => file.key === key);
    if (arrIndex !== -1) {
      ({ isProcessing } = state.files[arrIndex]);
    }
    return isProcessing;
  };
}

// get file selected status with key
export function getFileSelectedStatusWithKey(state) {
  return (key) => {
    let selected = false;
    const arrIndex = state.files.findIndex(file => file.key === key);
    if (arrIndex !== -1) {
      ({ selected } = state.files[arrIndex]);
    }
    return selected;
  };
}

export function getNumberOfSelectedFiles(state, getters) {
  let numberOfSelectedFiles = 0;
  const activeProfile = getters.getActiveProfile;
  const activeProfileImageId = activeProfile && activeProfile.profileImage_id;
  state.files.forEach((file) => {
    if (file.id !== activeProfileImageId && file.selected) numberOfSelectedFiles += 1;
  });
  return numberOfSelectedFiles;
}


export function getSelectedFilesIds(state) {
  const arraySelectedFilesIds = [];
  state.files.forEach((file) => {
    if (file.selected) arraySelectedFilesIds.push(file.id);
  });
  return arraySelectedFilesIds;
}

export function getImageCarouselSlideKey(state, getters) {
  let returnKey = null;
  const currentKey = state.imageCarouselSlideKey;
  const profileImages = getters.getProfileImages;
  if (profileImages.length) {
    if (currentKey) {
      const arrIndex = profileImages.findIndex(file => file.key === currentKey);
      if (arrIndex !== -1) {
        returnKey = currentKey;
      }
    }
    if (!returnKey) returnKey = profileImages[0].key;
  }
  return returnKey;
}

export function getFileErrorlist(state) {
  // get all errors
  const errorTextArray = [];
  state.errorList.forEach(error => errorTextArray.push(error.errorText));
  return errorTextArray;
}

export function getFilesAreLoading(state) {
  // return status files are loading
  return state.filesAreLoading;
}
