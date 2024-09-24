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
        <input class="labbel-settings"  type="range" id="addons" v-model="AddonsNb" min="0" max="8" />
        <span class="addon-value">{{ AddonsNb }}</span>
      </div>
      <div class="slider-container slidercheckbox">
        <label class="label-settings indentedCheckbox" for="addons">{{ $t("Force Addons usage") }}</label>
        <input class="label-settings check-settings" type="checkbox" id="addons" v-model="forceAddonsUse" />
      </div>

      <div class="slider-container">
        <label class="label-settings indented" for="events">{{ $t("Events") }}</label>
        <input class="label-settings"  type="range" id="events" v-model="EventsMax" min="0" max="8" />
        <span class="addon-value">{{ EventsMax }}</span>
      </div>
      <div class="slider-container">
        <label class="label-settings indented" for="landmarks">{{ $t("Landmarks") }}</label>
        <input class="label-settings" type="range" id="landmarks" v-model="LandmarksMax" min="0" max="8" />
        <span class="addon-value">{{ LandmarksMax }}</span>
      </div>
      <div class="slider-container">
        <label class="label-settings indented" for="projects">{{ $t("Projects") }}</label>
        <input class="label-settings" type="range" id="projects" v-model="ProjectsMax" min="0" max="8" />
        <span class="addon-value">{{ ProjectsMax }}</span>
      </div>
      <div class="slider-container">
        <label class="label-settings indented" for="ways">{{ $t("Ways") }}</label>
        <input class="label-settings" type="range" id="ways" v-model="WaysMax" min="0" max="8" />
        <span class="addon-value">{{ WaysMax }}</span>
      </div>
      <div class="slider-container">
        <label class="label-settings indented" for="traits">{{ $t("Traits") }}</label>
        <input class="label-settings" type="range" id="traits" v-model="TraitsMax" min="0" max="8" style="color:blue;"/>
        <span class="addon-value">{{ TraitsMax }}</span>

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
    const EventsMax = ref(SettingsStore.EventsMax);
    const LandmarksMax = ref(SettingsStore.LandmarksMax);
    const ProjectsMax = ref(SettingsStore.ProjectsMax);
    const WaysMax = ref(SettingsStore.WaysMax);
    const TraitsMax = ref(SettingsStore.TraitsMax);
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
        const minAddonsNb = Math.max(EventsMax.value, LandmarksMax.value, ProjectsMax.value, WaysMax.value, TraitsMax.value)
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
        EventsMax: EventsMax.value,
        LandmarksMax: LandmarksMax.value,
        ProjectsMax: ProjectsMax.value,
        WaysMax: WaysMax.value,
        TraitsMax: TraitsMax.value,
      });
    };

    watch(
      [isUsingCustomDesksize, KingdomNb, AddonsNb, forceAddonsUse, EventsMax, LandmarksMax, ProjectsMax, WaysMax, TraitsMax],
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
  flex-direction: row; /* Stack items vertically */
  align-items: flex-start; /* Align items to the left */
  gap: 0.5rem; /* Add a small gap between label and slider */
  justify-content: flex-end;
  margin-block: 4px;
}

.slider-container.slidercheckbox {
  width: unset; 
  margin-top: 0; /* Remove default margin-top */
}

.slider-container input {
  width: 100%; /* Make the input span the full width of the container */
  margin-top: 0; /* Remove default margin-top */
}

/* New rule for indented container */
.slider-container.indented {
  justify-content: flex-start; /* Align content (including label) to the left */
  margin-left: 20px; /* Indent the entire container to the right */
}

.slider-container.indented .label-settings {
  /* Optionally remove indentation from the label within the indented container */
  margin-left: 0;
}

</style>
