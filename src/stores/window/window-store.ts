const CONDENSED_WIDTH = 750;

export interface State {
  width: number;
  isEnlarged: boolean;
}

export interface Getters {
  isCondensed: boolean;
}

export const windowStore = {
  state: {
    width: window.outerWidth,
    isEnlarged: false,
  } as State,
  getters: {
    isCondensed: (state: State) => {
      return state.width <= CONDENSED_WIDTH;
    },
  },
  mutations: {
    UPDATE_WINDOW_WIDTH (state: State, width: number) {
      state.width = width;
      if (state.width > CONDENSED_WIDTH) {
        state.isEnlarged = false;
      }
    },
    SET_ENLARGED (state: State, isEnlarged: boolean) {
      state.isEnlarged = isEnlarged;
    },
  }
};
