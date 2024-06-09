<template>
  <q-page padding>
    <q-stepper v-model="step" vertical color="primary" animated>
      <!-- FIRST STAGE START -->
      <q-step :name="0" :title="$t('setupWizard.welcome')" icon="mdi-human-greeting" :done="step > 0">
        {{ $t('setupWizard.intro') }}
        <q-stepper-navigation>
          <q-btn @click="step++" color="primary" :label="$t('continue')" />
        </q-stepper-navigation>
      </q-step>
      <q-step :name="1" :title="$t('localAppLang')" icon="mdi-translate-variant" :done="step > 1">
        {{ $t('what-language-would-you-like-m-to-be-displayed-in') }}
        <SelectInput v-model="currentSettings.localAppLang" options="appLanguages" :label="$t('localAppLang')" />
        <q-stepper-navigation>
          <q-btn @click="step++" color="primary" :label="$t('continue')" :disable="!currentSettings.localAppLang" />
          <q-btn flat @click="step--" color="primary" :label="$t('back')" class="q-ml-sm" />
        </q-stepper-navigation>
      </q-step>
      <q-step :name="2" :title="$t('lang')" icon="mdi-download" :done="step > 2">
        {{ $t('in-what-language-should-media-be-downloaded') }}
        <SelectInput v-model="currentSettings.lang" options="jwLanguages" :label="$t('lang')" :useInput="true" />
        <q-stepper-navigation>
          <q-btn @click="step++" color="primary" :label="$t('continue')" :disable="!currentSettings.lang" />
          <q-btn flat @click="step--" color="primary" :label="$t('back')" class="q-ml-sm" />
        </q-stepper-navigation>
      </q-step>
      <q-step :name="3" :title="$t('congregationName')" icon="mdi-label" :done="step > 3">
        {{ $t('the-name-of-your-congregation-or-group-will-be-used-to-quickly-switch-between-profiles-if-ever-you-decide-create-more-than-one-in-the-future') }}
        <TextInput v-model="currentSettings.congregationName" />
        <q-stepper-navigation>
          <q-btn @click="step++" color="primary" :label="$t('continue')" :disable="!currentSettings.congregationName" />
          <q-btn flat @click="step--" color="primary" :label="$t('back')" class="q-ml-sm" />
        </q-stepper-navigation>
      </q-step>
      <q-step :name="4" :title="$t('setupWizard.meetingDaysTimes')" icon="mdi-calendar-range" :done="step > 4">
        {{ $t('what-are-your-meeting-days-and-times-well-use-this-info-to-display-the-media-calendar') }}
        <SelectInput v-model="currentSettings.mwDay" options="days" :label="$t('mwDay')" />
        <TimeInput v-model="currentSettings.mwStartTime" :options="['meetingTime']" :label="$t('mwStartTime')" />
        <SelectInput v-model="currentSettings.weDay" options="days" :label="$t('weDay')" />
        <TimeInput v-model="currentSettings.weStartTime" :options="['meetingTime']" :label="$t('weStartTime')" />
        <q-stepper-navigation>
          <q-btn @click="step++" color="primary" :label="$t('continue')"
            :disable="!currentSettings.mwDay || !currentSettings.mwStartTime || !currentSettings.weDay || !currentSettings.weStartTime" />
          <q-btn flat @click="step--" color="primary" :label="$t('back')" class="q-ml-sm" />
        </q-stepper-navigation>
      </q-step>
      <q-step :name="5" :title="$t('almost-done')" icon="mdi-progress-clock" :done="step > 5">
        {{ $t('well-start-fetching-media-while-we-wrap-up-with-our-initial-setup') }}
        <q-stepper-navigation>
          <q-btn @click="fetchMedia(); downloadBackgroundMusic(); step++" color="primary" :label="$t('continue')" />
          <!-- <q-btn flat @click="step--" color="primary" :label="$t('back')" class="q-ml-sm" />-->
        </q-stepper-navigation>
      </q-step>
      <q-step :name="6" :title="$t('kingdom-hall')" icon="mdi-office-building" :done="step > 5">
        {{ $t('are-you-using-this-app-at-a-kingdom-hall-if-so-well-configure-a-few-things-for-you-right-off-the-bat') }}
        <q-stepper-navigation>
          <q-btn @click="usingAtKh = true; step = 100" color="primary" :label="$t('yes')" />
          <q-btn flat @click="usingAtKh = false; step = 200" color="primary" :label="$t('no')" class="q-ml-sm" />
        </q-stepper-navigation>
      </q-step>
      <!-- FIRST STAGE END -->

      <!-- KH STAGE START -->
      <template v-if="usingAtKh">
        <q-step :name="100" :title="$t('companion-to-jw-library')" icon="mdi-podium-silver" :done="step > 100">
          <p class="text-subtitle1">{{ $t('will-you-be-using-this-app-as-a-companion-to-jw-library') }}</p>
          <p>{{ $t('select-no-if-you-plan-on-using-m-to-display-all-meeting-media-this-will-activate-fully-automated-meeting-media-retrieval-yeartext-display-background-music-playback-and-other-practical-features-close-jw-library-before-proceeding-if-you-select-no') }}</p>
          <q-stepper-navigation>
            <q-btn @click="companionToJwl = false; step++" color="primary" :label="$t('no')" class="q-ml-sm" />
            <q-btn flat @click="companionToJwl = true; step++" color="primary" :label="$t('yes')" class="q-ml-sm" />
          </q-stepper-navigation>
        </q-step>
        <q-step :name="101" :title="$t('excellent')" :caption="$t('good-start')" icon="mdi-check" :done="step > 101">
          {{ $t('notice-the-yeartext-is-now-being-displayed-on-the-external-monitor-but-lets-keep-going') }}
          <q-stepper-navigation>
            <q-btn @click="step++" color="primary" :label="$t('continue')" />
            <q-btn flat @click="step--" color="primary" :label="$t('back')" class="q-ml-sm" />
          </q-stepper-navigation>
        </q-step>

        <q-step :name="102" :title="$t('media-display')" icon="mdi-television" :done="step > 102">
          <p>{{ $t('look-for-this-button-in-m-s-footer') }}
            <MediaDisplayButton :disabled="true" />
          </p>
          <p>{{ $t('clicking-it-will-allow-you-to-temporarily-hide-the-media-and-yeartext-and-reveal-the-zoom-participants-underneath-once-the-zoom-part-is-over-you-can-show-the-yeartext-again-using-the-same-button') }}</p>
          <p>{{ $t('to-quickly-show-and-hide-zoom-participants-on-the-tv-screens-when-needed-make-sure-that-the-setting-to-use-dual-monitors-in-zoom-is-enabled') }}</p>
          <q-stepper-navigation>
            <q-btn @click="step++" color="primary" :label="$t('continue')" />
            <q-btn flat @click="step--" color="primary" :label="$t('back')" class="q-ml-sm" />
          </q-stepper-navigation>
        </q-step>
        <q-step :name="103" :title="$t('background-music')" icon="mdi-music" :done="step > 103">
          <p>{{ $t('also-look-for-this-button-in-m-s-footer') }}
            <MusicButton :disabled="true" />
          </p>
          <p>{{ $t('clicking-it-will-allow-you-to-start-and-stop-the-playback-of-background-music-music-will-start-playing-automatically-before-a-meeting-is-scheduled-to-start-when-m-is-launched-and-will-also-stop-automatically-before-the-meeting-starts-however-background-music-playback-will-need-to-be-manually-started-after-the-concluding-prayer-using-this-button') }}</p>
          <q-stepper-navigation>
            <q-btn @click="step++" color="primary" :label="$t('continue')" />
            <q-btn flat @click="step--" color="primary" :label="$t('back')" class="q-ml-sm" />
          </q-stepper-navigation>
        </q-step>
        <q-step :name="104" :title="$t('obsEnable')" icon="mdi-cctv" :done="step > 104">
          <p class="text-subtitle1">{{ $t('does-your-kingdom-hall-use-a-program-called-obs-studio') }}</p>
          <p>{{ $t('obs-studio-is-a-free-app-used-to-manage-camera-and-video-feeds-in-many-kingdom-halls') }}</p>
          <q-stepper-navigation>
            <q-btn @click="obsUsed = true; step++" color="primary" :label="$t('yes')" class="q-ml-sm" />
            <q-btn flat @click="step = 200" :label="$t('no')" class="q-ml-sm" />
          </q-stepper-navigation>
        </q-step>
        <template v-if="obsUsed">
          <q-step :name="105" :title="$t('obs-studio-integration')" icon="mdi-cctv" :done="step > 105">
            <p class="text-subtitle1">{{ $t('would-you-like-to-integrate-m-with-obs-studio') }}</p>
            <p>{{ $t('doing-so-will-greatly-simplify-and-facilitate-sharing-media-during-hybrid-meetings') }}</p>
            <q-stepper-navigation>
              <q-btn @click="obsIntegrate = true; step++" color="primary" :label="$t('yes')" class="q-ml-sm" />
              <q-btn flat @click="step = 200" :label="$t('no')" class="q-ml-sm" />
              <q-btn flat @click="step--" :label="$t('back')" class="q-ml-sm" />
            </q-stepper-navigation>
          </q-step>
          <template v-if="obsIntegrate">
            <q-step :name="106" :title="$t('obs-studio-configuration')" icon="mdi-cogs" :done="step > 106">
              <p class="text-subtitle1">{{ $t('is-obs-studio-configured-correctly') }}</p>
              <p>{{ $t('configure-the-websocket-plugin-in-obs-studio-the-virtual-camera-plugin-is-also-required-so-make-sure-its-installed-and-configured-as-well') }}</p>
              <q-stepper-navigation>
                <q-btn @click="step++" color="primary" :label="$t('continue')" class="q-ml-sm" />
                <q-btn flat @click="step = 200" :label="$t('skip-for-now')" class="q-ml-sm" />
              </q-stepper-navigation>
            </q-step>
            <q-step :name="107" :title="$t('obs-studio-port-and-password')" icon="mdi-form-textbox-password"
              :done="step > 107">
              <p>{{ $t('enter-the-port-and-password-configured-in-obs-studios-websocket-plugin') }}</p>
              <TextInput v-model="currentSettings.obsPort" :label="$t('obsPort')" :actions="['obsConnect']" />
              <TextInput v-model="currentSettings.obsPassword" :label="$t('obsPassword')" :actions="['obsConnect']" />
              <!-- TODO: test if port and password are valid -->
              <q-stepper-navigation>
                <q-btn @click="step++" color="primary" :label="$t('continue')" class="q-ml-sm"
                  :disable="!currentSettings.obsPort || !currentSettings.obsPassword" />
                <q-btn flat @click="step--" :label="$t('back')" class="q-ml-sm" />
              </q-stepper-navigation>
            </q-step>
            <q-step :name="108" :title="$t('obs-studio-stage-scene')" icon="mdi-lectern" :done="step > 108">
              <p class="text-subtitle1">{{ $t('configure-a-scene-in-obs-studio-to-show-a-stage-wide-shot') }}</p>
              <p>{{ $t('once-the-scene-has-been-created-select-it-here') }}</p>
              <SelectInput v-model="currentSettings.obsCameraScene" :label="$t('obsCameraScene')" options="obsScenes" />
              <q-stepper-navigation>
                <q-btn @click="step++" color="primary" :label="$t('continue')" class="q-ml-sm"
                  :disable="!currentSettings.obsCameraScene" />
                <q-btn flat @click="step--" :label="$t('back')" class="q-ml-sm" />
              </q-stepper-navigation>
            </q-step>
            <q-step :name="109" :title="$t('obs-studio-media-scene')" icon="mdi-lectern" :done="step > 109">
              <p class="text-subtitle1">{{ $t('configure-a-scene-in-obs-studio-to-capture-the-media-window') }}</p>
              <p>{{ $t('once-the-scene-has-been-created-select-it-here') }}</p>
              <SelectInput v-model="currentSettings.obsMediaScene" :label="$t('obsMediaScene')" options="obsNonStageScenes" />
              <q-stepper-navigation>
                <q-btn @click="step = 200" color="primary" :label="$t('continue')" class="q-ml-sm"
                  :disable="!currentSettings.obsMediaScene" />
                <q-btn flat @click="step--" :label="$t('back')" class="q-ml-sm" />
              </q-stepper-navigation>
            </q-step>
          </template>
        </template>
        <!-- KH STAGE END -->
        <q-step :name="200" title="Congratulations!" icon="mdi-seal" :done="step > 105">
          <p class="text-subtitle1">{{ $t('m-is-now-ready-to-be-used') }}</p>
          <p>{{ $t('feel-free-to-browse-around-the-other-available-options-or-if-you-prefer-you-can-head-right-to-the-media-playback-screen-and-start-using-it-to-display-media') }}</p>
          <q-stepper-navigation>
            <q-btn @click="goToPage('/media-calendar')" color="primary" :label="$t('media-playback')" class="q-ml-sm" />
            <q-btn outlined @click="goToPage('/settings')" :label="$t('settings')" class="q-ml-sm" />
            <q-btn flat @click="step = 0" :label="$t('start-over')" class="q-ml-sm" />
          </q-stepper-navigation>
        </q-step>
      </template>

      <!--
    {
      title: 'Where should media be stored?',
      subtitle:
        'Choose the folder in which media to be played at meetings should be saved on this computer.',
      settings: [props.requiredSettings['app.localOutputPath']],
      onComplete: () => {
        if (!firstRunParams.value.companionToJw) startMediaSync()
      },
    },
 */ -->
    </q-stepper>
  </q-page>
  <!-- <pre>{{ currentSettings }}</pre> -->
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue'
import { storeToRefs } from 'pinia';

