import Index from './views/Index.vue';
import Sets from './views/Sets.vue';
import Rules from './views/Rules.vue';
import Boxes from './views/Boxes.vue';
import Cards from './views/Cards.vue';
import Settings from './views/Settings.vue';
import SearchCards from './views/SearchCards.vue';
import Help from './views/Help.vue';

import { initialize } from './setup';
import { AppCreateRouterMultiple } from './router';

import '../styles/index.styl';

initialize(AppCreateRouterMultiple([
                { paths: ["/index.html", "/index", "/", ""], component : Index },
                { paths: ["/sets"], component : Sets },
                { paths: ["/rulebooks"], component : Rules },
                { paths: ["/boxes"], component : Boxes },
                { paths: ["/searchCards"], component : SearchCards },
                { paths: ["/cards"], component : Cards },
                { paths: ["/settings"], component : Settings },
                { paths: ["/help"], component : Help }, 
                { paths: ["/:pathMatch(.*)*"], component : Index } // catch all 404
            ]))