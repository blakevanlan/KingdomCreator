import Sets from "./views/Sets.vue";
import { store } from "./stores/sets-store";
import { initialize } from "./setup";
import { createRouter } from "./router";

initialize(createRouter(["*"], Sets), store);
