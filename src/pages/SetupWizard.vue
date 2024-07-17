<template>
  <q-page padding>
    <q-stepper animated color="primary" v-model="step" vertical>
      <!-- FIRST STAGE START -->
      <q-step
        :done="step > 0"
        :name="0"
        :title="$t('setupWizard.welcome')"
        icon="mdi-human-greeting"
      >
        {{ $t('setupWizard.intro') }}
        <q-stepper-navigation>
          <q-btn :label="$t('continue')" @click="step++" color="primary" />
        </q-stepper-navigation>
      </q-step>
      <q-step
        :done="step > 1"
        :name="1"
        :title="$t('localAppLang')"
        icon="mdi-translate-variant"
      >
        {{ $t('what-language-would-you-like-m-to-be-displayed-in') }}
        <SelectInput
          :label="$t('localAppLang')"
          options="appLanguages"
          v-model="currentSettings.localAppLang"
        />
        <q-stepper-navigation>
          <q-btn
            :disable="!currentSettings.localAppLang"
            :label="$t('continue')"
            @click="step++"
            color="primary"
          />
          <q-btn
            :label="$t('back')"
            @click="step--"
            class="q-ml-sm"
            color="primary"
            flat
          />
        </q-stepper-navigation>
      </q-step>
      <q-step
        :done="step > 2"
        :name="2"
        :title="$t('lang')"
        icon="mdi-download"
      >
        {{ $t('in-what-language-should-media-be-downloaded') }}
        <SelectInput
          :label="$t('lang')"
          :useInput="true"
          options="jwLanguages"
          v-model="currentSettings.lang"
        />
        <q-stepper-navigation>
          <q-btn
            :disable="!currentSettings.lang"
            :label="$t('continue')"
            @click="step++"
            color="primary"
          />
          <q-btn
            :label="$t('back')"
            @click="step--"
            class="q-ml-sm"
            color="primary"
            flat
          />
        </q-stepper-navigation>
      </q-step>
      <q-step
        :done="step > 3"
        :name="3"
        :title="$t('congregationName')"
        icon="mdi-label"
      >
        {{
          $t(
            'the-name-of-your-congregation-or-group-will-be-used-to-quickly-switch-between-profiles-if-ever-you-decide-create-more-than-one-in-the-future',
          )
        }}
        <TextInput v-model="currentSettings.congregationName" />
        <q-stepper-navigation>
          <q-btn
            :disable="!currentSettings.congregationName"
            :label="$t('continue')"
            @click="step++"
            color="primary"
          />
          <q-btn
            :label="$t('back')"
            @click="step--"
            class="q-ml-sm"
            color="primary"
            flat
          />
        </q-stepper-navigation>
      </q-step>
      <q-step
        :done="step > 4"
        :name="4"
        :title="$t('setupWizard.meetingDaysTimes')"
        icon="mdi-calendar-range"
      >
        {{
          $t(
            'what-are-your-meeting-days-and-times-well-use-this-info-to-display-the-media-calendar',
          )
        }}
        <SelectInput
          :label="$t('mwDay')"
          options="days"
          v-model="currentSettings.mwDay"
        />
        <TimeInput
          :label="$t('mwStartTime')"
          :options="['meetingTime']"
          v-model="currentSettings.mwStartTime"
        />
        <SelectInput
          :label="$t('weDay')"
          options="days"
          v-model="currentSettings.weDay"
        />
        <TimeInput
          :label="$t('weStartTime')"
          :options="['meetingTime']"
          v-model="currentSettings.weStartTime"
        />
        <q-stepper-navigation>
          <q-btn
            :disable="
              !currentSettings.mwDay ||
              !currentSettings.mwStartTime ||
              !currentSettings.weDay ||
              !currentSettings.weStartTime
            "
            :label="$t('continue')"
            @click="step++"
            color="primary"
          />
          <q-btn
            :label="$t('back')"
            @click="step--"
            class="q-ml-sm"
            color="primary"
            flat
          />
        </q-stepper-navigation>
      </q-step>
      <q-step
        :done="step > 5"
        :name="5"
        :title="$t('almost-done')"
        icon="mdi-progress-clock"
      >
        {{
          $t(
            'well-start-fetching-media-while-we-wrap-up-with-our-initial-setup',
          )
        }}
        <q-stepper-navigation>
          <q-btn
            :label="$t('continue')"
            @click="
              fetchMedia();
              downloadBackgroundMusic();
              step = 100;
            "
            color="primary"
          />
          <!-- <q-btn flat @click="step--" color="primary" :label="$t('back')" class="q-ml-sm" />-->
        </q-stepper-navigation>
      </q-step>
      <!-- <q-step
        :done="step > 5"
        :name="6"
        :title="$t('kingdom-hall')"
        icon="mdi-office-building"
      >
        {{
          $t(
            'are-you-using-this-app-at-a-kingdom-hall-if-so-well-configure-a-few-things-for-you-right-off-the-bat',
          )
        }}
        <q-stepper-navigation>
          <q-btn
            :label="$t('yes')"
            @click="
              usingAtKh = true;
              step = 100;
            "
            color="primary"
          />
          <q-btn
            :label="$t('no')"
            @click="
              usingAtKh = false;
              step = 300;
            "
            class="q-ml-sm"
            color="primary"
            flat
          />
        </q-stepper-navigation>
      </q-step> -->
      <!-- FIRST STAGE END -->

      <!-- KH STAGE START -->
      <!-- <template v-if="usingAtKh"> -->
      <q-step
        :caption="$t('good-start')"
        :done="step > 100"
        :name="100"
        :title="$t('excellent')"
        icon="mdi-check"
      >
        {{
          $t(
            'notice-the-yeartext-is-now-being-displayed-on-the-external-monitor-but-lets-keep-going',
          )
        }}
        <q-stepper-navigation>
          <q-btn :label="$t('continue')" @click="step++" color="primary" />
          <q-btn
            :label="$t('back')"
            @click="step--"
            class="q-ml-sm"
            color="primary"
            flat
          />
        </q-stepper-navigation>
      </q-step>

      <q-step
        :done="step > 101"
        :name="101"
        :title="$t('media-display')"
        icon="mdi-television"
      >
        <p>
          {{ $t('look-for-this-button-in-m-s-footer') }}
          <MediaDisplayButton :disabled="true" />
        </p>
        <p>
          {{
            $t(
              'clicking-it-will-allow-you-to-temporarily-hide-the-media-and-yeartext-and-reveal-the-zoom-participants-underneath-once-the-zoom-part-is-over-you-can-show-the-yeartext-again-using-the-same-button',
            )
          }}
        </p>
        <p>
          {{
            $t(
              'to-quickly-show-and-hide-zoom-participants-on-the-tv-screens-when-needed-make-sure-that-the-setting-to-use-dual-monitors-in-zoom-is-enabled',
            )
          }}
        </p>
        <q-stepper-navigation>
          <q-btn :label="$t('continue')" @click="step++" color="primary" />
          <q-btn
            :label="$t('back')"
            @click="step--"
            class="q-ml-sm"
            color="primary"
            flat
          />
        </q-stepper-navigation>
      </q-step>
      <q-step
        :done="step > 102"
        :name="102"
        :title="$t('setupWizard.backgroundMusic')"
        icon="mdi-music-note"
      >
        <p>
          {{ $t('also-look-for-this-button-in-m-s-footer') }}
          <MusicButton :disabled="true" />
        </p>
        <p>
          {{
            $t(
              'clicking-it-will-allow-you-to-start-and-stop-the-playback-of-background-music-music-will-start-playing-automatically-before-a-meeting-is-scheduled-to-start-when-m-is-launched-and-will-also-stop-automatically-before-the-meeting-starts-however-background-music-playback-will-need-to-be-manually-started-after-the-concluding-prayer-using-this-button',
            )
          }}
        </p>
        <q-stepper-navigation>
          <q-btn :label="$t('continue')" @click="step++" color="primary" />
          <q-btn
            :label="$t('back')"
            @click="step--"
            class="q-ml-sm"
            color="primary"
            flat
          />
        </q-stepper-navigation>
      </q-step>
      <q-step
        :done="step > 103"
        :name="103"
        :title="$t('obsEnable')"
        icon="mdi-cctv"
      >
        <p class="text-subtitle1">
          {{ $t('does-your-kingdom-hall-use-a-program-called-obs-studio') }}
        </p>
        <p>
          {{
            $t(
              'obs-studio-is-a-free-app-used-to-manage-camera-and-video-feeds-in-many-kingdom-halls',
            )
          }}
        </p>
        <q-stepper-navigation>
          <q-btn
            :label="$t('yes')"
            @click="
              obsUsed = true;
              step++;
            "
            class="q-ml-sm"
            color="primary"
          />
          <q-btn :label="$t('no')" @click="step = 200" class="q-ml-sm" flat />
        </q-stepper-navigation>
      </q-step>
      <template v-if="obsUsed">
        <q-step
          :done="step > 104"
          :name="104"
          :title="$t('obs-studio-integration')"
          icon="mdi-cctv"
        >
          <p class="text-subtitle1">
            {{ $t('would-you-like-to-integrate-m-with-obs-studio') }}
          </p>
          <p>
            {{
              $t(
                'doing-so-will-greatly-simplify-and-facilitate-sharing-media-during-hybrid-meetings',
              )
            }}
          </p>
          <q-stepper-navigation>
            <q-btn
              :label="$t('yes')"
              @click="
                obsIntegrate = true;
                step++;
              "
              class="q-ml-sm"
              color="primary"
            />
            <q-btn :label="$t('no')" @click="step = 200" class="q-ml-sm" flat />
            <q-btn :label="$t('back')" @click="step--" class="q-ml-sm" flat />
          </q-stepper-navigation>
        </q-step>
        <template v-if="obsIntegrate">
          <q-step
            :done="step > 105"
            :name="105"
            :title="$t('obs-studio-configuration')"
            icon="mdi-cogs"
          >
            <p class="text-subtitle1">
              {{ $t('is-obs-studio-configured-correctly') }}
            </p>
            <p>
              {{
                $t(
                  'configure-the-websocket-plugin-in-obs-studio-the-virtual-camera-plugin-is-also-required-so-make-sure-its-installed-and-configured-as-well',
                )
              }}
            </p>
            <q-stepper-navigation>
              <q-btn
                :label="$t('continue')"
                @click="step++"
                class="q-ml-sm"
                color="primary"
              />
              <q-btn
                :label="$t('skip-for-now')"
                @click="step = 200"
                class="q-ml-sm"
                flat
              />
            </q-stepper-navigation>
          </q-step>
          <q-step
            :done="step > 106"
            :name="106"
            :title="$t('obs-studio-port-and-password')"
            icon="mdi-form-textbox-password"
          >
            <p>
              {{
                $t(
                  'enter-the-port-and-password-configured-in-obs-studios-websocket-plugin',
                )
              }}
            </p>
            <TextInput
              :actions="['obsConnect']"
              :label="$t('obsPort')"
              v-model="currentSettings.obsPort"
            />
            <TextInput
              :actions="['obsConnect']"
              :label="$t('obsPassword')"
              v-model="currentSettings.obsPassword"
            />
            <q-stepper-navigation>
              <q-btn
                :disable="
                  !currentSettings.obsPort || !currentSettings.obsPassword
                "
                :label="$t('continue')"
                @click="step++"
                class="q-ml-sm"
                color="primary"
              />
              <q-btn :label="$t('back')" @click="step--" class="q-ml-sm" flat />
            </q-stepper-navigation>
          </q-step>
          <q-step
            :done="step > 107"
            :name="107"
            :title="$t('obs-studio-stage-scene')"
            icon="mdi-lectern"
          >
            <p class="text-subtitle1">
              {{
                $t('configure-a-scene-in-obs-studio-to-show-a-stage-wide-shot')
              }}
            </p>
            <p>{{ $t('once-the-scene-has-been-created-select-it-here') }}</p>
            <SelectInput
              :label="$t('obsCameraScene')"
              options="obsScenes"
              v-model="currentSettings.obsCameraScene"
            />
            <q-stepper-navigation>
              <q-btn
                :disable="!currentSettings.obsCameraScene"
                :label="$t('continue')"
                @click="step++"
                class="q-ml-sm"
                color="primary"
              />
              <q-btn :label="$t('back')" @click="step--" class="q-ml-sm" flat />
            </q-stepper-navigation>
          </q-step>
          <q-step
            :done="step > 108"
            :name="108"
            :title="$t('obs-studio-media-scene')"
            icon="mdi-lectern"
          >
            <p class="text-subtitle1">
              {{
                $t(
                  'configure-a-scene-in-obs-studio-to-capture-the-media-window',
                )
              }}
            </p>
            <p>{{ $t('once-the-scene-has-been-created-select-it-here') }}</p>
            <SelectInput
              :label="$t('obsMediaScene')"
              options="obsAllScenes"
              v-model="currentSettings.obsMediaScene"
            />
            <q-stepper-navigation>
              <q-btn
                :disable="!currentSettings.obsMediaScene"
                :label="$t('continue')"
                @click="step = 200"
                class="q-ml-sm"
                color="primary"
              />
              <q-btn :label="$t('back')" @click="step--" class="q-ml-sm" flat />
            </q-stepper-navigation>
          </q-step>
        </template>
      </template>
      <q-step
        :done="step > 200"
        :name="200"
        :title="$t('songbook-video-caching')"
        icon="mdi-cloud-download"
      >
        <p class="text-subtitle1">
          {{ $t('would-you-like-to-enable-songbook-video-caching') }}
        </p>
        <p>
          {{ $t('this-will-speed-up-media-retrieval-for-meetings') }}
        </p>
        <q-stepper-navigation>
          <q-btn
            :label="$t('yes')"
            @click="
              currentSettings.enableExtraCache = true;
              downloadSongbookVideos();
              step = 300;
            "
            class="q-ml-sm"
            color="primary"
          />
          <q-btn :label="$t('no')" @click="step = 300" class="q-ml-sm" flat />
        </q-stepper-navigation>
      </q-step>
      <q-step
        :done="step > 105"
        :name="300"
        icon="mdi-seal"
        title="Congratulations!"
      >
        <p class="text-subtitle1">{{ $t('m-is-now-ready-to-be-used') }}</p>
        <p>
          {{
            $t(
              'feel-free-to-browse-around-the-other-available-options-or-if-you-prefer-you-can-head-right-to-the-media-playback-screen-and-start-using-it-to-display-media',
            )
          }}
        </p>
        <q-stepper-navigation>
          <q-btn
            :label="$t('media-playback')"
            @click="goToPage('/media-calendar')"
            class="q-ml-sm"
            color="primary"
          />
          <q-btn
            :label="$t('titles.settings')"
            @click="goToPage('/settings')"
            class="q-ml-sm"
            outlined
          />
          <q-btn
            :label="$t('start-over')"
            @click="step = 0"
            class="q-ml-sm"
            flat
          />
        </q-stepper-navigation>
      </q-step>
    </q-stepper>
  </q-page>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import SelectInput from 'src/components/form-inputs/SelectInput.vue';
