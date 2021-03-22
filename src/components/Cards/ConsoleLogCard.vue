<template>
  <div class="row">
    <q-card flat bordered class="consolelog-card q-mt-md bg-info">
      <q-toolbar class="bg-blue-2">
        <q-toolbar-title>Log</q-toolbar-title>
        <q-btn push round color="blue-grey-8" text-color="white"
          :disabled="!logArray.length"
          icon="clear_all"
          size="sm"
          @click='$emit("onClearDebugConsole")'
        />
        <q-btn push round color="blue-grey-8" text-color="white"
          style="margin-left: 10px"
          icon="close"
          size="sm"
          @click='$emit("onCloseDebugConsole")'
        />
      </q-toolbar>
        <q-scroll-area ref="scrollArea" style="height: 200px; width: 100%;">
          <div
            v-for="logItem in logArray" :key="logItem"
            class="q-my-xs text-caption consolelog-item"
          >
            {{ logItem }}
          </div>
      </q-scroll-area>
    </q-card>
  </div>
</template>

<script>
export default {
  name: 'ConsoleLogCard',
  props: { logArray: Array },
  watch: {
    logArray() {
      this.$refs.scrollArea.setScrollPercentage(1);
    },
  },
};
</script>

<style>
  .consolelog-card {
    width: 100%;
    margin: -6px auto 16px;
  }
  .consolelog-item {
    min-height: 0px;
  }
</style>
