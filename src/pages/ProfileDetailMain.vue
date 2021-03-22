<template>
  <div>
    <profile-detail-info v-if='tabsValue==="info"' />
    <profile-detail-chat v-if='tabsValue==="chat"' />
    <profile-detail-videochat v-if='tabsValue==="videochat"' />

    <q-page>
      <q-page-sticky expand position="top">
        <div style="width: 100%">
          <q-tabs
            v-model="tabsValue"
            no-caps
            inline-label
            align="left"
            class="bg-teal text-white shadow-2"
            :breakpoint="0"
          >
            <q-tab name="info"
              :label='$t("chatProfileDetail_tab_Info")'
            />
            <q-tab name="chat"
              :label='$t("chatProfileDetail_tab_Chat")'
            />
            <q-tab name="videochat" v-if='settings.featureVideoChat'
              :label='$t("chatProfileDetail_tab_Videochat")'
            />
          </q-tabs>
        </div>
      </q-page-sticky>
    </q-page>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import ProfileDetailInfo from './ProfileDetailInfo.vue';
import ProfileDetailChat from './ProfileDetailChat.vue';
import ProfileDetailVideochat from './ProfileDetailVideochat.vue';
import settings from '../lib/settings.js';

export default {
  name: 'ProfileDetailMain',
  components: {
    'profile-detail-info': ProfileDetailInfo,
    'profile-detail-chat': ProfileDetailChat,
    'profile-detail-videochat': ProfileDetailVideochat,
  },
  data() {
    return {
      tabsValue: this.getTabsValue(),
      settings,
    };
  },
  methods: {
    getTabsValue() {
      let returnValue = 'info';
      const { selectedProfileIndex } = this.$store.state.chat;
      if (selectedProfileIndex !== -1) {
        const seletedProfile = this.$store.state.chat.profiles[selectedProfileIndex];
        if (seletedProfile.is_contact || seletedProfile.unread_messages_counter) returnValue = 'chat';
      }
      if (this.$route.params.tab && this.$route.params.tab === 'videochat') {
        returnValue = 'videochat';
      }
      return returnValue;
    },
    ...mapActions(['vcSetModeUseReceivedProfile']),
  },
  computed: {
    ...mapGetters(['getVCisFetchingReceiverProfile']),
  },
  watch: {
    getVCisFetchingReceiverProfile(isFetching) {
      if (isFetching) {
        this.tabsValue = 'videochat';
      }
    },
  },
};
</script>
