<template>
  <q-page class="row justify-start items-start content-start page-padding">
    <q-card class="feature-card" flat bordered
      v-for="feature in getFeatures" :key="feature.logo">
      <q-item>
        <q-item-section avatar>
          <q-img :src="`feature-icons/${feature.logo}`"
            style='min-height: 40px'
          />
        </q-item-section>

        <q-item-section>
          <q-item-label style='font-weight: bold'>
            {{ feature.title[getUserLanguageShort] }}
          </q-item-label>
        </q-item-section>
      </q-item>

      <q-separator />

      <q-card-section horizontal>
        <q-card-section v-html='feature.description[getUserLanguageShort]'>
          {{ feature.description[getUserLanguageShort] }}
        </q-card-section>
      </q-card-section>
    </q-card>

    <q-page-sticky expand position="top">
      <div class="q-gutter-y-md bg-teal text-white shadow-2" style="width: 100%">
        <p class='sticky-top-content'>{{ $t('home_features_title') }}
          <q-btn
            icon='contact_support'
            to='/contact'
            flat
        />
        </p>
      </div>
    </q-page-sticky>
  </q-page>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  name: 'PageHome',
  computed: {
    ...mapGetters(['getFeatures', 'getUserLanguageShort']),
  },
};
</script>

<style>
  .page-padding {
    padding-top: 50px;
  }
  .sticky-top-content {
    margin-left: 20px;
    margin-top: 20px;
    vertical-align: text-bottom;
    max-height: 20px;
  }
  .feature-card {
    width: 100%;
    height: 188px;
    max-width: 250px;
    margin: 10px;
  }
</style>
