import { getActivePinia } from 'pinia'; // Import Pinia
import { useSettingsStore } from '../pinia/settings-store';
import { Addons_TYPE } from '../dominion/addon';

const Default_NUM_CARDS_IN_KINGDOM = 10
const Default_MAX_ADDONS_IN_KINGDOM = 2;

// Changez cette ligne pour exporter explicitement la fonction
export const NUM_CARDS_IN_KINGDOM = () : number => {
    const activePinia = getActivePinia();
    if (activePinia) {
        // Pinia store is initialized
        const settingStore = useSettingsStore();
        if (settingStore.isUsingCustomDesksize)
            return settingStore.KingdomNb
        // isUsingCustomDesksize is false
    } 
    // Pinia store is not initialized
    return Default_NUM_CARDS_IN_KINGDOM
}

export const USING_CUTOM_DESKSIZE = () : boolean => {
    const activePinia = getActivePinia();
    if (activePinia) {
        // Pinia store is initialized*
        const settingStore = useSettingsStore();
        return settingStore.isUsingCustomDesksize;
    }
    return false
}

// Addon constants.
export const MAX_ADDONS_IN_KINGDOM = () : number => {
    const activePinia = getActivePinia();
    if (activePinia) {
        // Pinia store is initialized*
        const settingStore = useSettingsStore();
        if (settingStore.isUsingCustomDesksize)
            return settingStore.AddonsNb
        // isUsingCustomDesksize is false
    } 
    // Pinia store is not initialized
    return Default_MAX_ADDONS_IN_KINGDOM
}

// force addons usage.
const Default_FORCE_ADDONS_USE = false;
export const FORCE_ADDONS_USE = () : boolean => {
    const activePinia = getActivePinia();
    if (activePinia) {
        // Pinia store is initialized*
        const settingStore = useSettingsStore();
        if (settingStore.isUsingCustomDesksize)
            return settingStore.forceAddonsUse
        // isUsingCustomDesksize is false
    } 
    // Pinia store is not initialized
    return Default_FORCE_ADDONS_USE
}

// Max Addons of type
export const MAX_ADDONS_OF_TYPE = (addontype: string) : number => {
    const activePinia = getActivePinia();
    if (activePinia) {
        // Pinia store is initialized*
        const settingStore = useSettingsStore();
        if (settingStore.isUsingCustomDesksize)
            switch (addontype) {
                case Addons_TYPE.EVENT: return settingStore.addonMax.Events;
                case Addons_TYPE.LANDMARK: return settingStore.addonMax.Landmarks;
                case Addons_TYPE.PROJECT: return settingStore.addonMax.Projects
                case Addons_TYPE.WAY: return settingStore.addonMax.Ways;
                case Addons_TYPE.TRAIT: return settingStore.addonMax.Traits;
            }
        // isUsingCustomDesksize is false
    } 
    // Pinia store is not initialized
    return Default_MAX_ADDONS_IN_KINGDOM
}
