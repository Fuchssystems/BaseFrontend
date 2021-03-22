<template>
  <div>
    <div style="height: 1300px">
      <q-item v-if='getChatSelectedProfile' style="margin-top: 48px">
        <q-item-section avatar>
          <q-avatar rounded>
            <img :src="getChatSelectedProfile.profile_image.filecontent">
          </q-avatar>
        </q-item-section>
        <q-item-section style="max-width: 250px">
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
            {{ vcReceiverStatusDisplay }}
          </q-item-label>
        </q-item-section>
      </q-item>

      <div style="width: 100%, height: 400px; max-height: 400px">
        <video width='100%' height='100%' ref='remoteStream' autoPlay='true'
          :muted='getUserVCPreferenceRemoteAudioMuted'
        >
        </video>
      </div>

      <div v-if="getUserVCPreferenceShowMyVideo" class='myVideo'
        :style='`top: ${myVideoPosition.top}px;
          left: ${myVideoPosition.left}px;
          z-index: 100;`'
        ref='myVideo'
        draggable="false"
      >
        <video muted :width='myVideoWidth' :height='myVideoHeight'
          display="block"
          ref='videoMyStream' autoPlay='true'
          draggable="false"
          v-touch-pan.prevent.mouse='onMyVideoDrag'
        >
        </video>
      </div>


      <error-row-card :errorList="getVCerrorList" />

      <console-log-card v-if='getUserVCPreferenceShowDebugConsole'
        class="q-ma-md"
        :logArray="logArray" @onClearDebugConsole='logArray = []'
        @onCloseDebugConsole='onDebugConsoleToggle'
      />
    </div>

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
        <q-btn push round dense color="black" text-color="white"
          :icon='getUserVCPreferenceShowDebugConsole ? "las la-comment" : "las la-comment-slash"'
          size="md"
          style="margin: 5px 0px 5px 16px"
          @click='onDebugConsoleToggle'
        />
      </div>
    </q-page-sticky>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import { mapSagaActions } from 'vuex-coolstory';
import ErrorRowCard from 'components/Cards/ErrorRowCard.vue';
import ConsoleLogCard from 'components/Cards/ConsoleLogCard.vue';
import { debounce } from 'lodash';
import Peer from 'peerjs';
import { USER_UPDATE_FIELDS_SILENT } from '../store/module-user/constants.js';
import {
  VC_CALL_END_CALL,
  VC_CALL_UPDATE_CALL_STATUS,
  VC_REQUEST_NEW_CALL,
  VC_STATUS_FREE,
  VC_STATUS_REQUEST_NEW_CALL,
  VC_WEBRTC_STATUS_CONNECTED,
  VC_WEBRTC_STATUS_NEGOTIATING,
  VC_WEBRTC_STATUS_TIMEDOUT,
} from '../store/module-videochat/constants.js';
import { serverDateToLocalDateTimeString } from '../lib/dateTime.js';
import { backendURL } from '../lib/configBackend.js'; // substring from URL part of peerjs peer id

export default {
  name: 'ProfileDetailVideochat',
  components: {
    'error-row-card': ErrorRowCard,
    'console-log-card': ConsoleLogCard,
  },
  data() {
    return {
      myVideoPosition: {
        top: 40,
        left: 20,
      },
      myVideoWidth: '0px',
      myVideoHeight: '0px',
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
      logArray: [], // debugging
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
      if (this.call && this.call.open) this.call.close();
    },
    getUserMediaMyCamera() {
    // video stream
    // https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
      navigator.mediaDevices.getUserMedia({ audio: true, video: { facingMode: 'user' } })
        .then((mediaStream) => {
          this.myMediaStream = mediaStream;
          if (this.$refs.videoMyStream) {
            const video = this.$refs.videoMyStream;
            video.srcObject = this.myMediaStream;
            video.onloadedmetadata = () => {
              video.play();
            };

            const settings = this.myMediaStream.getVideoTracks()[0].getSettings();
            if (settings.width >= settings.height) {
              this.myVideoWidth = '120px';
              this.myVideoHeight = `${Math.round(settings.height / settings.width * 120)}px`;
            } else {
              this.myVideoWidth = `${Math.round(settings.height / settings.width * 120)}px`;
              this.myVideoHeight = '120px';
            }
          }
        })
        .catch((err) => { // always check for errors at the end.
          console.log(`${err.name}: ${err.message}`);
          this.userPrefenceSet({ key: 'showMyVido', value: false });
        });
    },
    getUserMediaIncomingCall() {
      navigator.mediaDevices.getUserMedia({ audio: true, video: { facingMode: 'user' } })
        .then((mediaStream) => {
          this.peerCall.answer(mediaStream);
          this.peerCall.on('stream', (remoteStream) => {
            const video = this.$refs.remoteStream;
            video.srcObject = remoteStream;
            video.onloadedmetadata = () => {
              video.play();
            };
            console.log('this.vcSetWebRTCstatus(VC_WEBRTC_STATUS_CONNECTED)');
            this.vcSetWebRTCstatus(VC_WEBRTC_STATUS_CONNECTED);
          });
        })
        .catch((err) => { // always check for errors at the end.
          console.log(`${err.name}: ${err.message}`);
        });
    },
    getUserMediaOutgoingCall() {
      navigator.mediaDevices.getUserMedia({ audio: true, video: { facingMode: 'user' } })
        .then((mediaStream) => {
          console.log('getUserMediaOutgoingCall mediaStream');
          // outgoing call
          console.log(`calling peer: ${backendURL.substr(8, 2)}-fc-profile-${this.getChatSelectedProfile.id}`);
          this.peerCall = this.peer.call(`${backendURL.substr(8, 2)}-fc-profile-${this.getChatSelectedProfile.id}-session-${this.getVCcallEntity.session_id_receiver}`,
            mediaStream, this.peerOptions);
          this.peerCall.on('error', (error) => {
            this.vcSetError({ errorTextArray: [error] });
          });
          this.peerCall.on('close', () => {
            console.log('on close outgoing call');
          });
          this.peerCall.on('stream', (remoteStream) => {
            console.log('outgoing call: this.peerCall.on stream');
            const video = this.$refs.remoteStream;
            video.srcObject = remoteStream;
            video.onloadedmetadata = () => {
              video.play();
            };
            console.log('this.vcSetWebRTCstatus(VC_WEBRTC_STATUS_CONNECTED)');
            this.vcSetWebRTCstatus(VC_WEBRTC_STATUS_CONNECTED);
          });
        })
        .catch((err) => { // always check for errors at the end.
          console.log(`${err.name}: ${err.message}`);
        });
    },
    onCameraToggle() {
      this.userPrefenceSet({ key: 'showMyVido', value: !this.getUserVCPreferenceShowMyVideo });
      if (this.getUserVCPreferenceShowMyVideo) {
        this.getUserMediaMyCamera();
      } else if (this.myMediaStream) {
        if (this.$refs.videoMyStream && this.$refs.videoMyStream.srcObject) {
          this.$refs.videoMyStream.srcObject = null;
        }
        // this.myMediaStream = null;
      }
      // save user preferences in backend
      this[USER_UPDATE_FIELDS_SILENT](
        {
          fields: { user: { preferences: this.getUserPreferenceObject } },
          token: this.getUserToken,
        },
      );
    },
    onMyVideoDrag(ev) {
      if (ev.isFirst) {
        this.dragPositions.clientX = ev.evt.clientX;
        this.dragPositions.clientY = ev.evt.clientY;
      }
      this.debouncedMoveMyCamera(ev.evt);
      if (ev.isFinal) this.onMyVideoDragEnd();
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
    onDebugConsoleToggle() {
      this.userPrefenceSet({ key: 'showDebugConsole', value: !this.getUserVCPreferenceShowDebugConsole });
      // save user preferences in backend
      this[USER_UPDATE_FIELDS_SILENT](
        {
          fields: { user: { preferences: this.getUserPreferenceObject } },
          token: this.getUserToken,
        },
      );
    },
    newPeer() {
      const peerId = `${backendURL.substr(8, 2)}-fc-profile-${this.getUserActiveProfileId}-session-${this.getUserSessionId}`;
      console.log(`newPeer: peerId: ${peerId}`);
      this.peer = new Peer(peerId, {
        config: {
          iceServers: [
            { url: 'stun:stun.l.google.com:19302' },
            { url: 'turn:turn.bistri.com:80', credential: 'homeo', username: 'homeo' },
          ],
        },
        debug: 3, // 0 = no logs, 1 = only errors, 2 = and warnings, 3 = all
      });
      this.peer.on('error', (error) => {
        this.vcSetError({ errorTextArray: [error] });
      });
      this.peer.on('call', (call) => {
        console.log('incoming call: this.peer.on call');
        this.peerCall = call;
        this.peerCall.on('error', (error) => {
          this.vcSetError({ errorTextArray: [error] });
        });
        this.peerCall.on('close', () => {
          console.log('on close incoming call');
        });
        this.getUserMediaIncomingCall();
      });
    },
    timeoutFunctionCheckAndHandleWebRTCtimedOut() {
      console.log('timeoutFunctionCheckAndHandleWebRTCtimedOut');
      // check if incoming mediastream exists for call status connected and handle
      if (this.getVCcallStatusIsConnected
        && this.getVCwebRTCStatus === VC_WEBRTC_STATUS_NEGOTIATING) {
        console.log('WebRTC: times out');
        this.vcSetWebRTCstatus(VC_WEBRTC_STATUS_TIMEDOUT);
        this.onEndCallButton();
      }
    },
    ...mapActions([
      'userPrefenceSet',
      'vcInitComponent',
      'vcResetErrorlist',
      'vcSetCallerStatus',
      'vcSetError',
      'vcSetWebRTCstatus',
    ]),
    ...mapSagaActions([
      USER_UPDATE_FIELDS_SILENT,
      VC_CALL_UPDATE_CALL_STATUS,
      VC_REQUEST_NEW_CALL,
    ]),
  },
  computed: {
    vcReceiverStatusDisplay() {
      if (this.getChatVCReceiverOnlineStatus) {
        return this.getChatVCReceiverOnlineStatus;
      }
      if (this.getVCReceiverStatusDisplay) {
        return this.getVCReceiverStatusDisplay;
      }
      if (!this.myMediaStream) {
        return this.$t('vcReceiverStatusDisplay_no_mediastream');
      }
      return '';
    },
    ...mapGetters([
      'getChatSelectedProfile',
      'getChatVCReceiverOnlineStatus',
      'getUserActiveProfileId',
      'getUserPreferenceObject',
      'getUserSessionId',
      'getUserToken',
      'getUserVCPostionMyVideo',
      'getUserVCPreferenceRemoteAudioMuted',
      'getUserVCPreferenceShowDebugConsole',
      'getUserVCPreferenceShowMyVideo',
      'getVCcallEntity',
      'getVCplayRingbacktone',
      'getVCcallerStatus',
      'getVCerrorList',
      'getVCcallIsOutgoing',
      'getVCcallStatusIsConnected',
      'getVCisFetchingReceiverProfile',
      'getVCmodeUseReceivedProfile',
      'getVCReceiverStatusDisplay',
      'getVCwebRTCStatus',
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
    getVCcallStatusIsConnected(isConnected, oldIsConnected) {
      console.log(`getVCcallStatusIsConnected: ${this.getVCcallStatusIsConnected}`);
      if (isConnected) {
        setTimeout(this.timeoutFunctionCheckAndHandleWebRTCtimedOut, 10000);
        if (this.getVCcallIsOutgoing) {
          this.getUserMediaOutgoingCall();
        }
      } else if (oldIsConnected) {
        // changed to not connected
        console.log('watch: getVCcallStatusIsConnected: change to not connected');
        if (this.$refs.remoteStream.srcObject) this.$refs.remoteStream.srcObject = null;
        if (this.call && this.call.open) this.call.close();
        if (this.peer) this.peer.destroy();
        this.newPeer();
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
  mounted() {
    this.vcInitComponent();

    if (this.getVCisFetchingReceiverProfile) {
      this.$q.loading.show();
      this.loadingIsShowing = true;
    } else if (!this.getChatSelectedProfile) {
      // reload without profile: go to /chat
      this.$router.push('/chat');
    }

    this.myVideoPosition = this.getUserVCPostionMyVideo;

    this.debouncedMoveMyCamera = debounce((e) => {
      if (e.touches) {
        if (e.touches[0]) {
          this.dragPositions.left = this.dragPositions.clientX - e.touches[0].clientX;
          this.dragPositions.top = this.dragPositions.clientY - e.touches[0].clientY;
          this.dragPositions.clientX = e.touches[0].clientX;
          this.dragPositions.clientY = e.touches[0].clientY;
        }
      } else {
        this.dragPositions.left = this.dragPositions.clientX - e.clientX;
        this.dragPositions.top = this.dragPositions.clientY - e.clientY;
        this.dragPositions.clientX = e.clientX;
        this.dragPositions.clientY = e.clientY;
      }
      if ((this.$refs.myVideo.offsetTop - this.dragPositions.top) > 0) { // prevent error
        this.myVideoPosition.top = this.$refs.myVideo.offsetTop - this.dragPositions.top;
        this.myVideoPosition.left = this.$refs.myVideo.offsetLeft - this.dragPositions.left;
      }
    }, 1, { leading: false, trailing: true });

    if (this.getUserVCPreferenceShowMyVideo) this.getUserMediaMyCamera();

    this.newPeer();

    if (!console.stdlog) {
      console.stdlog = console.log.bind(console);
    }
    console.log = (...args) => {
      // eslint-disable-next-line prefer-spread
      console.stdlog(...args);
      if (this.logArray) this.logArray.push(args);
    };
  },
  beforeDestroy() {
    if (this.getVCcallerStatus !== VC_STATUS_FREE) {
      this.onEndCallButton();
    }
    if (this.peer) this.peer.destroy();
  },
};
</script>

<style scoped>
  .myVideo {
    border: none;
    margin: 0px 0px 0px 0px;
    padding: 0px 0px 0px 0px;
    float: left;
    position: absolute;
  }
</style>
