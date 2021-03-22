<template>
  <q-page padding>
    <q-card class="input-card">
      <form @submit.prevent="submitForm">
        <input id='inputImageFileSelection'
          type='file'
          accept='image/*'
          ref='inputImageFileSelection'
          v-bind:style="{display: 'none'}"
          @change='upload'
        />
        <div class="row q-mb-md">
          <q-banner class="bg-grey-3 col">
            <template v-slot:avatar>
              <q-icon name="portrait" color="primary" />
            </template>
            {{ $t('profile_profilePicture_title') }}
          </q-banner>
        </div>

        <div class="row q-mb-md items-start">
          <q-btn
            color="primary"
            icon="cloud_upload"
            :label='getActiveProfileImageContent
              ? $t("profile_profilePicture_button_changeFile_label")
              : $t("profile_profilePicture_button_selectFile_label")'
            :disable='getFileProcessingStatusWithTemporaryFileId(temporaryFileId)'
            @click='$refs.inputImageFileSelection.click();'
          />
         <q-btn class="q-ml-md"
            color="secondary"
            icon="delete_forever"
            :label='$t("profile_profilePicture_button_deleteFile_label")'
            :disable='!getActiveProfileImageId
              || getFileProcessingStatusWithTemporaryFileId(temporaryFileId)'
            @click="showConfirmDelete = true"
          />
        </div>

        <div class="row q-mb-md"
          v-if='localFileContent'
        >
          <q-img
            :src='localFileContent'
            spinner-color="white"
            style="max-height: 200px; max-width: 200px"
          >
            <div class="absolute-full flex flex-center"
              v-if='getFileProcessingStatusWithTemporaryFileId(temporaryFileId)'
            >
              <q-spinner
                color="primary"
                size="3em"
              />
            </div>
          </q-img>
        </div>
        <div class="row q-mb-md"
          v-if='!localFileContent && getActiveProfileImageContent'
        >
          <q-img
            :src='getActiveProfileImageContent'
            spinner-color="white"
            style="max-height: 200px; max-width: 200px"
          >
            <div class="absolute-full flex flex-center"
              v-if='getFileProcessingStatusWithTemporaryFileId(temporaryFileId)'
            >
              <q-spinner
                color="primary"
                size="3em"
              />
            </div>
          </q-img>
        </div>

        <confirm-yes-no
          :propShow='showConfirmDelete'
          :propConfirmMessage='m("app_confirm_Really_delete_recordname",
            { recordname_nominativSingular:
            $t("recordname_profilePicture_nominativSingular") })'
          propIconMessage='mdi-account-question-outline'
          :propOkButtonLabel='$t("app_button_Delete")'
          @confirmed='deleteImage'
          @hide='showConfirmDelete = false'
          :key='showConfirmDelete'
        />
        <error-row-card :errorList="getFileErrorlist" />
      </form>
    </q-card>
  </q-page>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import { mapSagaActions } from 'vuex-coolstory';
import ErrorRowCard from 'components/Cards/ErrorRowCard.vue';
import ConfirmYesNo from 'components/Dialogs/ConfirmYesNo.vue';
import { UPLOAD_REQUESTING, DELETE_FILE_REQUESTING } from '../store/module-file/constants.js';
import { m } from '../lib/i18nCustomFormatMessage.js';

export default {
  name: 'ProfilePicture',
  data() {
    return {
      localFileContent: '',
      temporaryFileId: null,
      showConfirmDelete: false,
    };
  },
  methods: {
    upload(e) {
      if (e.target.files.length) {
        this.fileUploadInitialize(); // clear all error messages

        const file = e.target.files[0];
        this.temporaryFileId = Date.now();
        file.temporaryFileId = this.temporaryFileId;
        file.isProfileImage = true;
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
          this.localFileContent = readerEvent.target.result;
          this[UPLOAD_REQUESTING]({
            file,
            filecontent: this.localFileContent,
            profileId: this.$store.state.profile.activeProfile
              && this.$store.state.profile.activeProfile.id,
            temporaryFileId: this.temporaryFileId,
            isProfileImage: true,
            oldProfileImageId: this.getActiveProfileImageId,
            token: this.getUserToken,
            onSuccessNotification: this.m('backend_notification_recordname_uploaded_sucessfully',
              { recordname_singular: this.m('recordname_profilePicture_singular') }),
            onSuccessNotificationParameter: { recordname_profilePicture_singular: '' },
          });
        };
      }
    },
    deleteImage() {
      if (this.getActiveProfileImageId) {
        this.fileUploadInitialize(); // clear all error messages
        this.temporaryFileId = null;
        this.localFileContent = '';
        this[DELETE_FILE_REQUESTING]({
          fileId: this.getActiveProfileImageId,
          token: this.getUserToken,
          onSuccessNotification: this.m('backend_notification_recordname_deleted_sucessfully',
            { recordname_singular: this.m('recordname_profilePicture_singular') }),
          onSuccessNotificationParameter: { recordname_profilePicture_singular: '' },
        });
      }
    },
    ...mapActions(['fileAddTemporaryFile', 'fileUploadInitialize']),
    ...mapSagaActions([UPLOAD_REQUESTING, DELETE_FILE_REQUESTING]),
    m, // custimized 18n.t
  },
  computed: {
    ...mapGetters([
      'getFileErrorlist',
      'getUserToken',
      'getFileProcessingStatusWithTemporaryFileId',
      'getActiveProfileImageContent',
      'getActiveProfileImageId',
    ]),
  },
  created() {
    // clear error messages left from prior login or register pages
    this.fileUploadInitialize(); // clear all error messages
  },
  components: {
    'confirm-yes-no': ConfirmYesNo,
    'error-row-card': ErrorRowCard,
  },
};
</script>

<style>
  .input-card {
    max-width: 500px;
    margin: 20px auto;
    padding: 16px 16px 1px;
  }
</style>
