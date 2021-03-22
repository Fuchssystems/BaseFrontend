<template>
  <q-page class='q-pa-sm' style='margin-top: 50px'>
    <div class="row">
      <q-carousel class="col" style="margin: -20px -30px; width: 100%; max-width: 400px"
        swipeable
        animated
        ref='carouselProfiles'
        :value='getChatSelectedProfileId'
        @input='onProfileInput'
        height='100px'
      >
        <q-carousel-slide
          v-for="
          profile in getChatProfiles" :key="profile.id"
          :name="profile.id"
        >
          <q-item>
            <q-item-section side left>
              <q-btn
                push round dense color="primary" text-color="black" icon="arrow_left"
               :disabled='getChatSelectedProfileIndex === 0'
                @click='onButtonGotoPanel("previous")'
              />
            </q-item-section>
            <q-item-section avatar>
              <q-avatar rounded>
                <img :src="profile.profile_image.filecontent">
              </q-avatar>
            </q-item-section>
            <q-item-section>
              <q-item-label>
                {{ profile.name }}
              </q-item-label>
              <q-item-label v-if="!profile.online && profile.last_online"
                caption class="text-body2 q-mt-sm"
              >
                {{ `${$t('profile_onlineStatus_last_online')} ${serverDateToLocalDateTimeString(
                    profile.last_online)}`
                }}
              </q-item-label>
            </q-item-section>
            <q-item-section side top v-if='profile.online'>
              <q-badge class='q-mb-sm' color="red">
                  {{ $t('profile_onlineStatus_online') }}
              </q-badge>
              <transition name="fade">
                <q-item-label v-if="getChatProfileSetIsWriting"
                  class="text-body2 text-green"
                >
                  {{ $t('chat_message_isWriting') }}
                </q-item-label>
              </transition>
            </q-item-section>
            <q-item-section side right>
              <q-btn
                push round dense color="primary" text-color="black" icon="arrow_right"
                :disabled='getChatSelectedProfileIndex >= getChatProfiles.length - 1'
                @click='onButtonGotoPanel("next")'
              />
            </q-item-section>
          </q-item>
        </q-carousel-slide>
      </q-carousel>
    </div>

    <div class="row">
      <q-scroll-area v-if='!getChatChatMessagesIsFetching'
        class="col q-mb-md q-pa-sm col bg-light-blue-1"
        style="height: calc(100vh - 372px); width: 100%; max-width: 340px;"
        :thumb-style="thumbStyle"
        :bar-style="barStyle"
        ref="messages"
      >
        <div class="q-pa-xs"
          v-for="message in getChatChatMessages" :key="message.id"
        >
          <q-chat-message
            :text="[message.messageText]"
            :stamp='message.send_at ? serverDateToLocalDateTimeString(message.send_at) : ""'
            :sent='message.profile_id_sender==getUserActiveProfileId'
            :bg-color='message.profile_id_sender===getUserActiveProfileId
              ? "amber-2" : "light-green-2"'
          />
        </div>
      </q-scroll-area>

      <q-skeleton height='calc(100vh - 372px)'
        class="q-mb-md q-pa-sm" style="width: 100%; max-width: 340px"
        v-if='getChatChatMessagesIsFetching'
      />
    </div>

    <error-row-card :errorList="getChatChatMessagesErrorList" />

    <div class="row">
      <q-input v-model="messageToSend"
        class="col"
        style="width=100%; width: 100%; max-width:340px;"
        type="textarea"
        filled
        :placeholder='$t("chat_field_messageToSend_placeholder")'
        @keydown="onKeyDownMessageToSend"
      >
        <template v-slot:append>
          <q-btn round dense flat icon="send"
            :disabled='!messageToSend'
            @click='onChatMessageSend'
          />
        </template>
      </q-input>
    </div>

    <q-page-sticky expand position="bottom">
      <div class="bg-primary" style="width: 100%; height:44px">
        <q-btn push round dense color="black" text-color="white" icon="navigate_before"
          size="md"
          style="margin: 5px 0px 5px 16px"
          @click="$router.go(-1)"
        />
      </div>
    </q-page-sticky>
  </q-page>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import { mapSagaActions } from 'vuex-coolstory';
import { debounce } from 'lodash';
import ErrorRowCard from 'components/Cards/ErrorRowCard.vue';
import {
  CHAT_CHAT_MESSAGE_SEND,
  CHAT_FETCH_CHAT_MESSAGES,
  CHAT_CANCEL_FETCH_MESSAGES,
  CHAT_WHISPER,
} from '../store/module-chat/constants.js';
import { attributeOptions } from '../store/module-chat/attributeOptions.js';
import { serverDateToLocalDateTimeString } from '../lib/dateTime.js';

