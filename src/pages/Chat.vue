<template>
  <q-page padding>
    <div class="div-profiles">
      <q-list v-if='!getChatIsFetching'
        v-bind:style='profileListStyles()'
      >
        <div v-for="(profile, index) in getChatProfiles" :key="index">
          <q-item clickable v-ripple
            @click="onProfileClicked(index)"
          >
            <q-item-section avatar>
              <q-avatar rounded>
                <img :src="profile.profile_image.filecontent">
              </q-avatar>
            </q-item-section>
            <q-item-section>
              <q-item-label>
                {{ profile.name }}
              </q-item-label>
              <q-item-label caption>
                {{ `${profile.city} ${profile.distance} km` }}
              </q-item-label>
            </q-item-section>
            <q-item-section side top v-if='profile.online'>
              <q-badge color="red" class='q-mt-sm'>
                  {{ $t('profile_onlineStatus_online') }}
              </q-badge>
            </q-item-section>
            <q-item-section side top style="width: 44px">
              <q-icon v-if='profile.is_contact' :name='attributeOptions.is_contact.icon'
                :color='attributeOptions.is_contact.color' class='q-mr-sm'
              />
              <q-badge v-if='profile.relation_unread_messages_count'
                color="red" class='q-mt-sm'
              >
                <q-icon name="email" color="white" class="q-mr-xs" />
                {{ profile.relation_unread_messages_count }}
              </q-badge>
            </q-item-section>
            <q-item-section side top>
              <q-icon :name="attributeOptions[profile.gender_male_female_diverse_null].icon"
                :color="attributeOptions[profile.gender_male_female_diverse_null].color"
              />
              <q-item-label caption class="q-mt-xs">{{ `(${profile.ageYears})` }}</q-item-label>
            </q-item-section>
          </q-item>
          <q-separator inset/>
        </div>
      </q-list>

      <q-skeleton height='480px' v-if='getChatIsFetching'
        v-bind:style='profileListStyles()'
      />

      <div v-if="getChatSearchNothingFound"
        style='margin-top: 150px; margin-left: -26px;'
        class="text-h6 q-mx-md text-blue-grey-8"
      >
        {{ m('app_search_message_no_recordnames_found',
          { recordname: searchModeOptions.recordName[getUserPreferenceChatSearchMode] }) }}
      </div>

      <error-row-card :errorList="getChatErrorList" />

      <q-page-sticky expand position="top">
        <div style="width: 100%">
          <q-tabs
            :value='getUserPreferenceChatSearchMode'
            no-caps
            inline-label
            align="left"
            class="bg-cyan-8 text-white shadow-2"
            :breakpoint="0"
            @input="onTabValueChange"
          >
            <q-tab name="profiles"
              :label='$t("chat_tab_profiles")'
              :icon='attributeOptions.profiles.icon'
            />
            <q-tab name="contacts"
              :label='$t("chat_tab_contacts")'
              :icon='attributeOptions.is_contact.icon'
            />
            <q-tab name="messages"
              :label='$t("chat_tab_messages")'
              :icon='attributeOptions.messages.icon'
            >
              <q-badge v-if='getActiveProfileUnreadMessagesCount'
                style="margin-top: 1px;" color="red" floating
              >
                {{ getActiveProfileUnreadMessagesCount }}
              </q-badge>
            </q-tab>
          </q-tabs>
        </div>

          <div class="row justify-start items-top bg-teal"
            style="width: 100%; max-height: 170px"
          >
            <div class="col-3 q-ma-sm q-pa-sm" style="width:170px">
              <q-input borderless :value = "getChatSearchFilter.name"
                style="width:170px" :input-style="{color:'white'}"
                :placeholder='$t("app_placeholder_typeToStartSearching")'
                :hint='getChatSearchFilter.name.length
                  && getChatSearchFilter.name.length < CHAT_SEARCH_NAME_LENGTH_MIN
                  ? m("chat_field_searchName_hint", {min: CHAT_SEARCH_NAME_LENGTH_MIN}) : ""'
                @input="onNameSearchInput"
              >
                <template v-slot:append>
                    <q-icon v-if="getChatSearchFilter.name !== ''" name="close" color="blue-grey-8"
                      @click="onNameSearchClear" class="cursor-pointer"
                    />
                    <q-icon name="search"  color="blue-grey-2"/>
                </template>
              </q-input>
              <q-toggle v-if='getUserPreferenceChatSearchModeIsProfiles'
                class="gender-toggle" style="margin-left:-14px; margin-top:0px;"
                :value="getChatSearchFilter.all"
                @input="onFilterAllToggle"
                :label='$t("app_search_label_Show_all")'
                color="blue-grey-8"
                checked-icon="check"
                unchecked-icon="clear"
              />
             <q-slider class="xs"
                v-if="getChatPaginationLastPage > 1 && getUserPreferenceChatSearchModeIsProfiles"
                style="margin-left: 10px; margin-top: 34px; margin-bottom: -12px"
                :value="getChatPaginatePageNumberSelected"
                @input='onProfilePageInput'
                @change='onProfilePageChange'
                :min="1"
                :max="getChatPaginationLastPage"
                :step="1"
                label
                :label-value='getChatPageSliderLabel'
                label-always
                color="orange"
              />
              <div v-if="!getChatIsFetching && getChatPaginationLastPage <= 1
                && !nameSearchIsBouncing && getChatProfiles.length
                && getUserPreferenceChatSearchModeIsProfiles && !$q.screen.gt.xs"
                class="text-orange text-weight-bold" style="margin-top: 17px"
              >
                {{ m("app_search_message_number_found", {count: getChatProfiles.length }) }}
              </div>
            </div>

            <div v-if='getUserPreferenceChatSearchModeIsProfiles'
              class="col-3" style="margin-top:16px; width:48px"
            >
              <q-toggle class="gender-toggle"
                :value="getChatSearchFilter.genders.male"
                @input='onGenderToggle("male")'
                :icon='attributeOptions.male.icon'
                :color='attributeOptions.male.color'
              />
              <q-toggle class="gender-toggle"
                :value="getChatSearchFilter.genders.female"
                @input='onGenderToggle("female")'
                :icon='attributeOptions.female.icon'
                :color='attributeOptions.female.color'
              />
              <q-toggle class="gender-toggle"
                :value="getChatSearchFilter.genders.diverse"
                @input='onGenderToggle("diverse")'
                :icon='attributeOptions.diverse.icon'
                :color='attributeOptions.diverse.color'
              />
            </div>

            <div v-if='getUserPreferenceChatSearchModeIsProfiles'
              class="col-3 q-pa-sm justify-end"
              style="margin-top:20px; margin-left:10px; margin-bottom:-10px; width:100px"
            >
              <q-slider
                :value="getChatSearchFilter.minAge"
                @input='chatSetSearchFilterMinAge'
                @change='onAgeChange'
                :min="CHAT_SEARCH_AGE_MIN"
                :max="CHAT_SEARCH_AGE_MAX"
                :step="1"
                label
                :label-value='getChatSearchAgeMinLabel'
                label-always
                color="blue-grey-8"
                style='margin-bottom:12px'
              />
              <q-slider
                :value="getChatSearchFilter.maxAge"
                @input='chatSetSearchFilterMaxAge'
                @change='onAgeChange'
                :min="CHAT_SEARCH_AGE_MIN"
                :max="CHAT_SEARCH_AGE_MAX"
                :step="1"
                label
                :label-value='getChatSearchAgeMaxLabel'
                label-always
                color="blue-grey-8"
              />
              <q-slider class="xs"
                :value="getChatSearchFilter.distance"
                @input='chatSetSearchFilterDistance'
                @change='onDistanceChange'
                :min="0"
                :max="CHAT_SEARCH_DISTANCE_MAX_KM"
                :step="10"
                label
                :label-value='getChatSearchDistanceLabel'
                label-always
                color="blue-grey-8"
                style='margin-top:12px'
              />
            </div>

            <div class="col-3 q-pa-sm"
              v-bind:style='getUserPreferenceChatSearchModeIsProfiles
                ? "margin-top:20px; margin-left: 10px; margin-bottom:-10px; width:100px"
                : "margin-top:30px; margin-left: 20px; margin-bottom:-10px; width:100px"'
            >
              <q-slider v-if='getUserPreferenceChatSearchModeIsProfiles
                  && $q.screen.gt.xs'
                :value="getChatSearchFilter.distance"
                @input='chatSetSearchFilterDistance'
                @change='onDistanceChange'
                :min="0"
                :max="CHAT_SEARCH_DISTANCE_MAX_KM"
                :step="10"
                label
                :label-value='getChatSearchDistanceLabel'
                label-always
                color="blue-grey-8"
                style='margin-bottom:12px'
              />
             <q-slider v-if="getChatPaginationLastPage > 1
                  && (!getUserPreferenceChatSearchModeIsProfiles || $q.screen.gt.xs)"
                :value="getChatPaginatePageNumberSelected"
                @input='onProfilePageInput'
                @change='onProfilePageChange'
                :min="1"
                :max="getChatPaginationLastPage"
                :step="1"
                label
                :label-value='getChatPageSliderLabel'
                label-always
                color="orange"
              />
              <div v-if="!getChatIsFetching && getChatPaginationLastPage <= 1
                && !nameSearchIsBouncing && getChatProfiles.length
                && (!getUserPreferenceChatSearchModeIsProfiles || $q.screen.gt.xs)"
                class="text-orange text-weight-bold" style="margin-top: 17px"
              >
                {{ m("app_search_message_number_found", {count: getChatProfiles.length }) }}
              </div>
            </div>
          </div>
      </q-page-sticky>
    </div>
  </q-page>
