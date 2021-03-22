<template>
  <q-page padding>
    <q-card class="input-card">
      <form @submit.prevent="submitFormEmail">
        <div class="row q-mb-md">
          <q-banner class="bg-grey-3 col">
            <template v-slot:avatar>
              <q-icon name="account_circle" color="primary" />
            </template>
            {{ $t('user_credentials_group_email_title') }}
          </q-banner>
        </div>

        <div class="row q-mb-md">
          <q-input
            v-model="formDataEmail.email"
            v-on:keyup='onKeyupFormData("email")'
            :rules="[val => !!val
              || m('app_error_fieldname_required', {field: 'fieldName_user_email'}),
              val => isValidEmailAddress(val) || $t('app_log_err_email_invalid')]"
            ref="email"
            lazy-rules
            outlined
            class="col"
            :label='$t("user_field_email_label")'
            stack-label
          >
            <template v-slot:prepend>
              <q-icon name="email" />
            </template>
          </q-input>
        </div>

        <div class="row q-mb-md row-submit">
          <q-space />
          <q-card-actions align="right">
            <q-btn
              color="primary"
              :label='$t("user_credentials_group_email_button_save")'
              type="submit"
              :disable='submitButtonEmailDisabled'
            />
          </q-card-actions>
        </div>

        <div class="row" v-if="getErrorGroup('email').length">
          <q-card flat bordered class="error-card q-mt-md bg-red-1">
            <q-toolbar class="bg-red-1">
              <q-icon name="error" size="32px" color="red" />
              <q-toolbar-title>{{ $t('backend_error_header') }}</q-toolbar-title>
            </q-toolbar>
            <q-list bordered>
                <q-item
                  v-for="errorText in getErrorGroup('email')" :key="errorText"
                  class="q-my-xs error-item"
                >
                  <q-item-section>
                    <q-item-label> {{ errorText }} </q-item-label>
                  </q-item-section>
                </q-item>
            </q-list>
          </q-card>
        </div>
      </form>
    </q-card>

    <q-card class="input-card">
      <form @submit.prevent="submitFormPassword">
        <div class="row q-mb-md">
          <q-banner class="bg-grey-3 col">
            <template v-slot:avatar>
              <q-icon name="account_circle" color="primary" />
            </template>
            {{ $t('user_credentials_group_password_title') }}
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
          <q-input
            v-model="formDataPassword.confirmPassword"
            v-on:keyup='onKeyupFormData("confirmPassword")'
            :rules="[
              val => val.length >= 6 || $t('app_log_err_enter_minNumOfChars', {numOfChars: 6}),
              isConfirmpasswordEqualPassword]"
            ref="confirmPassword"
            lazy-rules
            :type="passwordVisible ? 'text' : 'password'"
            outlined
            class="col"
            :label='$t("app_log_label_Confirm_Password")'
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

        <div class="row q-mb-md row-submit">
          <q-space />
          <q-card-actions align="right">
            <q-btn
              color="primary"
              :label='$t("user_credentials_group_password_button_save")'
              type="submit"
              :disable='submitButtonPasswordDisabled'
            />
          </q-card-actions>
        </div>

        <div class="row" v-if="getErrorGroup('password').length">
          <q-card flat bordered class="error-card q-mt-md bg-red-1">
            <q-toolbar class="bg-red-1">
              <q-icon name="error" size="32px" color="red" />
              <q-toolbar-title>{{ $t('backend_error_header') }}</q-toolbar-title>
            </q-toolbar>
            <q-list bordered>
                <q-item
                  v-for="errorText in getErrorGroup('password')" :key="errorText"
                  class="q-my-xs error-item"
                >
                  <q-item-section>
                    <q-item-label> {{ errorText }} </q-item-label>
                  </q-item-section>
                </q-item>
            </q-list>
          </q-card>
        </div>
      </form>
    </q-card>
  </q-page>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import { mapSagaActions } from 'vuex-coolstory';
import { USER_UPDATE_FIELDS } from '../store/module-user/constants.js';
import { m } from '../lib/i18nCustomFormatMessage.js';

export default {
  name: 'UserEmailPassword',
  data() {
    return {
      formDataEmail: {
        email: this.$store.state.user.user.email,
      },
      submitButtonEmailDisabled: true,
      formDataPassword: {
        password: '',
        confirmPassword: '',
      },
      passwordVisible: false,
      submitButtonPasswordDisabled: true,
    };
  },
  methods: {
    isValidEmailAddress(emailEntered) {
      const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return re.test(String(emailEntered).toLowerCase());
    },
    isConfirmpasswordEqualPassword(confirmPassword) {
      const equal = !this.formDataPassword.password
        || confirmPassword === this.formDataPassword.password;
      return (equal ? true : this.$t('app_register_err_Passwords_do_not_match'));
    },
    submitFormEmail() {
      this.userBackendCallInitialize('email');
      this.$refs.email.validate();
      if (!this.$refs.email.hasError) {
        this[USER_UPDATE_FIELDS](
          {
            fields: { user: this.formDataEmail },
            token: this.getUserToken,
            errorGroup: 'email',
            onSuccessNotificationId: 'user_credentials_group_email_notification_safe_successful',
          },
        );
      }
    },
    submitFormPassword() {
      this.userBackendCallInitialize('password');
      this.$refs.password.validate();
      this.$refs.confirmPassword.validate();
      if (!this.$refs.password.hasError && !this.$refs.confirmPassword.hasError) {
        this[USER_UPDATE_FIELDS](
          {
            fields: { user: this.formDataPassword },
            token: this.getUserToken,
            errorGroup: 'password',
            onSuccessNotificationId: 'user_credentials_group_password_notification_safe_successful',
          },
        );
      }
    },
    ...mapActions(['userBackendCallInitialize']),
    ...mapSagaActions([USER_UPDATE_FIELDS]),
    onKeyupFormData(inputName) {
      if (inputName && inputName === 'email') {
        if (this.getErrorGroup('email').length) {
          this.userBackendCallInitialize('email');
        }
        this.submitButtonEmailDisabled = !this.$refs.email.validate()
          || this.formDataEmail.email === this.getUser.email;
      }

      if (inputName && (inputName === 'password' || inputName === 'confirmPassword')) {
        this.userBackendCallInitialize('password');
        if (this.$refs.confirmPassword.value) this.$refs.confirmPassword.validate();
        this.submitButtonPasswordDisabled = !(this.$refs.password.validate()
          && this.$refs.confirmPassword.validate());
      }
    },
    m, // custimized 18n.t
  },
  computed: {
    ...mapGetters(['getErrorGroup', 'getUser', 'getUserToken']),
  },
  created() {
    // clear error messages left from prior login or register pages
    this.userBackendCallInitialize(); // clear all error messages
  },
};
</script>

<style scoped>
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
  .row-submit {
    margin-top: -25px;
  }
  .q-separator {
    margin-top: 16px;
    margin-bottom: 20px
  }
</style>
