<template>
  <q-page padding>
    <q-stepper v-model="step" vertical color="primary" animated>
      <!-- FIRST STAGE START -->
      <q-step :name="0" title="Welcome!" icon="mdi-human-greeting" :done="step > 0">
        Let's configure a few things, and then we'll get on our way.
        <q-stepper-navigation>
          <q-btn @click="step++" color="primary" label="Continue" />
        </q-stepper-navigation>
      </q-step>
      <q-step :name="1" title="Display language" icon="mdi-translate-variant" :done="step > 1">
        What language would you like M³ to be displayed in?
        <SelectInput v-model="currentSettings.localAppLang" options="appLanguages" label="Display language" />
        <q-stepper-navigation>
          <q-btn @click="step++" color="primary" label="Continue" :disable="!currentSettings.localAppLang" />
          <q-btn flat @click="step--" color="primary" label="Back" class="q-ml-sm" />
        </q-stepper-navigation>
      </q-step>
      <q-step :name="2" title="Media language" icon="mdi-download" :done="step > 2">
        In what language should media be downloaded?
        <SelectInput v-model="currentSettings.lang" options="jwLanguages" label="Media language" :useInput="true" />
        <q-stepper-navigation>
          <q-btn @click="step++" color="primary" label="Continue" :disable="!currentSettings.lang" />
          <q-btn flat @click="step--" color="primary" label="Back" class="q-ml-sm" />
        </q-stepper-navigation>
      </q-step>
      <q-step :name="3" title="Congregation name" icon="mdi-label" :done="step > 3">
        The name of your congregation or group will be used to quickly switch between profiles, if ever you decide
        create more than one in the future.
        <TextInput v-model="currentSettings.congregationName" />
        <q-stepper-navigation>
          <q-btn @click="step++" color="primary" label="Continue" :disable="!currentSettings.congregationName" />
          <q-btn flat @click="step--" color="primary" label="Back" class="q-ml-sm" />
        </q-stepper-navigation>
      </q-step>
      <q-step :name="4" title="Meeting days and times" icon="mdi-calendar-range" :done="step > 4">
        What are your meeting days and times? We'll use this info to display the media calendar.
        <SelectInput v-model="currentSettings.mwDay" options="days" label="Midweek meeting day" />
        <TimeInput v-model="currentSettings.mwStartTime" :options="['meetingTime']" label="Midweek meeting time" />
        <SelectInput v-model="currentSettings.weDay" options="days" label="Weekend meeting day" />
        <TimeInput v-model="currentSettings.weStartTime" :options="['meetingTime']" label="Weekend meeting time" />
        <q-stepper-navigation>
          <q-btn @click="step++" color="primary" label="Continue"
            :disable="!currentSettings.mwDay || !currentSettings.mwStartTime || !currentSettings.weDay || !currentSettings.weStartTime" />
          <q-btn flat @click="step--" color="primary" label="Back" class="q-ml-sm" />
        </q-stepper-navigation>
      </q-step>
      <q-step :name="5" title="Almost done!" icon="mdi-progress-clock" :done="step > 5">
        We'll start fetching media while we wrap up with our initial setup.
        <q-stepper-navigation>
          <q-btn @click="fetchMedia(); downloadBackgroundMusic(); step++" color="primary" label="Continue" />
          <!-- <q-btn flat @click="step--" color="primary" label="Back" class="q-ml-sm" /> -->
        </q-stepper-navigation>
      </q-step>
      <q-step :name="6" title="Kingdom Hall" icon="mdi-office-building" :done="step > 5">
        Are you using this app at a Kingdom Hall? If so, we'll configure a few things for you right off the bat.
        <q-stepper-navigation>
          <q-btn @click="usingAtKh = true; step = 100" color="primary" label="Yes" />
          <q-btn flat @click="usingAtKh = false; step = 200" color="primary" label="No" class="q-ml-sm" />
        </q-stepper-navigation>
      </q-step>
      <!-- FIRST STAGE END -->

      <!-- KH STAGE START -->
      <template v-if="usingAtKh">
        <q-step :name="100" title="Companion to JW Library" icon="mdi-podium-silver" :done="step > 100">
          <p class="text-subtitle1">Will you be using this app as a companion to JW Library?</p>
          <p>Select 'No' if you plan on using M³ to display all
            meeting media. This will activate fully automated meeting media retrieval, yeartext display, background
            music
            playback, and other practical features. Close JW Library before proceeding if you select 'No'!</p>
          <q-stepper-navigation>
            <q-btn @click="companionToJwl = false; step++" color="primary" label="No" class="q-ml-sm" />
            <q-btn flat @click="companionToJwl = true; step++" color="primary" label="Yes" class="q-ml-sm" />
          </q-stepper-navigation>
        </q-step>
        <q-step :name="101" title="Excellent!" caption="We're off to a good start." icon="mdi-check" :done="step > 101">
          You'll notice the yeartext is now being displayed on the external monitor! But let's keep going.
          <q-stepper-navigation>
            <q-btn @click="step++" color="primary" label="Continue" />
            <q-btn flat @click="step--" color="primary" label="Back" class="q-ml-sm" />
          </q-stepper-navigation>
        </q-step>

        <q-step :name="102" title="Media display" icon="mdi-television" :done="step > 102">
          <p>Look for this button in M³'s footer:
            <MediaDisplayButton :disabled="true" />
          </p>
          <p>Clicking it will allow you to temporarily hide the media and yeartext, and reveal the Zoom participants
            underneath. Once the Zoom part is over, you can show the yeartext again using the same button.</p>
          <p>Tip: To ensure you're able to quickly show and hide Zoom participants on the TV screens when needed, make
            sure that the setting to "use dual monitors" in Zoom is enabled.</p>
          <q-stepper-navigation>
            <q-btn @click="step++" color="primary" label="Continue" />
            <q-btn flat @click="step--" color="primary" label="Back" class="q-ml-sm" />
          </q-stepper-navigation>
        </q-step>
        <q-step :name="103" title="Background music" icon="mdi-music" :done="step > 103">
          <p>Also, look for this button in M³'s footer:
            <MusicButton :disabled="true" />
          </p>
          <p>Clicking it will allow you to start and stop the playback of background music. Music will start playing
            automatically before a meeting is scheduled to start when M³ is launched, and will also stop automatically
            before the meeting starts. However, background music playback will need to be manually started after the
            concluding prayer, using this button.</p>
          <q-stepper-navigation>
            <q-btn @click="step++" color="primary" label="Continue" />
            <q-btn flat @click="step--" color="primary" label="Back" class="q-ml-sm" />
          </q-stepper-navigation>
        </q-step>
        <q-step :name="104" title="OBS Studio" icon="mdi-cctv" :done="step > 104">
          <p class="text-subtitle1">Does your Kingdom Hall use a program called OBS Studio?</p>
          <p>OBS Studio is a free app used to manage camera and video feeds in many Kingdom Halls.</p>
          <q-stepper-navigation>
            <q-btn @click="obsUsed = true; step++" color="primary" label="Yes" class="q-ml-sm" />
            <q-btn flat @click="step = 200" label="No" class="q-ml-sm" />
          </q-stepper-navigation>
        </q-step>
        <template v-if="obsUsed">
          <q-step :name="105" title="OBS Studio integration" icon="mdi-cctv" :done="step > 105">
            <p class="text-subtitle1">Would you like to integrate M³ with OBS Studio?</p>
            <p>Doing so will greatly simplify and facilitate sharing media during hybrid meetings.</p>
            <q-stepper-navigation>
              <q-btn @click="obsIntegrate = true; step++" color="primary" label="Yes" class="q-ml-sm" />
              <q-btn flat @click="step = 200" label="No" class="q-ml-sm" />
              <q-btn flat @click="step--" label="Back" class="q-ml-sm" />
            </q-stepper-navigation>
          </q-step>
          <template v-if="obsIntegrate">
            <q-step :name="106" title="OBS Studio configuration" icon="mdi-cogs" :done="step > 106">
              <p class="text-subtitle1">Is OBS Studio configured correctly?</p>
              <p>You'll need to configure the Websocket plugin in OBS Studio. The Virtual Camera plugin is also
                required, so make sure it's installed and configured as well.</p>
              <q-stepper-navigation>
                <q-btn @click="step++" color="primary" label="Continue" class="q-ml-sm" />
                <q-btn flat @click="step = 200" label="Skip for now" class="q-ml-sm" />
              </q-stepper-navigation>
            </q-step>
            <q-step :name="107" title="OBS Studio port and password" icon="mdi-form-textbox-password"
              :done="step > 107">
              <p>Enter the port and password configured in OBS Studio's Websocket plugin.</p>
              <TextInput v-model="currentSettings.obsPort" label="OBS Studio Websocket port" :actions="['obsConnect']" />
              <TextInput v-model="currentSettings.obsPassword" label="OBS Studio Websocket password" :actions="['obsConnect']" />
              <!-- TODO: test if port and password are valid -->
              <q-stepper-navigation>
                <q-btn @click="step++" color="primary" label="Continue" class="q-ml-sm"
                  :disable="!currentSettings.obsPort || !currentSettings.obsPassword" />
                <q-btn flat @click="step--" label="Back" class="q-ml-sm" />
              </q-stepper-navigation>
            </q-step>
            <q-step :name="108" title="OBS Studio stage scene" icon="mdi-lectern" :done="step > 108">
              <p class="text-subtitle1">Configure a scene in OBS Studio to show a stage wide shot.</p>
              <p>Once the scene has been created, select it here.</p>
              <TextInput v-model="currentSettings.obsCameraScene" />
              <!-- TODO: add a list of scenes to select -->
              <q-stepper-navigation>
                <q-btn @click="step++" color="primary" label="Continue" class="q-ml-sm"
                  :disable="!currentSettings.obsCameraScene" />
                <q-btn flat @click="step--" label="Back" class="q-ml-sm" />
              </q-stepper-navigation>
            </q-step>
            <q-step :name="109" title="OBS Studio media scene" icon="mdi-lectern" :done="step > 109">
              <p class="text-subtitle1">Configure a scene in OBS Studio to capture the media window.</p>
              <p>Once the scene has been created, select it here.</p>
              <TextInput v-model="currentSettings.obsMediaScene" />
              <!-- TODO: add a list of scenes to select -->
              <q-stepper-navigation>
                <q-btn @click="step = 200" color="primary" label="Continue" class="q-ml-sm"
                  :disable="!currentSettings.obsMediaScene" />
                <q-btn flat @click="step--" label="Back" class="q-ml-sm" />
              </q-stepper-navigation>
            </q-step>
          </template>
        </template>
        <!-- KH STAGE END -->
        <q-step :name="200" title="Congratulations!" icon="mdi-seal" :done="step > 105">
          <p class="text-subtitle1">M³ is now ready to be used.</p>
          <p>Feel free to browse around the other available options, or if you prefer you can head right to the media
            playback screen and start using it to display media.</p>
          <q-stepper-navigation>
            <q-btn @click="goToPage('/media-calendar')" color="primary" label="Media playback" class="q-ml-sm" />
            <q-btn outlined @click="goToPage('/settings')" label="Settings" class="q-ml-sm" />
            <q-btn flat @click="step = 0" label="Start over" class="q-ml-sm" />
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
const { jwLanguages } = storeToRefs(jwStore);
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
    const filteredJwLanguages = ref(jwLanguages.value.list)
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
      filterFn(val: string, update: (arg0: { (): void; (): void; }) => void) {
        if (val === '') {
          update(() => {
            filteredJwLanguages.value = jwLanguages.value.list
          })
          return
        }
        update(() => {
          const needle = val.toLowerCase()
          filteredJwLanguages.value = jwLanguages.value.list.filter(v => v.name.toLowerCase().indexOf(needle) > -1)
        })
      },
      getListOptions: (list: string | undefined) => {
        if (list == 'jwLanguages') {
          return filteredJwLanguages.value.map((language) => {
            return { label: language.name, value: language.langcode }
          })
        } else if (list == 'darkModes') {
          return [{ label: 'Automatic', value: 'auto' }, { label: 'Dark', value: true }, { label: 'Light', value: false }]
        } else {
          return undefined
        }
      },
    }
  }
})


</script>
