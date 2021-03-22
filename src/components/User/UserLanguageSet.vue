<template>
  <q-btn
    flat
    dense
    round
    :class='{ "text-grey-4": !isActive }'
    @click='setUserLanguage'
    :label='label'
    :aria-label='ariaLabel'
  >
   </q-btn>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import { mapSagaActions } from 'vuex-coolstory';
import { USER_SAVE_PREFERENCES } from '../../store/module-user/constants.js';

export default {
  methods: {
    setUserLanguage() {
      if (this.i18nLocale !== this.getUserLanguageLocale) {
        this.setLanguageLocale(this.i18nLocale);
        // change root $i18n instance
        this.$root.$i18n.locale = this.i18nLocale;
        this[USER_SAVE_PREFERENCES]({
          userId: this.getUserId,
          language: this.getUserLanguageLocale,
          token: this.getUserToken,
        });
      }
    },
    ...mapActions(['setLanguageLocale']),
    ...mapSagaActions([USER_SAVE_PREFERENCES]),
  },
  computed: {
    ...mapGetters(['getUserId', 'getUserLanguageLocale', 'getUserToken']),
    isActive() {
      return this.i18nLocale === this.getUserLanguageLocale;
    },
  },
  props: ['label', 'i18nLocale', 'ariaLabel'],
};
</script>

<style>
</style>
