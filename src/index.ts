import {initialize} from "./setup"
import {IndexPage} from "./pages/index-page";

const page = new IndexPage();
page.loadInitialKingdom();
initialize(page);
