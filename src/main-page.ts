import Index from './views/Index.vue'
import Sets from './views/Sets.vue'
import Rules from './views/Rules.vue'
import Boxes from './views/Boxes.vue'
import Cards from './views/Cards.vue'
import Settings from './views/Settings.vue'
import SearchCards from './views/SearchCards.vue'

import { initialize } from './setup';
import { AppCreateRouterMultiple } from './router';

import '../styles/index.styl';
import '../styles/sets.styl';
import '../styles/rules.styl';
import '../styles/cards.styl';
import '../styles/newCards.styl'
import '../styles/settings.styl';


initialize(AppCreateRouterMultiple([
                { paths: ["/index.html", "/index", "/", ""], component : Index },
                { paths: ["/sets"], component : Sets },
                { paths: ["/rulebooks"], component : Rules },
                { paths: ["/boxes"], component : Boxes },
                { paths: ["/searchCards"], component : SearchCards },
                { paths: ["/cards"], component : Cards },
                { paths: ["/settings"], component : Settings },

            ]))