<template>
  <q-page padding>
    <q-card class="input-card">
      <form @submit.prevent="submitDeleteAccount">
        <div class="row q-mb-md">
          <q-banner class="bg-grey-3 col">
            <template v-slot:avatar>
              <q-icon name="fas fa-user-minus" color="primary" />
            </template>
            {{ $t('user_account_group_deleteAccount_title') }}
          </q-banner>
        </div>

        <div class="row q-mb-md">
          <q-input
            v-model="formDataPassword.password"
            v-on:keyup='onKeyupFormData("password")'
            :rules="[
              val => val.length >= 6 || $t('app_log_err_enter_minNumOfChars', {numOfChars: 6})]"
            ref="password"
            lazy-rules
            :type="passwordVisible ? 'text' : 'password'"
            outlined
            class="col"
            :label='$t("app_log_label_Password")'
            stack-label
          >
            <template v-slot:prepend>
              <q-icon name="lock" />
            </template>
            <template v-slot:append>
              <q-icon
                :name="passwordVisible ? 'visibility' : 'visibility_off'"
                class="cursor-pointer"
                @click="passwordVisible = !passwordVisible"
              />
            </template>
          </q-input>
        </div>

        <div class="row q-mb-md">
          <q-space />
          <q-card-actions align="right">
            <q-btn
              @click="confirm = true"
              color="primary"
              :label='$t("user_account_group_deleteAccount_button_delete")'
              :disable='submitButtonDeleteAccount'
            />
          </q-card-actions>
        </div>

        <div class="row" v-if="getErrorGroup('deleteAccount').length">
          <q-card flat bordered class="error-card q-mt-md bg-red-1">
            <q-toolbar class="bg-red-1">
              <q-icon name="error" size="32px" color="red" />
              <q-toolbar-title>{{ $t('backend_error_header') }}</q-toolbar-title>
            </q-toolbar>
            <q-list bordered>
                <q-item
                  v-for="errorText in getErrorGroup('deleteAccount')" :key="errorText"
                  class="q-my-xs error-item"
                >
                  <q-item-section>
                    <q-item-label> {{ errorText }} </q-item-label>
                  </q-item-section>
                </q-item>
            </q-list>
          </q-card>
        </div>

        <q-dialog v-model="confirm" persistent>
          <q-card>
            <q-card-section class="row items-center">
              <q-avatar icon="fas fa-user-minus" color="primary" text-color="white" />
              <span class="q-ml-sm">
                {{ $t('user_account_group_deleteAccount_confirm_messageText') }}
              </span>
            </q-card-section>
            <q-card-actions align="right">
              <q-btn
                flat
                :label='$t("user_account_group_deleteAccount_button_delete")'
                color="negative"
                 @click="this.submitDeleteAccount"
                v-close-popup
              />
              <q-btn flat :label='$t("app_button_Cancel")' color="positive" v-close-popup />
            </q-card-actions>
          </q-card>
        </q-dialog>
      </form>
    </q-card>
  </q-page>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import { mapSagaActions } from 'vuex-coolstory';
import { USER_DELETE_USER } from '../store/module-user/constants.js';

export default {
  data() {
    return {
      formDataPassword: {
        password: '',
      },
      passwordVisible: false,
      confirm: false,
      submitButtonDeleteAccount: true,
    };
  },
  name: 'DeleteAccount',
  methods: {
    submitDeleteAccount() {
      this.userBackendCallInitialize('deleteAccount');
      this[USER_DELETE_USER](
        {
          token: this.getUserToken,
          password: this.formDataPassword.password,
          errorGroup: 'deleteAccount',
          onSuccessNotificationId: 'user_account_group_deleteAccount_notification_deletion_successful',
        },
      );
    },
    ...mapActions(['userBackendCallInitialize']),
    ...mapSagaActions([USER_DELETE_USER]),
    onKeyupFormData(inputName) {
      if (inputName && inputName === 'password') {
        this.userBackendCallInitialize('deleteAccount');
      }
      this.submitButtonDeleteAccount = !this.$refs.password.validate();
    },
  },
  computed: {
    ...mapGetters(['getErrorGroup', 'getUserToken']),
  },
  created() {
    // clear error messages left from prior login or register pages
    this.userBackendCallInitialize(); // clear all error messages
  },
};
</script>

<style>
  .input-card {
    max-width: 500px;
    margin: 20px auto;
    padding: 16px;
  }
  .error-card {
    width: 100%;
  }
  .error-item {
    min-height: 0px;
  }
</style>
