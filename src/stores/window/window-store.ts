const CONDENSED_WIDTH = 800;

export interface State {
  width: number;
}

export interface Getters {
  isCondensed: boolean;
}

export const windowStore = {
  state: {
    width: window.outerWidth
  } as State,
  getters: {
    isCondensed: (state: State) => {
      return state.width <= CONDENSED_WIDTH;
    }
  },
  mutations: {
    UPDATE_WINDOW_WIDTH (state: State, width: number) {
      state.width = width;
    }
  }
};
