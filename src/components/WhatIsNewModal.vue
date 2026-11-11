<template>
  <Transition name="news-modal">
    <div
      v-if="isOpen"
      class="news-modal-backdrop"
      role="presentation"
      @click.self="close"
      @keydown.esc.stop.prevent="close"
    >
      <section
        ref="dialog"
        class="news-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="news-modal-title"
        tabindex="-1"
      >
        <button
          class="news-modal__close"
          type="button"
          :aria-label="t('news_modal_close')"
          :title="t('news_modal_close')"
          @click="close"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="m6 6 12 12M18 6 6 18" />
          </svg>
        </button>

        <header class="news-modal__header">
          <div>
            <p class="news-modal__eyebrow">Dominion Kingdom Creator</p>
            <h2 id="news-modal-title">{{ t('news_modal_title') }}</h2>
            <p class="news-modal__intro">{{ t('news_modal_intro') }}</p>
          </div>
        </header>

        <div class="news-modal__content">
          <article class="news-item news-item--settings">
            <div class="news-item__icon" aria-hidden="true">⚙️</div>
            <div>
              <h3>{{ t('news_modal_settings_title') }}</h3>
              <p>{{ t('news_modal_settings_description') }}</p>
              <div class="news-item__subsection">
                <h4>{{ t('news_modal_game_setup_title') }}</h4>
                <p>{{ t('news_modal_game_setup_description') }}</p>
              </div>
              <div class="news-item__subsection">
                <h4>{{ t('news_modal_constraints_title') }}</h4>
                <p>{{ t('news_modal_constraints_description') }}</p>
              </div>
            </div>
          </article>

          <article class="news-item news-item--cloud">
            <div class="news-item__icon" aria-hidden="true">☁️</div>
            <div>
              <h3>{{ t('news_modal_cloud_title') }}</h3>
              <p>{{ t('news_modal_cloud_description') }}</p>
            </div>
          </article>

          <article class="news-item news-item--history">
            <div class="news-item__icon" aria-hidden="true">📜</div>
            <div>
              <h3>{{ t('news_modal_history_title') }}</h3>
              <p>{{ t('news_modal_history_description') }}</p>
            </div>
          </article>

          <article class="news-item news-item--generation">
            <div class="news-item__icon" aria-hidden="true">🎲</div>
            <div>
              <h3>{{ t('news_modal_generation_title') }}</h3>
              <p>{{ t('news_modal_generation_description') }}</p>
            </div>
          </article>
        </div>

        <footer class="news-modal__footer">
          <button class="news-modal__confirm" type="button" @click="close">
            {{ t('news_modal_confirm') }}
          </button>
        </footer>
      </section>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

const STORAGE_KEY = 'dominion_NewFeatureExplained';
const CURRENT_VERSION = '7.1';
const { t } = useI18n();
const isOpen = ref(false);
const dialog = ref<HTMLElement | null>(null);
let previousBodyOverflow = '';
let returnFocusElement: HTMLElement | null = null;

function open() {
  if (typeof document !== 'undefined') {
    const activeElement = document.activeElement;
    returnFocusElement = activeElement instanceof HTMLElement ? activeElement : null;
  }
  isOpen.value = true;
}

function close() {
  isOpen.value = false;
  try {
    window.localStorage.setItem(STORAGE_KEY, CURRENT_VERSION);
  } catch {
    // The modal remains usable when browser storage is unavailable.
  }
}

watch(isOpen, async (visible) => {
  if (typeof document === 'undefined') return;

  if (visible) {
    previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    await nextTick();
    dialog.value?.focus();
    return;
  }

  document.body.style.overflow = previousBodyOverflow;
  if (returnFocusElement?.isConnected) returnFocusElement.focus();
  returnFocusElement = null;
});

onMounted(() => {
  try {
    if (window.localStorage.getItem(STORAGE_KEY) !== CURRENT_VERSION) open();
  } catch {
    open();
  }
});

onBeforeUnmount(() => {
  if (typeof document !== 'undefined') {
    document.body.style.overflow = previousBodyOverflow;
  }
});

defineExpose({ open, close });
</script>

<style scoped>
.news-modal-backdrop {
  position: fixed;
  z-index: 1000;
  inset: 0;
  display: grid;
  place-items: center;
  overflow-y: auto;
  padding: max(12px, env(safe-area-inset-top)) 12px max(12px, env(safe-area-inset-bottom));
  background: rgb(13 23 25 / 68%);
  overscroll-behavior: contain;
}

.news-modal {
  position: relative;
  display: flex;
  flex-direction: column;
  width: min(42rem, calc(100vw - 24px));
  max-height: 85vh;
  max-height: 85dvh;
  min-height: 0;
  overflow: hidden;
  color: #172528;
  background: #fbfcf8;
  border: 1px solid rgb(255 255 255 / 70%);
  border-radius: 12px;
  box-shadow: 0 24px 80px rgb(0 0 0 / 35%);
  outline: none;
}

