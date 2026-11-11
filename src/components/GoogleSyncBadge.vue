<template>
  <li v-if="isCondensed" class="condensed-menu-profile" @click="handleAction">
    <template v-if="googleSyncStore.profile">
      <img
        v-if="googleSyncStore.profile.picture && !photoLoadFailed"
        :src="googleSyncStore.profile.picture"
        class="mobile-avatar"
        @error="photoLoadFailed = true"
      />
      <div v-else class="mobile-avatar-placeholder">
        {{ googleSyncStore.profile.name?.charAt(0) || 'G' }}
      </div>
      <div class="profile-info">
        <span class="profile-name">{{ googleSyncStore.profile.name }}</span>
        <span class="profile-status" :class="{ 'status-disconnected': !hasDriveAccess }">
          {{ hasDriveAccess ? '✓ Cloud Sync actif' : 'Autorisation Drive requise' }}
        </span>
      </div>
    </template>
    <template v-else>
      <div class="mobile-avatar-placeholder">G</div>
      <div class="profile-info">
        <span class="profile-name">{{ $t('Google Drive Sync') }}</span>
        <span class="profile-status status-disconnected">{{ $t('Sign in') }}</span>
      </div>
    </template>
  </li>

<span v-else 
      class="title-profile-badge" 
      :class="{ 'is-disconnected': !hasDriveAccess }"
      :title="badgeTooltip"
      @click="handleAction">
  
  <img v-if="googleSyncStore.profile?.picture && !photoLoadFailed"
       :src="googleSyncStore.profile.picture" 
       class="title-avatar"
       @error="photoLoadFailed = true" />
       
  <span v-else-if="googleSyncStore.profile" class="title-avatar-placeholder">
    {{ googleSyncStore.profile.name?.charAt(0) || googleSyncStore.profile.email?.charAt(0) || 'G' }}
  </span>
  <span v-else class="title-avatar-placeholder">
    <svg viewBox="0 0 24 24" width="18" height="18">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z"/>
    </svg>
  </span>

  <span class="title-status-dot" :class="statusClass"></span>
</span>
</template>

<script lang="ts">
import { defineComponent, computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { useGoogleSyncStore } from '@/pinia/google-sync-store';

export default defineComponent({
  name: "GoogleSyncBadge",
  props: {
    isCondensed: {
      type: Boolean,
      default: false
    }
  },
  setup() {
    const { t } = useI18n();
    const googleSyncStore = useGoogleSyncStore();
    const photoLoadFailed = ref(false);
    const currentTime = ref(Date.now());
    let statusRefreshInterval: number | undefined;

    watch(
      () => googleSyncStore.profile?.picture,
      () => {
        photoLoadFailed.value = false;
      }
    );

    // Raccourci pour valider la connexion
    const isConnected = computed(() => {
      return googleSyncStore.isSignedIn && !!googleSyncStore.profile;
    });

    const hasDriveAccess = computed(() =>
      isConnected.value &&
      googleSyncStore.isDriveAccessVerified &&
      !!googleSyncStore.accessToken &&
      !!googleSyncStore.tokenExpirationTime &&
      currentTime.value < googleSyncStore.tokenExpirationTime - 120000
    );

    onMounted(() => {
      statusRefreshInterval = window.setInterval(() => {
        currentTime.value = Date.now();
      }, 60000);
    });

    onUnmounted(() => {
      if (statusRefreshInterval !== undefined) {
        window.clearInterval(statusRefreshInterval);
      }
    });

    // Détermine la classe CSS de la puce de couleur
    const statusClass = computed(() => {
      if (hasDriveAccess.value) return 'status-green';
      if (isConnected.value) return 'status-warning';
      return 'status-grey';
    });

    // Infobulle dynamique au survol
    const badgeTooltip = computed(() => {
      if (!isConnected.value || !googleSyncStore.profile) {
        return t('Cloud backup disabled');
      }

      const accountName = t('Signed in as', {
        name: googleSyncStore.profile.name || googleSyncStore.profile.email || 'Google',
      });
      return hasDriveAccess.value
        ? t('Signed as', {
            name: googleSyncStore.profile.name || googleSyncStore.profile.email || 'Google',
          })
        : `${accountName} — ${t('Cloud backup disabled')}`;
    });

    // Gestion du clic
    const handleAction = async () => {
      if (!hasDriveAccess.value) {
        try {
          // Déclenche l'authentification Google
          await googleSyncStore.signInAndInit();
        } catch (err) {
          console.error("Authentification failure from badge :", err);
        }
      } else {
        // Optionnel : Si déjà connecté, on peut proposer de se déconnecter au clic, 
        // ou simplement ne rien faire / ouvrir un menu. Par défaut ici, on laisse connecté.
        if (confirm(t('Do you want to sign out'))) {
          googleSyncStore.signOut();
        }
      }
    };

    return {
      googleSyncStore,
      photoLoadFailed,
      isConnected,
      hasDriveAccess,
      statusClass,
      badgeTooltip,
      handleAction
    };
  }
});
</script>

<style scoped>
/* 📱 STYLES MOBILE */
.condensed-menu-profile {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background-color: rgba(25, 60, 30, 0.2);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 8px;
  cursor: pointer;
}
.mobile-avatar, .mobile-avatar-placeholder {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1.5px solid #fff;
}
.mobile-avatar-placeholder {
  background: #555;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}
.profile-info {
  display: flex;
  flex-direction: column;
}
.profile-name {
  color: #fff;
  font-size: 15px;
  font-weight: 500;
}
.profile-status {
  color: #bbf7d0;
  font-size: 11px;
}
.status-disconnected {
  color: #aaa;
}

/* 💻 STYLES DESKTOP (À côté du titre) */
.title-profile-badge {
  display: inline-flex;
  align-items: center;
  position: relative;
  margin-left: 12px;
  vertical-align: middle;
  cursor: pointer;
  user-select: none;
}

.title-avatar, .title-avatar-placeholder {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 2px solid #71b3c8;
  box-shadow: 0 2px 4px rgba(0,0,0,0.15);
  transition: all 0.2s ease;
}

/* Version déconnectée : effet visuel gris / plus discret */
.title-avatar-placeholder {
  background: #f1f3f4;
  color: #5f6368;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #bdc1c6;
}

.title-profile-badge:not(.is-disconnected):hover .title-avatar,
.title-profile-badge:not(.is-disconnected):hover .title-avatar-placeholder {
  transform: scale(1.1);
  border-color: #22c55e; /* Devient vert au survol pour inciter au clic */
}

.title-profile-badge.is-disconnected:hover .title-avatar-placeholder {
  border-color: #4285F4; /* Bleu Google pour l'invitation à se connecter */
  background: #e8f0fe;
  color: #1a73e8;
}

/* Puce de statut générique */
.title-status-dot {
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 9px;
  height: 9px;
  border: 2px solid #fff;
  border-radius: 50%;
  transition: background-color 0.3s ease;
}

/* États de couleur de la puce */
.status-green {
  background-color: #22c55e; /* Vert : OK */
}
.status-grey {
  background-color: #9ca3af; /* Gris : Déconnecté */
}
.status-warning {
  background-color: #f59e0b;
}
.status-red {
  background-color: #ef4444; /* Rouge : Erreur (token expiré, réseau) */
}
</style>