<template>
  <q-page>
    <div style="margin-top: 30px; margin-right: 6px; margin-left: -19px;
      width: 100%; max-width: 600px">
      <q-carousel
        swipeable
        animated
        ref='carouselProfiles'
        :value='getChatSelectedProfileId'
        @input='onProfileInput'
        height='197px'
      >
        <q-carousel-slide
          v-for="
          profile in getChatProfiles" :key="profile.id"
          :name="profile.id"
        >
          <div class="row q-pa-sm" style="width: 100%; max-width: 600px;">
            <div class="col-3" style="width: 160px">
              <q-img
                class="rounded-borders"
                :src="profile.profile_image.filecontent"
              />
            </div>
            <div class="col" style="margin-left: 12px">
              <div class="text-h6">{{ profile.name }} </div>
              <div class="text-body2" style="margin-top: -4px; margin-left: -6px">
                <q-icon :name="attributeOptions[profile.gender_male_female_diverse_null].icon"
                  :color="attributeOptions[profile.gender_male_female_diverse_null].color"
                  size="sm"
                />
                {{ `${profile.ageYears} ${$t('app_word_years')}` }}
                <q-toggle
                  :value="!!profile.is_contact"
                  @input='onToggleIsContact(profile)'
                  :icon='attributeOptions.is_contact.icon'
                  :color='attributeOptions.is_contact.color'
                />
              </div>
              <div v-if="profile.online" style="margin-top: -2px">
                <q-badge color="red">
                    {{ $t('profile_onlineStatus_online') }}
                </q-badge>
              </div>
              <div v-if="!profile.online && profile.last_online"
                style="margin-top: -2px" class="text-body2">
                {{ `${$t('profile_onlineStatus_last_online')} ${serverDateToLocalDateTimeString(
                    profile.last_online)}`
                }}
              </div>
              <div v-if="!profile.online && !profile.last_online"
                style="margin-top: -2px; height: 21px;">
              </div>
              <div class="text-body2 q-mt-sm" style="margin-top: 5px">
                {{ `${profile.country_code_iso_3166_alpha_2}-${profile.areacode} ${profile.city}` }}
              </div>
              <div class="text-bod2">
                {{ `${$t('app_word_distance')}: ${profile.distance} km` }}
              </div>
            </div>
          </div>
        </q-carousel-slide>
      </q-carousel>

      <div class="row" style="width: 100%; max-width: 600px;">
        <div class="col" style="margin-top: 6px; margin-left: 152px">
          <q-btn
            push round dense color="black" text-color="white" icon="navigate_before"
            style="margin-right: 10px"
            @click="$router.go(-1)"
          />
          <q-btn
            push round dense color="primary" text-color="black" icon="arrow_left"
            style="margin-right: 5px"
            :disabled='getChatSelectedProfileIndex === 0'
            @click='onButtonGotoPanel("previous")'
          />
          <q-btn
            push round dense color="primary" text-color="black" icon="arrow_right"
            :disabled='getChatSelectedProfileIndex >= getChatProfiles.length - 1'
            @click='onButtonGotoPanel("next")'
          />
          <q-slider :min="1" :max='getChatProfiles.length' color="primary"
            :value="getChatSelectedProfileIndex + 1"
            @input='onSliderProfileIndex'
            class="vertical-top"
            style="width: 60px; display: inline-block;
              margin: 6px -30px -6px 20px; padding-right: 0px"
            :step="1"
            label
            :label-value='`${getChatSelectedProfileIndex + 1}/${getChatProfiles.length}`'
            label-always
          />
        </div>
      </div>
    </div>

    <div class="q-pr-sm" style="margin-left: 5px; width: 100%; max-width: 600px">
      <div class="div-carousel" v-if='getChatProfileImages.length'>
        <q-carousel
          swipeable
          animated
          :arrows='getChatProfileImages.length > 1'
          :thumbnails='getChatProfileImages.length > 1'
          :value='getChatProfileImagesSelectedId'
          :fullscreen.sync="carouselProfileImagesFullscreen"
          infinite
          @input='chatSetSelectedProfileImageId'
          height='480px'
        >
          <q-carousel-slide
            v-for="image in getChatProfileImages" :image='image' :key="image.id"
            :name="image.id"
            :img-src='image.filecontent'
          />

          <template v-slot:control>
            <q-carousel-control
              position="bottom-right"
              :offset="[18, 18]"
            >
              <q-btn
                push round dense color="white" text-color="primary"
                :icon="carouselProfileImagesFullscreen ? 'fullscreen_exit' : 'fullscreen'"
                @click="carouselProfileImagesFullscreen = !carouselProfileImagesFullscreen"
              />
            </q-carousel-control>
          </template>
        </q-carousel>
      </div>
    </div>

    <q-skeleton height='120px' class="q-ma-sm" style="width: 100%; max-width: 600px"
      v-if='getChatProfileImagesIsFetching'
    />

    <div v-if="getChatProfileImagesShowNoImagesFound"
        class="text-h6 q-mx-md text-blue-grey-8"
      >
        {{ m('app_search_message_no_recordnames', { recordname: 'picture' }) }}
    </div>

    <error-row-card :errorList="getChatProfileImagesErrorList" />

    <q-page-sticky expand position="bottom">
      <div class="bg-primary" style="width: 100%; height:34px">
        <q-btn push round dense color="black" text-color="white" icon="navigate_before"
          size="sm"
          style="margin: 5px 0px 5px 16px"
          @click="$router.go(-1)"
        />
      </div>
    </q-page-sticky>
  </q-page>
