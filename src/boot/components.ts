import { boot } from 'quasar/wrappers';
import DateInput from 'src/components/form-inputs/DateInput.vue';
import TimeInput from 'src/components/form-inputs/TimeInput.vue';
import TextInput from 'src/components/form-inputs/TextInput.vue';
import PathInput from 'src/components/form-inputs/PathInput.vue';
import SliderInput from 'src/components/form-inputs/SliderInput.vue';
import SelectInput from 'src/components/form-inputs/SelectInput.vue';
import ToggleInput from 'src/components/form-inputs/ToggleInput.vue';

import MediaDisplayButton from 'src/components/media/MediaDisplayButton.vue';
import MusicButton from 'src/components/media/MusicButton.vue';
import SongPicker from 'src/components/media/SongPicker.vue';
import ScenePicker from 'src/components/media/ScenePicker.vue';

export default boot(async ({ app }) => {
  app.component('DateInput', DateInput);
  app.component('TimeInput', TimeInput);
  app.component('TextInput', TextInput);
  app.component('PathInput', PathInput);
  app.component('SliderInput', SliderInput);
  app.component('SelectInput', SelectInput);
  app.component('ToggleInput', ToggleInput);

  app.component('MediaDisplayButton', MediaDisplayButton);
  app.component('MusicButton', MusicButton);
  app.component('SongPicker', SongPicker);
  app.component('ScenePicker', ScenePicker);
});
