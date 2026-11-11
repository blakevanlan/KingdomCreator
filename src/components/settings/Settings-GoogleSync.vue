<template>
  <div class="setting-panel">
    <div class="SettingTitle">{{ $t('Google Sync') }}</div>
    <div class="sets-description">{{ $t('Save and restore your settings')}}</div>

    <div v-if="!isGoogleConfigured" class="google-sync-message google-sync-warning">
      {{ $t('Google Drive sync is not configured yet') }}
    </div>

    <div v-else class="google-sync-actions">
<button 
        v-if="!googleSyncStore.isSignedIn && !googleSyncStore.profile && googleClientId" 
        class="google-official-btn" 
        @click="googleSyncStore.signInAndInit()"
        :disabled="googleSyncStore.isLoading"
      >
        <div class="google-icon-wrapper">
          <svg class="google-icon-svg" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
          </svg>
        </div>
        <span class="google-btn-text">{{ $t('Sign in with Google') }}</span>
      </button>

<button 
        v-if="!googleSyncStore.isSignedIn && googleSyncStore.profile && googleClientId" 
        class="google-official-btn google-account-picker-btn" 
        @click="googleSyncStore.signInAndInit()"
        :disabled="googleSyncStore.isLoading"
      >
        <div class="google-avatar-left-wrapper">
          <img v-if="googleSyncStore.profile.picture && !photoLoadFailed" :src="googleSyncStore.profile.picture"
            class="google-avatar" alt="Profile"
            @error="photoLoadFailed = true"
          />
          <span v-else class="google-avatar-placeholder">
            {{ googleSyncStore.profile.name?.charAt(0) || googleSyncStore.profile.email?.charAt(0) || 'G' }}
          </span>
        </div>

        <div class="google-btn-text-container">
          <span class="google-btn-title">{{ $t('Sign in as', { name: googleSyncStore.profile.name }) }}</span>
          <span class="google-btn-email">
            {{ googleSyncStore.profile.email }}
            <svg class="dropdown-arrow-icon" viewBox="0 0 24 24"><path fill="#70757a" d="M7 10l5 5 5-5z"/></svg>
          </span>
        </div>

        <div class="google-icon-right-wrapper">
          <svg class="google-icon-svg" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
          </svg>
        </div>
      </button>

      <template v-if="googleSyncStore.isSignedIn && googleSyncStore.profile">
        <div class="google-profile-badge google-official-btn google-account-picker-btn">
          <div class="google-avatar-left-wrapper">
            <img
              v-if="googleSyncStore.profile.picture && !photoLoadFailed"
              :src="googleSyncStore.profile.picture"
              class="google-avatar"
              alt="Profile"
              @error="photoLoadFailed = true"
            />
            <span v-else class="google-avatar-placeholder">
              {{ googleSyncStore.profile.name?.charAt(0) || googleSyncStore.profile.email?.charAt(0) || 'G' }}
            </span>
          </div>
          <div class="google-badge-text-container">
            <span class="google-badge-title">{{ $t('Signed in as', { name: googleSyncStore.profile.name }) }}</span>
            <span class="google-badge-email">{{ googleSyncStore.profile.email }}</span>
          </div>
        </div>

        <button class="settingsButton disconnectButton" @click="googleSyncStore.signOut()">
          {{ $t('Sign Out Google') }}
        </button>
      </template>

      <button class="settingsButton" @click="googleSyncStore.saveToGoogle()" :disabled="googleSyncStore.isLoading || !googleSyncStore.isSignedIn">
        {{ $t('Save to Drive') }}
      </button>
      <button class="settingsButton" @click="googleSyncStore.restoreFromGoogle()" :disabled="googleSyncStore.isLoading || !googleSyncStore.isSignedIn">
        {{ $t('Restore from Drive') }}
      </button>
    </div>

    <div v-if="googleSyncStore.lastMessage" class="google-sync-message">
      {{ googleSyncStore.lastMessage }}
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref, watch } from 'vue';
import { useGoogleSyncStore } from '@/pinia/google-sync-store';
import { getGoogleClientId, isGoogleSyncAvailable } from '@/utils/google-sync';

export default defineComponent({
  name: 'GoogleSyncSettings',
  setup() {
    const googleSyncStore = useGoogleSyncStore();
    const isGoogleConfigured = computed(() => isGoogleSyncAvailable());
    const googleClientId = computed(() => getGoogleClientId());
    const photoLoadFailed = ref(false);

    watch(
      () => googleSyncStore.profile?.picture,
      () => {
        photoLoadFailed.value = false;
      }
    );

    return {
      googleSyncStore,
      isGoogleConfigured,
      googleClientId,
      photoLoadFailed
      };
  },
});
</script>