.news-modal__header {
  display: flex;
  flex: 0 0 auto;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 22px 88px 18px 24px;
  border-bottom: 1px solid #e1e8e4;
}

.news-modal__eyebrow {
  margin: 0 0 5px;
  color: #47745f;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
}

.news-modal__header h2 {
  margin: 0;
  font-size: 1.55rem;
  line-height: 1.2;
}

.news-modal__intro {
  margin: 7px 0 0;
  color: #526267;
  font-size: 0.95rem;
}

.news-modal__close {
  position: absolute;
  z-index: 10;
  top: 1.25rem;
  right: 1.25rem;
  display: grid;
  width: 48px;
  height: 48px;
  place-items: center;
  margin: 0;
  padding: 0;
  color: #34494b;
  background: transparent;
  border: 0;
  border-radius: 8px;
  cursor: pointer;
}

.news-modal__close:hover {
  background: #edf2ee;
}

.news-modal__close:focus-visible,
.news-modal__confirm:focus-visible {
  outline: 3px solid #197b65;
  outline-offset: 3px;
}

.news-modal__close svg {
  width: 24px;
  height: 24px;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-width: 2;
}

.news-modal__content {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  padding: 8px 24px;
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
}

.news-item {
  display: grid;
  grid-template-columns: 44px minmax(0, 1fr);
  gap: 14px;
  padding: 17px 0;
  border-bottom: 1px solid #e6ebe7;
}

.news-item:last-child {
  border-bottom: 0;
}

.news-item__icon {
  display: grid;
  width: 44px;
  height: 44px;
  place-items: center;
  background: #edf3ee;
  border-radius: 10px;
  font-size: 1.35rem;
}

.news-item--constraints .news-item__icon {
  background: #f5f0e5;
}

.news-item--game-setup .news-item__icon {
  background: #edf2e8;
}

.news-item--cloud .news-item__icon {
  background: #eaf1f5;
}

.news-item--history .news-item__icon {
  background: #f6eee7;
}

.news-item--generation .news-item__icon {
  background: #f2ecf5;
}

.news-item h3 {
  margin: 1px 0 6px;
  color: #203d3a;
  font-size: 1rem;
  line-height: 1.35;
}

.news-item p {
  margin: 0 0 6px;
  color: #4a5a5d;
  font-size: 0.92rem;
  line-height: 1.5;
}

.news-item p:last-child {
  margin-bottom: 0;
}

.news-item__subsection {
  margin-top: 12px;
  padding-top: 10px;
  border-top: 1px solid #e6ebe7;
}

.news-item__subsection h4 {
  margin: 0 0 4px;
  color: #203d3a;
  font-size: 0.9rem;
  line-height: 1.35;
}

.news-modal__footer {
  position: sticky;
  z-index: 1;
  bottom: 0;
  flex: 0 0 auto;
  padding: 14px 24px max(14px, env(safe-area-inset-bottom));
  background: #fbfcf8;
  border-top: 1px solid #e1e8e4;
}

.news-modal__confirm {
  width: 100%;
  min-height: 52px;
  padding: 12px 20px;
  color: #fff;
  background: #176b58;
  border: 0;
  border-radius: 7px;
  cursor: pointer;
  font: inherit;
  font-weight: 700;
}

.news-modal__confirm:hover {
  background: #125643;
}

.news-modal-enter-active,
.news-modal-leave-active {
  transition: opacity 160ms ease;
}

.news-modal-enter-active .news-modal,
.news-modal-leave-active .news-modal {
  transition: transform 160ms ease;
}

.news-modal-enter-from,
.news-modal-leave-to {
  opacity: 0;
}

.news-modal-enter-from .news-modal,
.news-modal-leave-to .news-modal {
  transform: translateY(10px);
}

@media (max-width: 480px) {
  .news-modal-backdrop {
    place-items: center;
    padding-right: 12px;
    padding-left: 12px;
  }

  .news-modal {
    width: calc(100vw - 24px);
    max-height: 85vh;
    max-height: 85dvh;
    border-radius: 10px;
  }

  .news-modal__header {
    gap: 8px;
    padding: 17px 80px 14px 16px;
  }

  .news-modal__close {
    top: 1.25rem;
    right: 1.25rem;
  }

  .news-modal__header h2 {
    font-size: 1.35rem;
  }

  .news-modal__content {
    padding: 4px 16px;
  }

  .news-item {
    grid-template-columns: 38px minmax(0, 1fr);
    gap: 11px;
    padding: 15px 0;
  }

  .news-item__icon {
    width: 38px;
    height: 38px;
    font-size: 1.15rem;
  }

  .news-item p {
    font-size: 0.88rem;
  }

  .news-modal__footer {
    padding: 12px 16px max(12px, env(safe-area-inset-bottom));
  }
}

@media (prefers-reduced-motion: reduce) {
  .news-modal-enter-active,
  .news-modal-leave-active,
  .news-modal-enter-active .news-modal,
  .news-modal-leave-active .news-modal {
    transition-duration: 1ms;
  }
}
</style>