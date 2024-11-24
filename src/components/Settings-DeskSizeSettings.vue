<template>
  <div class="DeskSize">
    <div class="SettingTitle">{{ $t("Desk Size Setting") }}</div>
    <div class="sets-description">{{ $t("settings_subtitle_desksize") }}</div>

    <div class="llevel1-div">
      <div class="llevel2-div">
        <SwitchGroup as="div" class="llevel3-Switch switchGroupcss">
          <SwitchLabel>{{ $t("Use Custom Configuration for DeckSize") }}</SwitchLabel>
          <Switch as="button" v-model="isUsingCustomDesksize" v-slot="{ checked }" :class="isUsingCustomDesksize ? 'switch-bg-indigo-600' : 'switch-bg-gray-200'"
            class="relative-switchcss">
            <span class="SwitchSpan" :class="{ 'translate-x-5': checked, 'translate-x-0': !checked }" />
          </Switch>
        </SwitchGroup>
      </div>
    </div>
    <div class="custom-settings">
      <div class="slider-container kingdomSize">
        <label class="kingdomlabel-settings" for="kingdomNb">{{ $t("NB of kingdom for the Game") }}</label>
        <input class="settingsInput" type="number" id="kingdomNb" v-model="KingdomNb" />
      </div> 
    </div>

    <div class="custom-settings">
      <div class="slider-container">
        <label class="label-settings" for="addons">{{ $t("Addons") }}</label>
        <div class="range-wrapper">
          <input type="range" id="addons" v-model="AddonsNb" min="0" max="8" />
          <span class="addon-value">{{ AddonsNb }}</span>
        </div>
      </div>
      <div class="slider-container slidercheckbox">
        <label class="label-settings indentedCheckbox" for="forceAddons">{{ $t("Force Addons usage") }}</label>
        <input type="checkbox" id="forceAddons" v-model="forceAddonsUse" />
      </div>

      <div class="slider-container">
        <label class="label-settings indented" for="events">{{ $t("Events") }}</label>
        <div class="range-wrapper">
          <input type="range" id="events" v-model="EventsMax" min="0" max="8" />
          <span class="addon-value">{{ EventsMax }}</span>
        </div>
      </div>
      <div class="slider-container">
        <label class="label-settings indented" for="landmarks">{{ $t("Landmarks") }}</label>
        <div class="range-wrapper">
        <input type="range" id="landmarks" v-model="LandmarksMax" min="0" max="8" />
          <span class="addon-value">{{ LandmarksMax }}</span>
        </div>
      </div>
      <div class="slider-container">
        <label class="label-settings indented" for="projects">{{ $t("Projects") }}</label>
        <div class="range-wrapper">
          <input type="range" id="projects" v-model="ProjectsMax" min="0" max="8" />
          <span class="addon-value">{{ ProjectsMax }}</span>
        </div>
      </div>
      <div class="slider-container">
        <label class="label-settings indented" for="ways">{{ $t("Ways") }}</label>
        <div class="range-wrapper">
          <input type="range" id="ways" v-model="WaysMax" min="0" max="8" />
          <span class="addon-value">{{ WaysMax }}</span>
        </div>
      </div>
      <div class="slider-container">
        <label class="label-settings indented" for="traits">{{ $t("Traits") }}</label>
        <div class="range-wrapper">
          <input type="range" id="traits" v-model="TraitsMax" min="0" max="8" />
          <span class="addon-value">{{ TraitsMax }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from "vue";
import { SwitchGroup, SwitchLabel, Switch } from "@headlessui/vue";
import { useSettingsStore } from "../pinia/settings-store";

export default defineComponent({
  name: "DeskSizeSettings",
  components: {
    Switch,
    SwitchLabel,
    SwitchGroup,
  },
  setup() {
    const SettingsStore = useSettingsStore();
    const isUsingCustomDesksize = ref(SettingsStore.isUsingCustomDesksize);
  
    const KingdomNb = ref(SettingsStore.KingdomNb);
    const AddonsNb = ref(SettingsStore.AddonsNb);
    const EventsMax = ref(SettingsStore.addonMax.Events);
    const LandmarksMax = ref(SettingsStore.addonMax.Landmarks);
    const ProjectsMax = ref(SettingsStore.addonMax.Projects);
    const WaysMax = ref(SettingsStore.addonMax.Ways);
    const TraitsMax = ref(SettingsStore.addonMax.Traits);
    const forceAddonsUse = ref(SettingsStore.forceAddonsUse)

    watch(AddonsNb,
      () => {
        if (AddonsNb.value < EventsMax.value) EventsMax.value = AddonsNb.value
        if (AddonsNb.value < LandmarksMax.value) LandmarksMax.value = AddonsNb.value
        if (AddonsNb.value < ProjectsMax.value) ProjectsMax.value = AddonsNb.value
        if (AddonsNb.value < WaysMax.value) WaysMax.value = AddonsNb.value
        if (AddonsNb.value < TraitsMax.value) TraitsMax.value = AddonsNb.value
      },
      { immediate: true } // Trigger calculation on initial render
    );

   // Watch for changes in Max values and update AddonsNb if needed
   watch(
      [EventsMax, LandmarksMax, ProjectsMax, WaysMax, TraitsMax],
      () => {
        const minAddonsNb = Math.max(EventsMax.value, LandmarksMax.value, ProjectsMax.value, 
              WaysMax.value, TraitsMax.value)
        if (AddonsNb.value < minAddonsNb) {
          AddonsNb.value = minAddonsNb; // Set to minimum allowed value
        }
      },
      { immediate: true } // Trigger calculation on initial render
    );

    const updateStoreValues = () => {
      SettingsStore.updateSettings({
        isUsingCustomDesksize: isUsingCustomDesksize.value,
        KingdomNb: KingdomNb.value,
        AddonsNb: AddonsNb.value,
        forceAddonsUse : forceAddonsUse.value,
        addonMax: {
          Events: EventsMax.value,
          Landmarks: LandmarksMax.value,
          Projects: ProjectsMax.value,
          Ways: WaysMax.value,
          Traits: TraitsMax.value
        }
      });
    };

    watch(
      [isUsingCustomDesksize, KingdomNb, AddonsNb, forceAddonsUse, 
        EventsMax, LandmarksMax, ProjectsMax, WaysMax, 
        TraitsMax],
      updateStoreValues,
    );

    return {
      isUsingCustomDesksize,
      KingdomNb,
      AddonsNb,
      forceAddonsUse,
      EventsMax,
      LandmarksMax,
      ProjectsMax,
      WaysMax,
      TraitsMax
    };
  },
});
</script>

<style scoped>
.DeskSize {
  padding-left: 2%;
  padding-right: 2%;
  width: 35%;
  border-right: none;
}

@media (max-width: 768px) {
  .DeskSize {
    /* Adjust styles for smaller screens, if needed */
    width: 100%; /* Adjust width for smaller devices */
  }
}

.kingdomSize{
  display: flex;
  gap: 4rem;
}

.kingdomSize label {
  flex-basis: 500%;
}
.kingdomSize input {
  flex-grow: 1;
}

.kingdomInput {
  text-align: end;
  border: 2px solid #ccc
}

.label-settings{
  width: 75%;
  align-self: center;
}

.label-settings.indented {
  margin-left: 20px; 
  margin-right: 0px;
}

.label-settings.indentedCheckbox {
  margin-left: 6rem;
  margin-right: 0px;
}

.label-settings.input {
  width: unset;
}

.label-settings.check-settings {
  align-self: center;
  width: 6rem;
}

.slider-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0.5rem;
  justify-content: space-between;
  margin-block: 4px;
}

.slider-container.slidercheckbox {
  width: unset; 
  margin-top: 0;
}

.slider-container input[type="range"] {
  width: 200px; /* Increased width for range inputs */
  margin-top: 0;
}

.slider-container input[type="checkbox"] {
  width: auto;
  margin-right: 60px;
}

.slider-container.indented {
  justify-content: flex-start;
  margin-left: 20px;
}

.slider-container.indented .label-settings {
  margin-left: 0;
}

/* New styles for right alignment */
.range-wrapper {
  display: flex;
  align-items: center;
  justify-content: flex-end; /* Align contents to the right */
  flex: 0 0 250px; /* Increased width for the wrapper */
}

.addon-value {
  min-width: 30px; /* Slightly increased to accommodate larger numbers */
  text-align: right;
}

/* New styles for label and value alignment */
.label-settings {
  flex: 1;
  min-width: 120px; /* Ensure labels have a minimum width */
}

/* Adjusted styles for right alignment and larger range */
.range-wrapper {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex: 0 0 250px; /* Increased width for the wrapper */
}
</style>
