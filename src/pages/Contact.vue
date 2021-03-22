<template>
  <q-page padding>
    <q-card class="input-card">
      <div class="row q-mb-md">
        <q-banner class="bg-grey-3 col">
          <template v-slot:avatar>
            <q-icon name="contact_support" color="primary" />
          </template>
          {{ $t('contact_title') }}
        </q-banner>
      </div>

      <q-list>
        <q-item>
          <q-item-section avatar>
            <q-icon color="secondary" name="account_box" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Alexander Fuchs</q-item-label>
          </q-item-section>
        </q-item>
        <q-item clickable class='link' @click.native="mailTo('mailto:fuchs@fuchs.systems')">
          <q-item-section avatar>
            <q-icon color="secondary" name="email" />
          </q-item-section>
          <q-item-section>
            <q-item-label>fuchs@fuchs.systems</q-item-label>
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section avatar>
            <q-icon color="secondary" name="phone" />
          </q-item-section>
          <q-item-section>
            <q-item-label>+49-1520-1774876</q-item-label>
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section avatar>
            <q-icon color="secondary" name="location_on" />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{$t('contact_fieldValue_location')}}</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-card>
  </q-page>
</template>

<style>
  .input-card {
    max-width: 500px;
    margin: 20px auto;
    padding: 16px 16px 1px;
  }
</style>

<script>
import { openURL } from 'quasar';

export default {
  name: 'Contact',
  methods: {
    mailTo(url) {
      openURL(url);
    },
  },
};
</script>
