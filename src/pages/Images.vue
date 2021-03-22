<template>
  <q-page padding>
    <div class="div-profile-images" v-if='getUserPreference("profileImagesTab")==="administration"'>
      <form @submit.prevent="submitForm">
        <input id='inputImageFilesSelection'
          type='file'
          multiple
          accept='image/*'
          ref='inputImageFilesSelection'
          v-bind:style="{display: 'none'}"
          @change='upload'
        />

        <div class="row q-mb-md items-start" style="margin-top:30px">
          <q-btn class='col'
            style='max-width: 156px'
            color="primary"
            icon="cloud_upload"
            :label='$t("profile_images_button_inputFiles")'
            @click='$refs.inputImageFilesSelection.click();'
          />
         <q-btn class="q-ml-md col"
            style='max-width: 120px'
            color="secondary"
            icon="mdi-check-all"
            :label='$t("profile_images_button_selectAll")'
            :disable='getNumberOfSelectedFiles === getProfileImages.length'
            @click="fileSetSelectedAll(true)"
          />
          <q-btn class="q-ml-md col"
            style='max-width: 180px'
            color="secondary"
            icon="mdi-minus"
            :label='$t("profile_images_button_deslectAll")'
            :disable='!getNumberOfSelectedFiles'
            @click="fileSetSelectedAll(false)"
          />
          <q-btn class="q-ml-md col"
            style='max-width: 160px'
            color="warning"
            icon="delete_forever"
            :label='$t("app_button_Delete") +
              (getNumberOfSelectedFiles ? " ("+getNumberOfSelectedFiles+")" : "")'
            :disable='!getNumberOfSelectedFiles'
            @click="showConfirmDelete = true"
          />
        </div>

        <error-row-card :errorList="getFileErrorlist" />

        <q-skeleton height='120px' v-if='getFilesAreLoading' />

        <div class="row q-gutter-md items-start">
          <q-img
            v-for="(image, index) in getProfileImages" :image='image' :key="image.key"
            :src='image.filecontent'
            spinner-color="white"
            style="max-height: 180px; max-width: 180px"
            @click='onImageClicked({ key: image.key, selected: image.selected })'
            draggable
            @dragstart='dragStart(image.key, index, $event)' @dragover.prevent
            @dragenter='dragEnter(image.key, index, $event)'
            @dragleave='dragLeave(image.key, index, $event)'
            @drop='dragDrop(image.key, index, image.id, $event)'
          >
            <div class="absolute-full flex flex-center"
              v-if='getFileProcessingStatusWithKey(image.key)'
            >
              <q-spinner
                color="primary"
                size="3em"
              />
            </div>
            <div class="absolute-full flex flex-center"
              v-if='getFileSelectedStatusWithKey(image.key)'
            >
              <q-icon name="mdi-check-bold" size="xl" />
            </div>
          </q-img>
        </div>

        <confirm-yes-no
          :propShow='showConfirmDelete'
          :propConfirmMessage='m("app_confirm_Really_delete_number_of_recordnames",
            { recordname: "Picture", count: getNumberOfSelectedFiles })'
          propIconMessage='mdi-account-question-outline'
          :propOkButtonLabel='$t("app_button_Delete")'
          @confirmed='deleteImages'
          @hide='showConfirmDelete = false'
          :key='showConfirmDelete'
        />
      </form>
    </div>

    <div class="div-carousel" v-if='getUserPreference("profileImagesTab")==="carousel"'>
      <div class="q-pa-md">
        <q-carousel
          swipeable
          animated
          arrows
          :value='getImageCarouselSlideKey'
          :fullscreen.sync="carouselFullscreen"
          infinite
          @input='fileSetimageCarouselSlideKey'
          height='480px'
        >
          <q-carousel-slide
            v-for="image in getProfileImages" :image='image' :key="image.key"
            :name="image.key"
            :img-src='image.filecontent'
          />

          <template v-slot:control>
            <q-carousel-control
              position="bottom-right"
              :offset="[18, 18]"
            >
              <q-btn
                push round dense color="white" text-color="primary"
                :icon="carouselFullscreen ? 'fullscreen_exit' : 'fullscreen'"
                @click="carouselFullscreen = !carouselFullscreen"
              />
            </q-carousel-control>
          </template>
        </q-carousel>
      </div>
    </div>

    <q-page-sticky expand position="top">
      <div class="q-gutter-y-md" style="width: 100%">
        <q-tabs
          :value='getUserPreference("profileImagesTab")'
          no-caps
          inline-label
          align="left"
          class="bg-teal text-white shadow-2"
          :breakpoint="0"
          @input="onTabValueChange"
        >
          <q-tab name="administration" icon="far fa-file-image"
            :label='$t("profile_images_tab_admister")' />
          <q-tab name="carousel" icon="far fa-image"
            :label='$t("profile_images_tab_carousel")'
            :disable='!getProfileImages.length' />
        </q-tabs>
      </div>
    </q-page-sticky>
  </q-page>
