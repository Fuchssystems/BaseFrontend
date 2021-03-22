<template>
  <q-page padding>
    <q-card class="input-card">
      <form @submit.prevent="submitForm">
        <div class="row q-mb-md">
          <q-banner class="bg-grey-3 col">
            <template v-slot:avatar>
              <q-icon name="mdi-account-card-details" color="primary" />
            </template>
            {{ $t('profile_personalData_title') }}
          </q-banner>
        </div>

        <div class="row q-mb-md">
          <q-input
            v-model='formDataProfile.name'
            v-on:keyup='onKeyupFormData("name")'
            :rules="[ val => val.length >= 2 || $t('app_log_err_enter_minNumOfChars',
              {numOfChars: 2})]"
            ref="name"
            outlined
            class="col"
            :label='$t("profile_field_Name_label")'
            stack-label
          >
          </q-input>
        </div>

        <div class="row q-mb-md q-col-gutter-xs items-start">
          <q-select
            outlined
            style="width: 134px"
            class='col-4 q-mr-sm'
            v-model='selectCountryModel'
            use-input
            hide-selected
            fill-input
            input-debounce="0"
            :options="countriesOptions"
            option-value="code"
            option-label="code"
            options-selected-class="text-deep-orange"
            @filter="filterSelectCountry"
            @input="onKeyupFormData()"
            :label='$t("profile_field_Country_label")'
          >
            <template v-slot:option="scope">
              <q-item
                v-bind="scope.itemProps"
                v-on="scope.itemEvents"
              >
                <q-item-section avatar>
                  <img :src = 'getFlagURL(scope.opt.code)' width='40' height='30'>
                </q-item-section>
                <q-item-section>
                  <q-item-label v-html="scope.opt.name" />
                  <q-item-label caption>{{ scope.opt.code }}</q-item-label>
                </q-item-section>
              </q-item>
            </template>
            <template v-slot:no-option>
              <q-item>
                <q-item-section class="text-grey">
                  {{ $t('profile_select_countries_no_option') }}
                </q-item-section>
              </q-item>
            </template>
          </q-select>

          <q-input
            v-model='formDataProfile.areacode'
            v-on:keyup='onKeyupFormData("areacode")'
            :rules="[val => (val.length === 0 || val.length >= 2)
              || $t('app_log_err_enter_minNumOfChars', {numOfChars: 2}),
              val => val.length <= 20
              || $t('app_log_err_enter_maxNumOfChars', {numOfChars: 20})]"
            ref="areacode"
            outlined
            class="col-4 q-mr-sm"
            style="width: 100px"
            :label='$t("profile_field_Areacode_label")'
            stack-label
          >
          </q-input>
          <q-input
            v-model='formDataProfile.city'
            v-on:keyup='onKeyupFormData("city")'
            :rules="[val => (val.length === 0 || val.length >= 2)
              || $t('app_log_err_enter_minNumOfChars', {numOfChars: 2}),
              val => val.length <= 20
              || $t('app_log_err_enter_maxNumOfChars', {numOfChars: 20})]"
            ref="city"
            outlined
            class="col"
            style='min-width: 160px'
            :label='$t("profile_field_City_label")'
            stack-label
          >
          </q-input>
        </div>

        <div class="row q-col-gutter-xs items-start">
          <q-input
            v-model='formDataProfile.birthday'
            v-on:change='onKeyupFormData("birthday")'
            :rules="[val => (!!val)
              || $t('profile_err_age_no_value'),
              val => addYearsToDate(val, 12) < new Date()
              || $t('profile_err_age_minimum', {years: 12}),
              val => addYearsToDate(val, 100) > new Date()
              || $t('profile_err_age_maximum', {years: 100})]"
            ref="birthday"
            type='date'
            outlined
            class='col-5 q-mr-sm'
            :label='$t("profile_field_Birthday_label")'
            stack-label
          >
          </q-input>

          <q-select
            outlined
            style="width: 130px"
            class="col-4 q-mr-sm"
            v-model='selectGenderModel'
            ref="gender"
            :options="attributeOptions"
            options-selected-class="text-deep-orange"
            @input="onKeyupFormData()"
            :rules="[val => (!!val) || $t('profile_err_gender_no_value')]"
            :label='$t("profile_field_Gender_label")'
            stack-label
          >
            <template v-slot:option="scope">
              <q-item
                v-bind="scope.itemProps"
                v-on="scope.itemEvents"
              >
                <q-item-section avatar>
                  <q-icon :name="scope.opt.icon" />
                </q-item-section>
                <q-item-section>
                  <q-item-label v-html="scope.opt.label" />
                </q-item-section>
              </q-item>
            </template>
          </q-select>

        </div>

        <div class="row q-mb-md">
          <q-space />
          <q-card-actions align="right">
            <q-btn
              color="primary"
              :label='$t("app_button_Save")'
              type="submit"
              :disable='submitButtonDisabled'
            />
          </q-card-actions>
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
import { date } from 'quasar';
import { mapGetters, mapActions } from 'vuex';
import { mapSagaActions } from 'vuex-coolstory';
import { USER_UPDATE_FIELDS } from '../store/module-user/constants.js';

