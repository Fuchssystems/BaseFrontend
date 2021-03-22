<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          @click="leftDrawerOpen = !leftDrawerOpen"
          aria-label="Menu"
        >
          <q-icon name="menu" />
        </q-btn>

        <q-toolbar-title class='lt-md'>
          {{ }}
        </q-toolbar-title>
        <q-toolbar-title class='gt-sm'>
          {{ $t('app_applicationName') }}
        </q-toolbar-title>

        <user-language-menu/>

        <q-btn
          v-if="!getIsLoggedIn"
          to='/login'
          flat
          :label="$t('app_log_label_Login')"
        />
        <q-btn
          v-if="!getIsLoggedIn"
          to='/register'
          flat
          :label="$t('app_log_label_Register')"
        />
        <q-btn
          v-else
          @click="logout"
          flat
          :label="$t('app_log_label_Logout')"
        />

        <q-btn
          class="toolbar-username toolbar-button-text"
          v-if="getUserToken"
          flat
          icon="account_circle"
          :label="getUserName"
        >
          <q-menu v-if="getIsLoggedIn" auto-close>
            <q-list style="min-width: 100px">
              <q-item clickable to='/credentials'>
                <q-item-section>{{$t('menu_user_menu_account_item_credentials')}}</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      bordered
      content-class="bg-primary"
    >
      <q-list dark>
        <q-item-label header>{{ $t('menu_navigation_title') }}</q-item-label>

        <div v-for="nav in navs" :key="nav.label">
          <q-item v-if="nav.to && !nav.hide"
            :to="nav.to"
            class="text-grey-4"
            exact
            clickable
          >
            <q-item-section avatar>
              <q-icon :name="nav.icon" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ nav.label }}</q-item-label>
            </q-item-section>
          </q-item>
          <q-expansion-item v-if="!nav.to && !nav.hide"
            expand-separator
            :icon="nav.icon"
            :label="nav.label"
          >
            <div v-for="navLevel2 in nav.menuItems" :key="navLevel2.label">
              <q-item
                :to="navLevel2.to"
                class="text-grey-4"
                exact
                clickable
              >
                <q-item-section avatar>
                  <q-icon :name="navLevel2.icon" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ navLevel2.label }}</q-item-label>
                </q-item-section>
              </q-item>
            </div>
          </q-expansion-item>
        </div>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import { openURL, Notify } from 'quasar';
import { mapGetters, mapActions } from 'vuex';
import { mapSagaActions } from 'vuex-coolstory';
import { debounce } from 'lodash';
import UserLanguageMenu from 'components/User/UserLanguageMenu.vue';
import { LOGOUT_REQUESTING } from '../store/module-user/constants.js';
import { CHAT_SOCKET_MESSAGE_RECEIVED, CHAT_SOCKET_POST_MESSAGE_READ } from '../store/module-chat/constants.js';
import {
  VC_CALL_CONNECTED,
  VC_CALL_DECLINED,
  VC_CALL_END_CALL,
  VC_CALL_IS_BUSY,
  VC_CALL_IS_RINGING,
  VC_CALL_UPDATE_CALL_STATUS,
  VC_CALL_NEW_CALL_REQUESTED,
  VC_FETCH_RECEIVER_PROFILE,
  VC_STATUS_FREE,
} from '../store/module-videochat/constants.js';
import { m } from '../lib/i18nCustomFormatMessage.js';
import settings from '../lib/settings.js';