</template>

<script>
import { polyfill } from 'mobile-drag-drop';
import { scrollBehaviourDragImageTranslateOverride } from 'mobile-drag-drop/scroll-behaviour';
import { mapGetters, mapActions } from 'vuex';
import { mapSagaActions } from 'vuex-coolstory';
import ErrorRowCard from 'components/Cards/ErrorRowCard.vue';
import ConfirmYesNo from 'components/Dialogs/ConfirmYesNo.vue';
import {
  UPLOAD_REQUESTING,
  LOAD_ALL_PROFILE_FILES,
  DELETE_FILES_REQUESTING,
  CHANGE_FILE_SORTORDER_REQUESTING,
} from '../store/module-file/constants.js';
import { USER_UPDATE_FIELDS_SILENT } from '../store/module-user/constants.js';
import { m } from '../lib/i18nCustomFormatMessage.js';

export default {
  name: 'Images',
  data() {
    return {
      carouselFullscreen: false,
      showConfirmDelete: false,
      dragStartImageKey: '',
      dragStartImageIndex: -1,
    };
  },
  methods: {
    upload(e) {
      if (e.target.files.length) {
        this.fileUploadInitialize(); // clear all error messages
        const filesArray = Object.values(e.target.files);
        filesArray.forEach((file) => {
          file.temporaryFileId = `${file.name}${Date.now()}`;
          file.isProfileImage = false;
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = (readerEvent) => {
            // add temporary file to store
            const temporaryFile = file;
            temporaryFile.temporaryFileId = file.temporaryFileId;
            temporaryFile.nameWithExtension = file.name;
            temporaryFile.filecontent = readerEvent.target.result;
            temporaryFile.isProcessing = true;
            temporaryFile.isProfileImage = false;
            this.fileAddTemporaryFile(temporaryFile);

            // dispatch to saga
            this[UPLOAD_REQUESTING]({
              file,
              filecontent: readerEvent.target.result,
              profileId: this.$store.state.profile.activeProfile
                && this.$store.state.profile.activeProfile.id,
              temporaryFileId: file.temporaryFileId,
              isProfileImage: false,
              token: this.getUserToken,
              onSuccessNotification:
                this.m('backend_notification_recordname_uploaded_sucessfully',
                  { recordname_singular: this.m('recordname_profilePicture_singular') }),
              onSuccessNotificationParameter: { recordname_profilePicture_singular: '' },
            });
          };
        });
        // clear input files array in case next selection is same
        this.$refs.inputImageFilesSelection.value = null;
      }
    },
    onTabValueChange(newTab) {
      this.userPrefenceSet({
        key: 'profileImagesTab',
        value: newTab,
      });
      // save user preferences in backend
      this[USER_UPDATE_FIELDS_SILENT](
        {
          fields: { user: { preferences: this.getUserPreferenceObject } },
          token: this.getUserToken,
        },
      );
    },
    onImageClicked(objKeyCurrentSelected) {
      // toggle selected status
      this.fileSetSelected({
        key: objKeyCurrentSelected.key,
        selected: !objKeyCurrentSelected.selected,
      });
    },
    deleteImages() {
      if (this.getSelectedFilesIds.length) {
        this.fileUploadInitialize(); // clear all error messages
        this[DELETE_FILES_REQUESTING]({
          arrayFileIds: this.getSelectedFilesIds,
          token: this.getUserToken,
          onSuccessNotificationId: 'backend_notification_count_recordnames_deleted_sucessfully',
          onSuccessNotificationParameter: { recordname: 'picture' },
        });
        this.fileDeleteFileArrayIds(this.getSelectedFilesIds);
      }
    },
    dragStart(key, index, event) {
      event.dataTransfer.dropEffect = 'move';
      this.dragStartImageKey = key;
      this.dragStartImageIndex = index;
    },
    dragEnter(key, index, event) {
      event.preventDefault(); // required by mobile-drag-drop polyfill
      if (key !== this.dragStartImageKey && index !== this.dragStartImageIndex + 1) event.target.classList.add('drag-target');
    },
    dragLeave(key, index, event) {
      if (key !== this.dragStartImageKey && index !== this.dragStartImageIndex + 1) event.target.classList.remove('drag-target');
    },
    dragDrop(key, index, fileId, event) {
      if (key !== this.dragStartImageKey && index !== this.dragStartImageIndex + 1) {
        event.target.classList.remove('drag-target');
        this.fileMoveArrayElements({ fromKey: this.dragStartImageKey, toKey: key });
        this[CHANGE_FILE_SORTORDER_REQUESTING]({
          fileId: this.dragStartImageKey,
          newSortValue: this.dragStartImageIndex < index ? index - 1 : index,
          oldSortValue: this.dragStartImageIndex,
          token: this.getUserToken,
        });
      }
    },
    ...mapSagaActions([
      UPLOAD_REQUESTING,
      LOAD_ALL_PROFILE_FILES,
      USER_UPDATE_FIELDS_SILENT,
      DELETE_FILES_REQUESTING,
      CHANGE_FILE_SORTORDER_REQUESTING,
    ]),
    ...mapActions([
      'fileUploadInitialize',
      'fileAddTemporaryFile',
      'userPrefenceSet',
      'fileSetimageCarouselSlideKey',
      'fileSetSelected',
      'fileSetSelectedAll',
      'fileDeleteFileArrayIds',
      'fileMoveArrayElements',
    ]),
    m, // custimized 18n.t
  },
  computed: {
    ...mapGetters([
      'getFileErrorlist',
      'getUserToken',
      'getProfileImages',
      'getActiveProfileImageId',
      'getFileProcessingStatusWithKey',
      'getUserPreference',
      'getUserPreferenceObject',
      'getImageCarouselSlideKey',
      'getFileSelectedStatusWithKey',
      'getNumberOfSelectedFiles',
      'getSelectedFilesIds',
      'getFilesAreLoading',
    ]),
  },
  created() {
    polyfill({ dragImageTranslateOverride: scrollBehaviourDragImageTranslateOverride });

    // clear error messages left from prior login or register pages
    this.fileUploadInitialize(); // clear all error messages
    // fetch profile images
    const activeProfileId = this.$store.state.profile.activeProfile
        && this.$store.state.profile.activeProfile.id;
    if (activeProfileId) {
      this[LOAD_ALL_PROFILE_FILES]({
        profileId: activeProfileId,
        activeProfileImageId: this.getActiveProfileImageId,
        token: this.getUserToken,
      });
    }
  },
  components: {
    'confirm-yes-no': ConfirmYesNo,
    'error-row-card': ErrorRowCard,
  },
};
</script>

<style scoped>
  .div-profile-images {
    margin: 0px auto;
    padding: 16px 16px 1px;
  }
  .div-carousel {
    margin: 10px auto 4px;
    padding: 16px 16px 1px;
  }
  .q-layout-padding {
    padding: 16px 2px;
  }
  .drag-target {
    border-style: solid;
    border-width: 3px;
    border-color: red;
    background-color: black;
    opacity: 0.5;
  }
</style>
