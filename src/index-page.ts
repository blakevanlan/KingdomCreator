import Index from "./views/Index.vue";
import { store } from "./stores/index-store";
import { initialize } from "./setup";
import { createRouter } from "./router";

initialize(createRouter(["*"], Index), store);
