<template>
  <q-dialog v-model="show" @hide="$emit('hide')" persistent>
    <q-card>
      <q-card-section class="row items-center">
        <q-avatar :icon="iconMessage" color="primary" text-color="white" />
        <span class="q-ml-sm">
          {{ propConfirmMessage }}
        </span>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn
          flat
          :label='okButtonLabel'
          color="negative"
          @click="$emit('confirmed')"
          v-close-popup
        />
        <q-btn flat :label='cancelButtonLabel' color="positive" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
export default {
  props: {
    propShow: Boolean,
    propConfirmMessage: String,
    propIconMessage: String,
    propOkButtonLabel: String,
    propCancelButtonLabel: String,
  },
  data() {
    return {
      okButtonLabel: this.propOkButtonLabel || this.$t('app_button_Yes'),
      cancelButtonLabel: this.propCancelButtonLabel || this.$t('app_button_No'),
      iconMessage: this.propIconMessage || 'mdi-account-question-outline',
      show: this.propShow,
    };
  },
};
</script>