export default {
  name: 'ProfileDetailChat',
  components: {
    'error-row-card': ErrorRowCard,
  },
  data() {
    return {
      messageToSend: '',
      thumbStyle: {
        right: '4px',
        borderRadius: '5px',
        backgroundColor: '#027be3',
        width: '5px',
        opacity: 0.75,
      },
      barStyle: {
        right: '2px',
        borderRadius: '9px',
        backgroundColor: '#027be3',
        width: '9px',
        opacity: 0.2,
      },
      attributeOptions,
      serverDateToLocalDateTimeString,
    };
  },
  methods: {
    fetchSelectedProfileIdChatMessages() {
      this.chatClearChatMessagesFetchResult();
      if (this.getChatChatMessagesErrorList.length) this.chatchatMessagesResetErrorlist();
      this[CHAT_FETCH_CHAT_MESSAGES](
        {
          profileIdSender: this.getUserActiveProfileId,
          profileIdReceiver: this.getChatSelectedProfileId,
          token: this.getUserToken,
        },
      );
    },
    onProfileInput(id) { // profile change by swiping
      this.chatSetSelectedProfileId(id);
      this.fetchSelectedProfileIdChatMessages();
    },
    onButtonGotoPanel(selector) {
      const index = selector === 'next' ? this.getChatSelectedProfileIndex + 1
        : this.getChatSelectedProfileIndex - 1;
      this.chatSetSelectedProfileId(this.getChatProfiles[index].id);
      this.fetchSelectedProfileIdChatMessages();
    },
    onChatMessageSend() {
      const temporaryMessageId = new Date().getTime();
      this.chatChatMessageSend({
        type: 'chatChatMessageSend',
        profileIdSender: this.getUserActiveProfileId,
        profileIdReceiver: this.getChatSelectedProfileId,
        messageText: this.messageToSend,
        temporaryMessageId,
      });
      if (this.getChatChatMessagesErrorList.length) this.chatchatMessagesResetErrorlist();
      this[CHAT_CHAT_MESSAGE_SEND]({
        message: {
          profileIdSender: this.getUserActiveProfileId,
          profileIdReceiver: this.getChatSelectedProfileId,
          messageText: this.messageToSend,
        },
        temporaryMessageId,
        token: this.getUserToken,
      });
      this.messageToSend = '';
    },
    onKeyDownMessageToSend() {
      if (this.getChatSelectedProfile && this.getChatSelectedProfile.online) {
        this.debouncedSendIsWriting();
      }
    },
    ...mapActions([
      'chatSetSelectedProfileId',
      'chatClearChatMessagesFetchResult',
      'chatchatMessagesResetErrorlist',
      'chatChatMessageSend',
      'chatSetScrollMessagesDown',
    ]),
    ...mapSagaActions([
      CHAT_CHAT_MESSAGE_SEND,
      CHAT_FETCH_CHAT_MESSAGES,
      CHAT_CANCEL_FETCH_MESSAGES,
      CHAT_WHISPER,
    ]),
  },
  computed: {
    ...mapGetters([
      'getChatChatMessagesErrorList',
      'getChatChatMessages',
      'getChatChatMessagesIsFetching',
      'getChatChatMessagesProfileIdSet',
      'getChatSelectedProfile',
      'getChatSetScrollMessagesDown',
      'getChatProfiles',
      'getChatSelectedProfileId',
      'getChatSelectedProfileIndex',
      'getChatProfileSetIsWriting',
      'getUserActiveProfileId',
      'getUserToken',
    ]),
  },
  updated() {
    if (this.getChatSetScrollMessagesDown) {
      setTimeout(() => {
        if (this.$refs.messages) {
          this.$refs.messages.setScrollPercentage(1);
          this.chatSetScrollMessagesDown({ scrollDownValue: false });
        }
      }, 500);
    }
  },
  mounted() {
    if (this.getChatSelectedProfileId !== this.getChatChatMessagesProfileIdSet) {
      this.fetchSelectedProfileIdChatMessages();
    }
    this.debouncedSendIsWriting = debounce(() => {
      this[CHAT_WHISPER]({
        type: 'isWriting',
        profileIdSender: this.getUserActiveProfileId,
        profileIdReceiver: this.getChatSelectedProfileId,
      });
    }, 3000, { leading: true, trailing: false });
  },
  beforeDestroy() {
    this[CHAT_CANCEL_FETCH_MESSAGES]();
    this.chatClearChatMessagesFetchResult(); // also resets state.chatMessagesProfileIdSet
  },
};
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity .5s;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}
</style>
