// language menu in top bar
<template>
  <q-btn
    flat
    icon='language'
    style="max-width: 32px"
  >
    <q-menu auto-close ref='languageMenu'>
      <div style="min-width: 110px">
        <q-option-group
          v-model='languageGroup'
          :options='languageOptions'
        />
      </div>
    </q-menu>
  </q-btn>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import { mapSagaActions } from 'vuex-coolstory';
import { USER_SAVE_PREFERENCES } from '../../store/module-user/constants.js';

export default {
  data() {
    return {
      languageOptions: [
        {
          label: 'Deutsch',
          value: 'de-de',
        },
        {
          label: 'Englisch',
          value: 'en-us',
        },
        {
          label: 'Español',
          value: 'es-es',
        },
      ],
    };
  },
  methods: {
    ...mapActions(['setLanguageLocale']),
    ...mapSagaActions([USER_SAVE_PREFERENCES]),
  },
  computed: {
    ...mapGetters(['getUserId', 'getUserLanguageLocale', 'getUserToken']),
    languageGroup: {
      get() {
        return this.$store.getters.getUserLanguageLocale;
      },
      set(newValue) {
        this.setLanguageLocale(newValue);
        // change root $i18n instance
        this.$root.$i18n.locale = newValue;
        this[USER_SAVE_PREFERENCES]({
          userId: this.getUserId,
          language: this.getUserLanguageLocale,
          token: this.getUserToken,
        });
      },
    },
  },
  watch: {
    languageGroup() {
      this.$refs.languageMenu.hide();
    },
  },
};
</script>