</template>

<script>
import { cloneDeep } from 'lodash';
import { mapGetters, mapActions } from 'vuex';
import { mapSagaActions } from 'vuex-coolstory';
import ErrorRowCard from 'components/Cards/ErrorRowCard.vue';
import {
  CHAT_SEARCH,
  CHAT_CANCEL_SEARCH,
  CHAT_SEARCH_AGE_MIN,
  CHAT_SEARCH_AGE_MAX,
  CHAT_SEARCH_DISTANCE_MAX_KM,
  CHAT_SEARCH_NAME_LENGTH_MIN,
  CHAT_FETCH_PROFILE_IMAGES,
} from '../store/module-chat/constants.js';
import { USER_UPDATE_FIELDS_SILENT } from '../store/module-user/constants.js';
import { attributeOptions } from '../store/module-chat/attributeOptions.js';
import { m } from '../lib/i18nCustomFormatMessage.js';
import settings from '../lib/settings.js';

export default {
  data() {
    return {
      CHAT_SEARCH_AGE_MIN,
      CHAT_SEARCH_AGE_MAX,
      CHAT_SEARCH_DISTANCE_MAX_KM,
      CHAT_SEARCH_NAME_LENGTH_MIN,
      nameSearchIsBouncing: false,
      m,
      attributeOptions,
      profileListStyles_modeProfiles_gt_xs: { // styles greater than xs
        marginTop: '134px',
        marginRight: '-24px',
        marginBottom: '-10px',
        marginLeft: '-36px',
        width: '100%',
        maxWidth: '300px',
      },
      profileListStyles_modeProfiles_xs: { // styles xs
        marginTop: '200px',
        marginRight: '-24px',
        marginBottom: '-10px',
        marginLeft: '-36px',
        width: '100%',
        maxWidth: '300px',
      },
      profileListStyles_modeNotProfiles: { // styles xs
        marginTop: '100px',
        marginRight: '-24px',
        marginBottom: '-10px',
        marginLeft: '-36px',
        width: '100%',
        maxWidth: '300px',
      },
      searchModeOptions: {
        recordName: {
          profiles: 'profile',
          contacts: 'contact',
          messages: 'profileWithnewMessage',
        },
      },
    };
  },
  name: 'Chat',
  components: {
    'error-row-card': ErrorRowCard,
  },
  methods: {
    postSearch() {
      console.log(`postsearch: this.getChatSearchFilter.mode
        :${this.getChatSearchFilter.mode}`);
      if (!this.getUserPreferenceChatSearchModeIsProfiles
        || this.getChatSearchFilter.all || this.getChatSearchFilter.name
        || !this.getChatSearchFilter.genders.male || !this.getChatSearchFilter.genders.female
        || !this.getChatSearchFilter.genders.diverse
        || (this.getChatSearchFilter.minAge > CHAT_SEARCH_AGE_MIN)
        || (this.getChatSearchFilter.maxAge < CHAT_SEARCH_AGE_MAX)
        || (this.getChatSearchFilter.distance < CHAT_SEARCH_DISTANCE_MAX_KM)) {
        this[CHAT_SEARCH](
          {
            searchFilter: cloneDeep(this.getChatSearchFilter),
            token: this.getUserToken,
            sessionId: this.getUserSessionId,
          },
        );
      }
    },
    resetSearchResult() {
      console.log('resetSearchResult');
      this.chatClearSearchByFilterResult();
      if (this.getChatErrorList.length) this.chatResetErrorlist();
    },
    onFilterAllToggle() {
      this.chatSetSearchFilterAll(!this.getChatSearchFilter.all);
      if (this.getChatSearchFilter.all) {
        this.resetSearchResult();
        this.postSearch();
      }
    },
    onAgeChange() {
      this.resetSearchResult();
      this.postSearch();
    },
    onNameSearchInput(value) {
      this.nameSearchIsBouncing = true;
      this.chatSetSearchFilterName(value);
      this.resetSearchResult();
      clearTimeout(this.debouncedSearch);
      this.debouncedSearch = setTimeout(() => {
        this.nameSearchIsBouncing = false;
        if ((this.getChatSearchFilter.name.length >= CHAT_SEARCH_NAME_LENGTH_MIN)
          || (!this.getUserPreferenceChatSearchModeIsProfiles
            && !this.getChatSearchFilter.name.length)) {
          this.postSearch();
        }
      }, 600);
    },
    onNameSearchClear() {
      this.chatSetSearchFilterName('');
      this.resetSearchResult();
      this.postSearch();
    },
    onGenderToggle(gender) {
      this.chatSetSearchFilterToggleGender(gender);
      this.resetSearchResult();
      this.postSearch();
    },
    chatSetSearchFilterMinAge(minAge) {
      const ages = { minAge };
      if (minAge > this.getChatSearchFilter.maxAge) ages.maxAge = minAge;
      this.chatSetSearchFilterAges(ages);
    },
    chatSetSearchFilterMaxAge(maxAge) {
      const ages = { maxAge };
      if (maxAge < this.getChatSearchFilter.minAge) ages.minAge = maxAge;
      this.chatSetSearchFilterAges(ages);
    },
    onDistanceChange(distance) {
      this.chatSetSearchFilterDistance(distance);
      this.resetSearchResult();
      this.postSearch();
    },
    onProfileClicked(index) {
      if (settings.featureProfileDetailView) {
        this.chatSetSelectedProfileId(this.getChatProfiles[index].id);
        this.$router.push('/profileDetail');
      }
    },
    onProfilePageInput(value) {
      this.chatSetProfilesPageNumberSelected(value);
    },
    onProfilePageChange(queryPage) {
      this.chatSetSearchFilterQueryPage(queryPage);
      this.postSearch();
    },
    onTabValueChange(newTab) {
      this.userPrefenceSet({
        key: 'chatSearchModeTab',
        value: newTab,
      });
      // save user preferences in backend
      this[USER_UPDATE_FIELDS_SILENT](
        {
          fields: { user: { preferences: this.getUserPreferenceObject } },
          mutateStateAfterResponse: false,
          token: this.getUserToken,
        },
      );
      this.chatSetSearchFilterName('');
      this.chatSetSearchFilterMode(newTab);
      this.resetSearchResult();
      this.postSearch();
    },
    profileListStyles() {
      if (this.getUserPreferenceChatSearchModeIsProfiles) {
        return this.$q.screen.gt.xs
          ? this.profileListStyles_modeProfiles_gt_xs : this.profileListStyles_modeProfiles_xs;
      }
      return this.profileListStyles_modeNotProfiles;
    },
    ...mapActions([
      'chatSetSelectedProfileId',
      'chatSetSearchFilterAll',
      'chatSetSearchFilterName',
      'chatSetSearchFilterMode',
      'chatSetSearchFilterToggleGender',
      'chatSetSearchFilterDistance',
      'chatSetSearchFilterAges',
      'chatClearSearchByFilterResult',
      'chatResetErrorlist',
      // profile pagination
      'chatSetProfilesPageNumberSelected',
      'chatSetSearchFilterQueryPage',
      // profile images
      'chatClearProfileImagesFetchResult',
      'chatProfileImagesResetErrorlist',
      // user preferences
      'userPrefenceSet',
      // videochat
      'vcSetModeUseReceivedProfile',
    ]),
    ...mapSagaActions([
      CHAT_SEARCH,
      CHAT_CANCEL_SEARCH,
      CHAT_FETCH_PROFILE_IMAGES,
      USER_UPDATE_FIELDS_SILENT,
    ]),
  },
  computed: {
    ...mapGetters([
      'getActiveProfileUnreadMessagesCount',
      'getChatProfiles',
      'getChatSearchFilter',
      'getChatSearchDistanceLabel',
      'getChatSearchAgeMinLabel',
      'getChatSearchAgeMaxLabel',
      'getChatIsFetching',
      'getChatSearchNothingFound',
      'getChatErrorList',
      'getUserToken',
      'getUserSessionId',
      // pagination
      'getChatPaginationMetaProfiles',
      'getChatPaginatePageNumberSelected',
      'getChatPaginationLastPage',
      'getChatPageSliderLabel',
      // profile images
      'getChatProfileImagesIsFetching',
      'getChatProfileImagesErrorList',
      // user preferences
      'getUserPreferenceChatSearchMode',
      'getUserPreferenceChatSearchModeIsProfiles',
      'getUserPreferenceObject',
      // videochat
      'getVCmodeUseReceivedProfile',
    ]),
  },
  mounted() {
    this.chatSetSelectedProfileId(null);
    if (this.getVCmodeUseReceivedProfile) {
      this.vcSetModeUseReceivedProfile({ modeUseReceivedProfile: false });
      this.postSearch();
    }
    // this.chatSetSearchFilterMode(this.getUserPreferenceChatSearchMode);
    // this.resetSearchResult();
    // this.postSearch();
  },
  beforeDestroy() {
    this[CHAT_CANCEL_SEARCH]();
  },
};
</script>

<style scoped>
  .div-profiles {
    padding: 16px 16px 1px;
  }
  .q-field {
   height: 50px;
  }
  .gender-toggle {
    margin: -6px -4px -6px -2px;
  }
</style>