export default {
  name: 'MyLayout',
  data() {
    return {
      leftDrawerOpen: this.$q.platform.is.desktop,
      incomingCallNotification: null,
      ringtone: new Audio('sounds/ringtone.mp3'),
    };
  },
  methods: {
    openURL,
    logout() {
      this[LOGOUT_REQUESTING]({ token: this.getUserToken, sessionId: this.getUserSessionId });
    },
    listen() {
      if (this.getUserActiveProfileId) {
        this.$echo.channel(`profile.${this.getUserActiveProfileId}`).listen('MessageToProfile', (payload) => {
          if (payload.message.type !== 'isWriting') {
            this[CHAT_SOCKET_MESSAGE_RECEIVED](payload.message);
            if (payload.message.type === 'newChatmessage') {
              // if sending profile is displayed in chat mode
              if (payload.message.senderProfile.id === this.getChatChatMessagesProfileIdSet) {
                // post to server that message is read
                this[CHAT_SOCKET_POST_MESSAGE_READ]({
                  chatMessageId: payload.message.chatmessage.id,
                  token: this.getUserToken,
                });
              } else { // sending profile not displayed in chat mode
                let caption = payload.message.chatmessage.messageText;
                if (caption.length > 100) caption += '…';
                this.incomingCallNotification = Notify.create({
                  message: `${this.$t('chat_message_newMessageFrom')} ${payload.message.senderProfile.name}`,
                  caption,
                  color: 'teal',
                  textColor: 'white',
                  icon: 'email',
                });
              }
            }
          }

          if (payload.message.type === 'isWriting') {
            this.chatSetProfileSetIsWriting({ isWriting: true });
            // set isWriting to false after 5 seconds of inactivity from other profile
            this.resetIsWriting();
          }
          // videochat
          if (payload.message.type === 'updateCall') {
            this.vcSetCall({
              responseData: { call: payload.message.call },
            });
            const { status } = payload.message.call;
            switch (status) {
              case VC_CALL_NEW_CALL_REQUESTED:
                this[VC_CALL_UPDATE_CALL_STATUS](
                  {
                    id: payload.message.call.id,
                    status: this.getVCcallerStatus === VC_STATUS_FREE
                      ? VC_CALL_IS_RINGING : VC_CALL_IS_BUSY,
                    token: this.getUserToken,
                  },
                );

                if (this.getVCcallerStatus === VC_STATUS_FREE) {
                  this.ringtone.play();
                  this.incomingCallNotification = Notify.create({
                    message: m('vc_notification_incomingCall_from',
                      { name: payload.message.call.profile_name_receiver }),
                    timeout: 10000, // ms
                    color: 'info',
                    textColor: 'white',
                    icon: 'video_call',
                    position: 'center',
                    multiline: true,
                    group: false,
                    onDismiss: () => {
                      this.ringtone.pause();
                      this.ringtone.currentTime = 0;
                      this.incomingCallNotification = null;
                    },
                    actions: [
                      {
                        icon: 'call_end',
                        label: this.$t('vc_button_call_decline'),
                        color: 'red',
                        handler: () => {
                          this[VC_CALL_UPDATE_CALL_STATUS](
                            {
                              id: payload.message.call.id,
                              status: VC_CALL_DECLINED,
                              token: this.getUserToken,
                            },
                          );
                        },
                      },
                      {
                        icon: 'call',
                        label: this.$t('vc_button_call_accept'),
                        color: 'green',
                        handler: () => {
                          this.ringtone.pause();
                          this.ringtone.currentTime = 0;

                          this[VC_CALL_UPDATE_CALL_STATUS](
                            {
                              id: payload.message.call.id,
                              status: VC_CALL_CONNECTED,
                              token: this.getUserToken,
                              sessionIdReceiver: this.getUserSessionId,
                            },
                          );
                          this.vcSetModeUseReceivedProfile({ modeUseReceivedProfile: true });
                          // fetch callers profile
                          this[VC_FETCH_RECEIVER_PROFILE](
                            {
                              id: payload.message.call.profile_id_caller,
                              token: this.getUserToken,
                            },
                          );
                          if (this.$route.path !== '/profileDetail/videochat') {
                            this.$router.push('/profileDetail/videochat');
                          }
                        },
                      },
                    ],
                  });
                }
                break;

              case VC_CALL_IS_BUSY:
                this.vcSetCallerStatus(VC_STATUS_FREE);
                break;

              case VC_CALL_END_CALL:
                if (this.incomingCallNotification) {
                  console.log('Handling VC_CALL_END_CALL');
                  this.incomingCallNotification(); // end notification popup
                }
                this.vcInitComponent();
                break;
            }
          }
        });
      }
    },
    ...mapActions([
      'chatSetProfileSetIsWriting',
      'vcInitComponent',
      'vcSetCall',
      'vcSetCallerStatus',
      'vcSetModeUseReceivedProfile',
    ]),
    ...mapSagaActions([
      LOGOUT_REQUESTING,
      CHAT_SOCKET_MESSAGE_RECEIVED,
      CHAT_SOCKET_POST_MESSAGE_READ,
      VC_CALL_UPDATE_CALL_STATUS,
      VC_FETCH_RECEIVER_PROFILE,
    ]),
  },
  computed: {
    ...mapGetters([
      'getChatChatMessagesProfileIdSet',
      'getIsLoggedIn',
      'getUserToken',
      'getUserName',
      'getUserActiveProfileId',
      'getUserSessionId',
      'getVCcallerStatus',
    ]),
    navs() {
      return [
        {
          label: this.$t('menu_navigation_home'),
          icon: 'mdi-home',
          to: '/',
        },
        {
          label: this.$t('menu_chat_title'),
          hide: !this.getIsLoggedIn || !settings.featureChat,
          icon: 'chat',
          to: '/chat',
        },
        {
          label: this.$t('menu_user_menu_account_title_acountSettings'),
          hide: !this.getIsLoggedIn,
          icon: 'account_circle',
          menuItems: [
            {
              label: this.$t('menu_user_menu_account_item_credentials'),
              to: '/credentials',
            },
            {
              label: this.$t('menu_user_menu_account_item_deleteAccount'),
              to: '/deleteAccount',
            },
          ],
        },
        {
          label: this.$t('menu_profile_title'),
          hide: !this.getIsLoggedIn,
          icon: 'mdi-account-card-details',
          menuItems: [
            {
              label: this.$t('menu_profile_item_personalData'),
              to: '/profilePersonalData',
            },
            {
              label: this.$t('menu_profile_item_profilePicture'),
              to: '/profilePicture',
            },
            {
              label: this.$t('menu_profile_item_images'),
              to: '/profileImages',
            },
          ],
        },
        {
          label: this.$t('menu_payments_title'),
          hide: !this.getIsLoggedIn,
          icon: 'euro_symbol',
          menuItems: [
            {
              label: this.$t('menu_payments_makeTransfer'),
              to: '/payments',
            },
            {
              label: this.$t('menu_payments_transactions'),
              to: '/transactions',
            },
          ],
        },
        {
          label: this.$t('menu_contact_title'),
          icon: 'contact_support',
          to: '/contact',
        },
        {
          label: 'Protected',
          icon: 'security',
          to: '/protected',
        },
      ];
    },
  },
  watch: {
    getUserActiveProfileId() {
      this.listen();
    },
  },
  mounted() {
    this.listen();
    this.resetIsWriting = debounce(() => {
      this.chatSetProfileSetIsWriting({ isWriting: false });
    }, 5000, { leading: false, trailing: true });
  },
  components: {
    'user-language-menu': UserLanguageMenu,
  },
};
</script>

<style lang="scss" scoped>
  .q-drawer {
    .q-router-link--exact-active {
      color: white !important;
    }
  }
  .toolbar-username {
    text-transform: none;
  }
  .q-btn__wrapper {
    padding-left: 8px;
    padding-right: 8px;
  }
</style>