export default {
  name: 'ProfilePersonalData',
  data() {
    let activeProfile = this.$store.state.profile && this.$store.state.profile.activeProfile;
    if (!activeProfile) activeProfile = {};
    return {
      formDataProfile: {
        name: activeProfile.name || '',
        country_code_iso_3166_alpha_2: activeProfile.country_code_iso_3166_alpha_2 || '',
        areacode: activeProfile.areacode || '',
        country_name: activeProfile.country_name,
        city: activeProfile.city,
        birthday: activeProfile.birthday,
        gender_male_female_diverse_null: activeProfile.gender_male_female_diverse_null,
      },
      formHasError: false,
      submitButtonDisabled: true,
      countriesOptions: [],
      attributeOptions: [
        {
          value: 'male',
          label: this.$t('profile_gender_male'),
          icon: 'fas fa-male',
        },
        {
          value: 'female',
          label: this.$t('profile_gender_female'),
          icon: 'fas fa-female',
        },
        {
          value: 'diverse',
          label: this.$t('profile_gender_diverse'),
          icon: 'fas fa-genderless',
        },
      ],
    };
  },
  methods: {
    getFlagURL(countryCode) {
      const noImagesArr = ['AC', 'DG', 'EA', 'IC', 'TA', 'XA', 'XB', 'XK'];
      // file path quasar v1: `/statics/country-4x3/${countryCode.toLowerCase()}.svg`
      return !noImagesArr.includes(countryCode) ? `/country-4x3/${countryCode.toLowerCase()}.svg` : null;
    },
    filterSelectCountry(val, update) {
      if (val === '') {
        update(() => {
          this.countriesOptions = this.countries;
        });
        return;
      }
      update(() => {
        const needle = val.toLowerCase();
        this.countriesOptions = this.countries
          .filter((c) => {
            let returnvalue = c.code.toLowerCase().startsWith(needle);
            if (!returnvalue) returnvalue = c.name.toLowerCase().startsWith(needle);
            return returnvalue;
          });
      });
    },
    setFormhasError() {
      this.formHasError = this.$refs.name.hasError || this.$refs.areacode.hasError
        || this.$refs.city.hasError || this.$refs.birthday.hasError
        || this.$refs.gender.hasError;
      if (this.formHasError !== this.submitButtonDisabled) {
        this.submitButtonDisabled = this.formHasError;
      }
    },
    submitForm() {
      this.userBackendCallInitialize('');
      this.$refs.name.validate();
      this.$refs.areacode.validate();
      this.$refs.city.validate();
      this.$refs.birthday.validate();
      this.$refs.gender.validate();
      this.setFormhasError();
      if (!this.formHasError) {
        this[USER_UPDATE_FIELDS](
          {
            fields: { profile: this.formDataProfile },
            token: this.getUserToken,
            onSuccessNotificationId: 'backend_notification_save_successfull',
          },
        );
      }
    },
    ...mapActions(['userBackendCallInitialize']),
    ...mapSagaActions([USER_UPDATE_FIELDS]),
    onKeyupFormData() {
      if (this.getErrorlist.length) {
        this.userBackendCallInitialize('');
      }
      this.setFormhasError();
    },
    addYearsToDate(baseDate, yearsToAdd) {
      return date.addToDate(baseDate, { year: yearsToAdd });
    },
  },
  computed: {
    ...mapGetters(['getErrorlist', 'getUserToken', 'getUserLanguageShort']),
    selectCountryModel: {
      get() {
        const returnCountry = this.countries
          .filter(row => row.code === this.formDataProfile.country_code_iso_3166_alpha_2);
        return returnCountry.length === 1 ? returnCountry[0] : returnCountry;
      },
      set(v) {
        this.formDataProfile.country_code_iso_3166_alpha_2 = v.code;
      },
    },
    selectGenderModel: {
      get() {
        const returnGender = this.attributeOptions
          .filter(row => row.value === this.formDataProfile.gender_male_female_diverse_null);
        return returnGender.length === 1 ? returnGender[0] : null;
      },
      set(v) {
        this.formDataProfile.gender_male_female_diverse_null = v.value;
      },
    },
  },
  watch: {
    getUserLanguageShort(newValue) {
      // file path quasar v1: `../statics/country-lists-iso-3166/${newValue}/arrayObjects.json`
      this.countries = require(`../statics/country-lists-iso-3166/${newValue}/arrayObjects.json`);

      // update gender array labels
      this.attributeOptions[0].label = this.$t('profile_gender_male');
      this.attributeOptions[1].label = this.$t('profile_gender_female');
      this.attributeOptions[2].label = this.$t('profile_gender_diverse');
    },
  },
  created() {
    // file path quasar v1: `../statics/country-lists-iso-3166...
    this.countries = require(`../statics/country-lists-iso-3166/${this.getUserLanguageShort}/arrayObjects.json`);
    // clear error messages left from prior login or register pages
    this.userBackendCallInitialize(); // clear all error messages
  },
};
</script>

<style>
  .input-card {
    max-width: 500px;
    margin: 20px auto;
    padding: 16px 16px 1px;
  }
  .field-margin-left {
    margin-left: 10px;
  }
  .error-card {
    width: 100%;
    margin: -6px auto 16px;
  }
  .error-item {
    min-height: 0px;
  }
</style>
