import { defineStore } from 'pinia';

const CONDENSED_WIDTH = 750;

export interface State {
  width: number;
  isEnlarged: boolean;
}

export interface Getters {
  isCondensed: boolean;
}

export const useWindowStore = defineStore(
  'windowStore',
  {
    state: (): State => ({
      width: window.outerWidth,
      isEnlarged: false,
    }),
    getters: {
      isCondensed: (state: State): boolean => {
        return state.width <= CONDENSED_WIDTH;
      },
    },
    actions: {
      updateWindowWidth(width: number): void {
        this.width = width;
        if (this.width > CONDENSED_WIDTH) {
          this.isEnlarged = false;
        }
      },
      setEnlarged(isEnlarged: boolean): void {
        this.isEnlarged = isEnlarged;
      },
    },
  }
);
