<template>
  <q-page>
    <q-item style="margin-top: 48px">
      <q-item-section avatar>
        <q-avatar rounded>
          <img :src="getChatSelectedProfile.profile_image.filecontent">
        </q-avatar>
      </q-item-section>
      <q-item-section>
        <q-item-label>
          {{ getChatSelectedProfile.name }}
        </q-item-label>
        <q-item-label v-if="!getChatSelectedProfile.online && getChatSelectedProfile.last_online"
          caption class="text-body2 q-mt-sm"
        >
          {{ `${$t('profile_onlineStatus_last_online')} ${serverDateToLocalDateTimeString(
              getChatSelectedProfile.last_online)}`
          }}
        </q-item-label>
      </q-item-section>
      <q-item-section side top v-if='getChatSelectedProfile.online'>
        <q-badge class='q-mb-sm' color="red">
            {{ $t('profile_onlineStatus_online') }}
        </q-badge>
      </q-item-section>
      <q-item-section side top>
        <q-btn v-if='getVCcallerStatus===VC_STATUS_FREE'
          push round dense color="green" icon="call"
          :disabled='(getVCcallerStatus!==VC_STATUS_FREE)
            || !getChatSelectedProfile.online || !getUserVCPreferenceShowMyVideo'
          size="md"
          @click="onCallButton"
        />
        <q-btn v-if='getVCcallerStatus!==VC_STATUS_FREE'
          push round dense color="red" icon="call_end"
          size="md"
          @click="onEndCallButton"
        />
        <q-item-label style="margin-top: 5px" class="text-body2" caption>
          {{ getChatVCReceiverOnlineStatus
            ? getChatVCReceiverOnlineStatus : getVCReceiverStatusDisplay
          }}
        </q-item-label>
      </q-item-section>
    </q-item>

    <div style="width: 100%, height: 100%">
      <video width='100%' height='100%' ref='remoteStream' autoPlay='true'
        :muted='getUserVCPreferenceRemoteAudioMuted'
      >
      </video>
    </div>

    <div v-if="getUserVCPreferenceShowMyVideo" class='myVideo'
      draggable
      :style='`top: ${myVideoPosition.top}px;
        left: ${myVideoPosition.left}px;`'
      ref='myVideo'
      @dragstart='onMyVideoDragStart' @dragover.prevent
      @drag='onMyVideoDrag'
      @dragend='onMyVideoDragEnd'
    >
      <video muted width="120px" height="90px" ref='videoMyStream'  autoPlay='true'> </video>
    </div>


    <error-row-card :errorList="getVCerrorList" />

    <q-page-sticky expand position="bottom">
      <div class="bg-primary" style="width: 100%; height:44px">
        <q-btn push round dense color="black" text-color="white" icon="navigate_before"
          size="md"
          style="margin: 5px 0px 5px 16px"
          @click="$router.go(-1)"
        />
        <q-btn push round dense color="black" text-color="white"
          :icon='getUserVCPreferenceShowMyVideo ? "videocam" : "videocam_off"'
          size="md"
          style="margin: 5px 0px 5px 16px"
          @click='onCameraToggle'
        />
        <q-btn push round dense color="black" text-color="white"
          :icon='getUserVCPreferenceRemoteAudioMuted ? "volume_off" : "volume_mute"'
          size="md"
          style="margin: 5px 0px 5px 16px"
          @click='onRemoteAudioToggle'
        />
      </div>
    </q-page-sticky>
  </q-page>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import { mapSagaActions } from 'vuex-coolstory';
import ErrorRowCard from 'components/Cards/ErrorRowCard.vue';
import { debounce } from 'lodash';
import { polyfill } from 'mobile-drag-drop';
import { scrollBehaviourDragImageTranslateOverride } from 'mobile-drag-drop/scroll-behaviour';
import Peer from 'peerjs';
import { USER_UPDATE_FIELDS_SILENT } from '../store/module-user/constants.js';
import {
  VC_CALL_END_CALL,
  VC_CALL_UPDATE_CALL_STATUS,
  VC_REQUEST_NEW_CALL,
  VC_STATUS_FREE,
  VC_STATUS_REQUEST_NEW_CALL,
} from '../store/module-videochat/constants.js';
import { serverDateToLocalDateTimeString } from '../lib/dateTime.js';

export default {
  name: 'ProfileDetailVideochat',
  components: {
    'error-row-card': ErrorRowCard,
  },
  data() {
    return {
      myVideoPosition: {
        top: 40,
        left: 20,
      },
      dragPositions: {},
      ringbacktone: new Audio('sounds/ringbacktone.mp3'),
      backtoneIsPlaying: false,
      loadingIsShowing: false,
      serverDateToLocalDateTimeString,
      VC_STATUS_FREE,
      myMediaStream: null,
      peer: null,
      peerCall: null,
      // in order to get audio transmission: https://github.com/peers/peerjs/issues/147
      peerOptions: {
        constraints: {
          mandatory: {
            OfferToReceiveAudio: true,
            OfferToReceiveVideo: true,
          },
        },
      },
    };
  },
  methods: {
    onCallButton() {
      this.vcInitComponent();
      this.vcSetCallerStatus(VC_STATUS_REQUEST_NEW_CALL);
      this[VC_REQUEST_NEW_CALL](
        {
          profileIdReceiver: this.getChatSelectedProfile.id,
          token: this.getUserToken,
        },
      );
    },
    onEndCallButton() {
      if (this.backtoneIsPlaying) {
        this.ringbacktone.pause();
        this.ringbacktone.currentTime = 0;
        this.backtoneIsPlaying = false;
      }
      this.vcSetCallerStatus(VC_STATUS_FREE);
      this[VC_CALL_UPDATE_CALL_STATUS](
        {
          id: this.getVCcallEntity.id,
          status: VC_CALL_END_CALL,
          token: this.getUserToken,
        },
      );
    },
    myCameraShow() {
    // video stream
    // https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
      navigator.mediaDevices.getUserMedia({ audio: true, video: { facingMode: 'user' } })
        .then((mediaStream) => {
          this.myMediaStream = mediaStream;
          const video = this.$refs.videoMyStream;
          video.srcObject = this.myMediaStream;
          video.onloadedmetadata = () => {
            video.play();
          };
        })
        .catch((err) => { // always check for errors at the end.
          console.log(`${err.name}: ${err.message}`);
          this.userPrefenceSet({ key: 'showMyVido', value: false });
        });
    },
    onCameraToggle() {
      this.userPrefenceSet({ key: 'showMyVido', value: !this.getUserVCPreferenceShowMyVideo });
      if (this.getUserVCPreferenceShowMyVideo) {
        this.myCameraShow();
      } else if (this.myMediaStream) {
        if (this.$refs.videoMyStream.srcObject) this.$refs.videoMyStream.srcObject = null;
        this.myMediaStream = null;
      }
      // save user preferences in backend
      this[USER_UPDATE_FIELDS_SILENT](
        {
          fields: { user: { preferences: this.getUserPreferenceObject } },
          token: this.getUserToken,
        },
      );
    },
    onMyVideoDragStart(e) {
      e.dataTransfer.dropEffect = 'move';
      this.dragPositions.clientX = e.clientX;
      this.dragPositions.clientY = e.clientY;
    },
    onMyVideoDrag(e) {
      e.preventDefault();
      this.debouncedMoveMyCamera(e);
    },
    onMyVideoDragEnd() {
      this.userPrefenceSet({
        key: `divPositionMyVideo_${window.screen.width}x${window.screen.height}`,
        value: this.myVideoPosition,
      });
      // save user preferences in backend
      this[USER_UPDATE_FIELDS_SILENT](
        {
          fields: { user: { preferences: this.getUserPreferenceObject } },
          token: this.getUserToken,
        },
      );
    },
    onRemoteAudioToggle() {
      this.userPrefenceSet({ key: 'remoteAudioMuted', value: !this.getUserVCPreferenceRemoteAudioMuted });
      // save user preferences in backend
      this[USER_UPDATE_FIELDS_SILENT](
        {
          fields: { user: { preferences: this.getUserPreferenceObject } },
          token: this.getUserToken,
        },
      );
    },
    ...mapActions([
      'userPrefenceSet',
      'vcInitComponent',
      'vcResetErrorlist',
      'vcSetCallerStatus',
      'vcSetError',
    ]),
    ...mapSagaActions([
      USER_UPDATE_FIELDS_SILENT,
      VC_CALL_UPDATE_CALL_STATUS,
      VC_REQUEST_NEW_CALL,
    ]),
  },
  computed: {
    ...mapGetters([
      'getChatSelectedProfile',
      'getChatVCReceiverOnlineStatus',
      'getUserActiveProfileId',
      'getUserPreferenceObject',
      'getUserToken',
      'getUserVCPostionMyVideo',
      'getUserVCPreferenceRemoteAudioMuted',
      'getUserVCPreferenceShowMyVideo',
      'getVCcallEntity',
      'getVCplayRingbacktone',
      'getVCcallerStatus',
      'getVCerrorList',
      'getVCcallIsOutgoing',
      'getVCcallStatusIsConnected',
      'getVCisFetchingReceiverProfile',
      'getVCReceiverStatusDisplay',
    ]),
  },
  watch: {
    getVCplayRingbacktone(play) {
      if (play) {
        this.ringbacktone.play();
        this.backtoneIsPlaying = true;
      } else if (this.ringbacktone) {
        this.ringbacktone.pause();
        this.ringbacktone.currentTime = 0;
        this.backtoneIsPlaying = false;
      }
    },
    getVCcallStatusIsConnected(isConnected) {
      let callerOrReceiverString = '';
      let peerId = '';
      if (isConnected) {
        callerOrReceiverString = this.getVCcallIsOutgoing ? 'caller' : 'receiver';
        peerId = `fc-${callerOrReceiverString}-${this.getVCcallEntity.id}`;
        console.log(`new Peer: peerId: ${peerId}`);
        this.peer = new Peer(peerId, {
          config: {
            iceServers: [
              { url: 'stun:stun.l.google.com:19302' },
              { url: 'turn:turn.bistri.com:80', credential: 'homeo', username: 'homeo' },
            ],
          },
        });
        this.peer.on('error', (error) => {
          this.vcSetError({ errorTextArray: [error] });
        });
        debugger;
        if (this.getVCcallIsOutgoing) {
          // outgoing call
          callerOrReceiverString = 'receiver';
          peerId = `fc-${callerOrReceiverString}-${this.getVCcallEntity.id}`;
          console.log('outgoing call: this.peer.call()');
          console.log(`this.peer.call(): to peerId: ${peerId}`);
          this.peerCall = this.peer.call(peerId,
            this.myMediaStream, this.peerOptions);
          this.peerCall.on('stream', (mediaStream) => {
            console.log('outgoing call: this.peerCall.on stream');
            const video = this.$refs.remoteStream;
            video.srcObject = mediaStream;
            video.onloadedmetadata = () => {
              video.play();
            };
          });
        } else {
          // incoming call
          console.log('Incoming call');
          this.peer.on('call', (call) => {
            console.log('incoming call: this.peer.on call');
            call.answer(this.myMediaStream); // answer the call with an A/V stream
            call.on('stream', (mediaStream) => {
              const video = this.$refs.remoteStream;
              video.srcObject = mediaStream;
              video.onloadedmetadata = () => {
                video.play();
              };
            });
          });
        }
      } else {
        // changed to not connected
        console.log('watch: getVCcallStatusIsConnected: change to not connected');
        if (this.$refs.remoteStream.srcObject) this.$refs.remoteStream.srcObject = null;
        if (this.peerCall) this.peerCall = null;
        if (this.peer) {
          this.peer.destroy();
          this.peer = null;
        }
      }
    },
    getVCisFetchingReceiverProfile(isFetching) {
      if (isFetching) {
        if (!this.loadingIsShowing) {
          this.$q.loading.show();
          this.loadingIsShowing = true;
        }
      } else if (this.loadingIsShowing) {
        this.$q.loading.hide();
        this.loadingIsShowing = false;
      }
    },
  },
  created() {
    polyfill({ dragImageTranslateOverride: scrollBehaviourDragImageTranslateOverride });
  },
  mounted() {
    this.vcInitComponent();

    if (this.getVCisFetchingReceiverProfile) {
      this.$q.loading.show();
      this.loadingIsShowing = true;
    }

    this.myVideoPosition = this.getUserVCPostionMyVideo;

    this.debouncedMoveMyCamera = debounce((e) => {
      this.dragPositions.left = this.dragPositions.clientX - e.clientX;
      this.dragPositions.top = this.dragPositions.clientY - e.clientY;
      this.dragPositions.clientX = e.clientX;
      this.dragPositions.clientY = e.clientY;
      if ((this.$refs.myVideo.offsetTop - this.dragPositions.top) > 0) { // prevent error
        this.myVideoPosition.top = this.$refs.myVideo.offsetTop - this.dragPositions.top;
        this.myVideoPosition.left = this.$refs.myVideo.offsetLeft - this.dragPositions.left;
      }
    }, 1, { leading: false, trailing: true });

    if (this.getUserVCPreferenceShowMyVideo) this.myCameraShow();
  },
};
</script>

<style scoped>
  .myVideo {
    background: #fff;
    border: none;
    width: 120px;
    height: 90px;
    margin: 0px;
    padding: 0px;
    float: left;
    position: absolute;
    cursor: move;
  }
</style>