</template>

<script>
import { throttle } from 'lodash';
import { mapGetters, mapActions } from 'vuex';
import { mapSagaActions } from 'vuex-coolstory';
import ErrorRowCard from 'components/Cards/ErrorRowCard.vue';
import {
  CHAT_FETCH_PROFILE_IMAGES,
  CHAT_CANCEL_FETCH_PROFILE_IMAGES,
  CHAT_POST_UPDATE_PROFILE_RELATION,
} from '../store/module-chat/constants.js';
import { attributeOptions } from '../store/module-chat/attributeOptions.js';
import { m } from '../lib/i18nCustomFormatMessage.js';
import { serverDateToLocalDateTimeString } from '../lib/dateTime.js';

export default {
  name: 'ProfileDetailInfo',
  components: {
    'error-row-card': ErrorRowCard,
  },
  data() {
    return {
      profileIdsToRemoveFromSelection: [],
      carouselProfileImagesFullscreen: false,
      attributeOptions,
      m,
      serverDateToLocalDateTimeString,
    };
  },
  methods: {
    fetchSelectedProfileIdImages: throttle(function throttledFunction() {
      this.chatClearProfileImagesFetchResult();
      if (this.getChatProfileImagesErrorList.length) this.chatProfileImagesResetErrorlist();
      this[CHAT_FETCH_PROFILE_IMAGES](
        {
          profileId: this.getChatSelectedProfileId,
          token: this.getUserToken,
        },
      );
    }, 100), // throttle fetch to 1 in 100 ms
    onProfileInput(id) { // profile change by swiping
      this.chatSetSelectedProfileId(id);
      this.fetchSelectedProfileIdImages();
    },
    onButtonGotoPanel(selector) {
      const index = selector === 'next' ? this.getChatSelectedProfileIndex + 1
        : this.getChatSelectedProfileIndex - 1;
      this.chatSetSelectedProfileId(this.getChatProfiles[index].id);
      this.fetchSelectedProfileIdImages();
    },
    onSliderProfileIndex(indexPlus1) {
      this.chatSetSelectedProfileId(this.getChatProfiles[indexPlus1 - 1].id);
      this.fetchSelectedProfileIdImages();
    },
    onToggleIsContact(profile) {
      this[CHAT_POST_UPDATE_PROFILE_RELATION]({
        thisProfileId: this.getUserActiveProfileId,
        profile: { ...profile, is_contact: !profile.is_contact },
        token: this.getUserToken,
      });
      // remove contacts set to false from selection in search mode contacts and new messages
      if (!this.getUserPreferenceChatSearchModeIsProfiles) {
        if (profile.is_contact) {
          this.profileIdsToRemoveFromSelection.push(profile.id);
        } else {
          const index = this.profileIdsToRemoveFromSelection.findIndex(e => e === profile.id);
          if (index !== -1) this.profileIdsToRemoveFromSelection.splice(index, 1);
        }
      }
    },
    ...mapActions([
      'chatRemoveProfilesFromSelection',
      'chatSetSelectedProfileId',
      'chatSetSelectedProfileImageId',
      'chatClearProfileImagesFetchResult',
      'chatProfileImagesResetErrorlist',
    ]),
    ...mapSagaActions([
      CHAT_FETCH_PROFILE_IMAGES,
      CHAT_CANCEL_FETCH_PROFILE_IMAGES,
      CHAT_POST_UPDATE_PROFILE_RELATION,
    ]),
  },
  computed: {
    ...mapGetters([
      'getChatProfiles',
      'getChatSelectedProfileId',
      'getChatSelectedProfileIndex',
      'getChatProfileImages',
      'getChatProfileImagesIsFetching',
      'getChatProfileImagesProfileIdSet',
      'getChatProfileImagesSelectedId',
      'getChatProfileImagesErrorList',
      'getChatProfileImagesShowNoImagesFound',
      'getUserActiveProfileId',
      'getUserToken',
      'getUserPreferenceChatSearchModeIsProfiles',
    ]),
  },
  mounted() {
    if (this.getChatSelectedProfileId !== this.getChatProfileImagesProfileIdSet) {
      this.fetchSelectedProfileIdImages();
    }
  },
  beforeDestroy() {
    console.log('before destroy: this.profileIdsToRemoveFromSelection');
    console.log(this.profileIdsToRemoveFromSelection);
    this.chatRemoveProfilesFromSelection(this.profileIdsToRemoveFromSelection);
    this[CHAT_CANCEL_FETCH_PROFILE_IMAGES]();
  },
};
</script>
