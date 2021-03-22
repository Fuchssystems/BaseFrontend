<template>
  <div class="row" v-if="errorList.length">
    <q-card flat bordered class="error-card q-mt-md bg-red-1">
      <q-toolbar class="bg-red-1">
        <q-icon name="error" size="32px" color="red" />
        <q-toolbar-title>{{ $t('backend_error_header') }}</q-toolbar-title>
      </q-toolbar>
      <q-list bordered>
          <q-item
            v-for="errorText in errorList" :key="errorText"
            class="q-my-xs error-item"
          >
            <q-item-section>
              <q-item-label> {{ errorText }} </q-item-label>
            </q-item-section>
          </q-item>
      </q-list>
    </q-card>
  </div>
</template>

<script>
export default {
  props: { errorList: Array },
};
</script>

<style>
  .error-card {
    width: 100%;
    margin: -6px auto 16px;
  }
  .error-item {
    min-height: 0px;
  }
</style>