<style scoped>

.setting-panel {
  background: #f7f7f7;
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 16px;
  margin: 12px;
  min-width: 320px;
  flex: 1 1 320px;
}

.google-sync-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.google-sync-profile {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 12px;
}

.google-sync-profile img {
  width: 32px;
  height: 32px;
  border-radius: 50%;
}

/* set in global css
.google-sync-message {
  margin-top: 10px;
  color: #555;
  font-family: primary-font;
  font-weight: 300;
}
*/

.google-sync-warning {
  color: #8a4b00;
  background: #fff7e6;
  border: 1px solid #f0c36d;
  padding: 10px;
  border-radius: 4px;
}


.settingsButton:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ==========================================================================
   🎯 UNIFICATION ET NETTOYAGE DU CSS POUR LES BOUTONS GOOGLE
   ========================================================================== */

.google-official-btn {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: flex-start !important;
  background-color: #ffffff;
  color: #3c4043;
  border: 1px solid #dadce0;
  border-radius: 4px;
  padding: 0 16px 0 0 !important; /* Ajoute l'espace nécessaire à droite du texte */
  font-family: 'Roboto', arial, sans-serif;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  
  /* 🔒 Verrous de dimensions stricts */
  height: 40px !important;
  min-height: 40px !important;
  max-height: 40px !important;
  width: max-content !important; 
  flex: 0 0 auto !important;
  
  letter-spacing: 0.25px;
  transition: background-color 0.2s, box-shadow 0.2s, border-color 0.2s;
  overflow: hidden;
  box-sizing: border-box;
}

.google-official-btn:hover:not(:disabled) {
  background-color: #f8f9fa;
  border-color: #d2e3fc;
  box-shadow: 0 1px 2px 0 rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15);
}

.google-official-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 🔒 Conteneur fixe pour l'icône ou l'avatar */
.google-icon-wrapper {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  width: 40px !important;
  height: 40px !important;
  flex-shrink: 0 !important;
}

.google-icon-svg {
  width: 18px !important;
  height: 18px !important;
}

/* 🔒 Style de l'avatar du profil */
.google-avatar {
  width: 22px !important;
  height: 22px !important;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0 !important;
}

.google-avatar-left-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.google-avatar-placeholder {
  width: 24px !important;
  height: 24px !important;
  border-radius: 50%;
  background: #2e5e1c; /* Teinte verte de votre capture */
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-family: 'Roboto', arial, sans-serif;
}

/* ==========================================================================
   🛠️ CORRECTION DE LA MISE EN PAGE DU TEXTE (HORIZONTAL & ALIGNÉ)
   ========================================================================== */

/* Évite le retour à la ligne pour le bouton standard */
.google-btn-text {
  padding-left: 8px;
  white-space: nowrap !important;
}

/* Force le texte du profil à rester horizontal sur une seule ligne */
.google-btn-text-container {
  display: flex !important;
  flex-direction: column !important;
  align-items: flex-start !important;
  justify-content: center !important;
  line-height: 1.2 !important;
  flex-grow: 1;
}

.google-btn-title {
  font-size: 13px;
  color: #3c4043;
  font-weight: 500;
  white-space: nowrap;
}

.google-btn-email {
  font-size: 11px;
  color: #70757a;
  font-weight: 400;
  display: flex;
  align-items: center;
  gap: 2px;
  white-space: nowrap;
}

/* Petite flèche grise à côté de l'email */
.dropdown-arrow-icon {
  width: 14px;
  height: 14px;
}

/* Placement de l'icône Google tout à droite */
.google-icon-right-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  margin-left: auto; /* Pousse l'icône Google sur l'extrémité droite */
  flex-shrink: 0;
}

.google-account-picker-btn {
  padding: 0 12px !important;
  gap: 10px;
}

.disconnectButton {
  border-color: #dadce0;
  color: #d93025; /* Couleur rouge subtile pour l'action de déconnexion */
}
.disconnectButton:hover {
  background-color: #fce8e6 !important;
  border-color: #fad2cf;
}

.google-profile-badge {
  display: inline-flex;
  align-items: center;
  background-color: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 0 16px 0 12px;
  height: 40px;
  box-sizing: border-box;
  gap: 10px;
}

.google-badge-text-container {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  line-height: 1.2;
}

.google-badge-title {
  font-size: 13px;
  color: #202124;
  font-weight: 500;
  white-space: nowrap;
}

.google-badge-email {
   font-size: 11px;
  color: #5f6368;
  font-weight: 400;
  white-space: nowrap;
}
</style>