import TextInput from 'src/components/form-inputs/TextInput.vue';
import TimeInput from 'src/components/form-inputs/TimeInput.vue';
import MediaDisplayButton from 'src/components/media/MediaDisplayButton.vue';
import MusicButton from 'src/components/media/MusicButton.vue';
import { downloadBackgroundMusic, downloadSongbookVideos, fetchMedia } from 'src/helpers/jw-media';
import { useCurrentStateStore } from 'src/stores/current-state';
import { useJwStore } from 'src/stores/jw';
import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';

const currentState = useCurrentStateStore();
const { currentSettings } = storeToRefs(currentState);

// const usingAtKh = ref(false);
const obsUsed = ref(false);
const obsIntegrate = ref(false);

const jwStore = useJwStore();
const { updateYeartext } = jwStore;
const router = useRouter();

// watch(usingAtKh, (newUsingAtKh) => {
currentSettings.value.enableMediaDisplayButton = true;
currentSettings.value.autoStartMusic = true;
// });
watch(obsIntegrate, (newObsIntegrate) => {
  if (newObsIntegrate && obsUsed.value) {
    currentSettings.value.obsEnable = true;
  }
});

watch(
  () => currentSettings.value?.lang,
  (newLang) => {
    if (newLang) updateYeartext();
  },
);

const goToPage = (path: string) => {
  try {
    router.push({ path });
  } catch (error) {
    console.error(error);
  }
};

const step = ref(0);
</script>