import { useCurrentStateStore } from 'stores/current-state';
const currentState = useCurrentStateStore();
const { currentSettings } = storeToRefs(currentState);

const usingAtKh = ref(false)
const companionToJwl = ref(true)
const obsUsed = ref(false)
const obsIntegrate = ref(false)


import { useJwStore } from 'src/stores/jw';

const jwStore = useJwStore();
const { updateYeartext } = jwStore;

import { useRouter } from 'vue-router';

import { downloadBackgroundMusic, fetchMedia } from 'src/helpers/jw-media';

watch(usingAtKh, () => {
  enableExternalDisplayAndMusic()
})

watch(companionToJwl, () => {
  enableExternalDisplayAndMusic()
})

async function enableExternalDisplayAndMusic() {
  await updateYeartext(currentSettings.value.lang as string)
  currentSettings.value.enableMediaDisplayButton = usingAtKh.value
  currentSettings.value.hideWinAfterMedia = companionToJwl.value

  if (usingAtKh.value) {
    currentSettings.value.autoStartMusic, !companionToJwl.value
    currentSettings.value.enableMusicFadeOut, !companionToJwl.value
    // currentSettings.specialCong, companionToJwl.value
    currentSettings.value.hideWinAfterMedia, companionToJwl.value
  }

}



export default defineComponent({
  setup() {
    const router = useRouter();
    const goToPage = (path: string) => {
      router.push({ path })
    }
    const step = ref(0)
    return {
      goToPage,
      step,
      currentSettings,
      usingAtKh,
      companionToJwl,
      obsUsed,
      obsIntegrate,
      fetchMedia,
      downloadBackgroundMusic,
    }
  }
})


</script>
