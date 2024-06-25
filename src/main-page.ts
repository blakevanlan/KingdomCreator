import Index from './views/Index.vue'
import Sets from './views/Sets.vue'
import Rules from './views/Rules.vue'
import Boxes from './views/Boxes.vue'
import Cards from './views/Cards.vue'

import { initialize } from './setup';
import { AppCreateRouterMultiple } from './router';

import '../styles/index.styl';
import '../styles/sets.styl';
import '../styles/rules.styl';
import '../styles/cards.styl';


initialize(AppCreateRouterMultiple([
                { paths: ["/index.html", "/index", "/", ""], component : Index },
                { paths: ["/sets"], component : Sets },
                { paths: ["/rules"], component : Rules },
                { paths: ["/boxes"], component : Boxes },
                { paths: ["/cards"], component : Cards },
            ]))