<template>
  <q-page padding>
    <q-card class="login-card">
      <form @submit.prevent="submitForm">
        <div class="row q-mb-md">
          <q-banner class="bg-grey-3 col">
            <template v-slot:avatar>
              <q-icon name="account_circle" color="primary" />
            </template>
            {{ $t('app_log_dialog_Title') }}
          </q-banner>
        </div>

        <div :v-if='settings.featureDemo' class="row q-mb-md">
          <div class="text-body2">
            {{ $t('app_log_demouser_label') }}
              <q-chip  v-for="name in demoUser" :key="name" clickable color="blue-2"
                @click='onDemoNameClicked(name)'
              >
                {{ name }}
              </q-chip>
          </div>
        </div>

        <div class="row q-mb-md">
          <q-input
            v-model="formData.email"
            v-on:keyup='onChangeFormData'
            autofocus
            :rules="[ val => isValidEmailAddress(val) || $t('app_log_err_email_invalid')]"
            ref="email"
            lazy-rules
            outlined
            class="col"
            :label='$t("app_log_label_Email")'
            stack-label
          >
            <template v-slot:prepend>
              <q-icon name="email" />
            </template>
          </q-input>
        </div>
        <div class="row q-mb-md">
          <q-input
            v-model="formData.password"
            v-on:keyup='onChangeFormData'
            :rules="[ val => val.length >= 6 || $t('app_log_err_enter_minNumOfChars',
              {numOfChars: 6})]"
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
        <div class="row">
          <q-space />
          <q-btn
            color="primary"
            :label='$t("app_log_label_Login")'
            type="submit"
          />
        </div>

        <div class="row" v-if="getErrorlist.length">
          <q-card flat bordered class="error-card q-mt-md bg-red-1">
            <q-toolbar class="bg-red-1">
              <q-icon name="error" size="32px" color="red" />
              <q-toolbar-title>{{ $t('backend_error_header') }}</q-toolbar-title>
            </q-toolbar>
            <q-list bordered>
                <q-item
                  v-for="errorText in getErrorlist" :key="errorText"
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
import { LOGIN_REQUESTING } from '../store/module-user/constants.js';
import settings from '../lib/settings.js';

export default {
  data() {
    return {
      formData: {
        email: 'ColinPowell@example.com',
        password: '!123456!',
      },
      passwordVisible: false,
      settings,
      demoUser: [
        'Aaron Eckhart',
        'Angela Merkel',
        'Anna Kournikova',
        'Donald Trump',
        'Vladimir Putin',
      ],
    };
  },
  methods: {
    isValidEmailAddress(email) {
      const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return re.test(String(email).toLowerCase());
    },
    submitForm() {
      this.$refs.email.validate();
      this.$refs.password.validate();
      if (!this.$refs.email.hasError && !this.$refs.password.hasError) {
        this[LOGIN_REQUESTING](
          {
            ...this.formData,
            router: this.$router,
            redirectTo: this.$route.query.redirect,
          },
        );
      }
    },
    ...mapActions(['userBackendCallInitialize']),
    ...mapSagaActions([LOGIN_REQUESTING]),
    onChangeFormData() {
      if (this.getErrorlist.length) {
        this.userBackendCallInitialize();
      }
    },
    onDemoNameClicked(name) {
      this.formData.email = `${name.replace(' ', '')}@example.com`;
      this.formData.password = '!123456!';
      this.submitForm();
    },
  },
  computed: {
    ...mapGetters(['getErrorlist']),
  },
  created() {
    // clear error messages left from prior login/register pages
    this.userBackendCallInitialize();
  },
};
</script>

<style>
  .login-card {
    max-width: 500px;
    margin: 50px auto;
    padding: 16px;
  }
  .error-card {
    width: 100%;
  }
  .error-item {
    min-height: 0px;
  }
</style>
