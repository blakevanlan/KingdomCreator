## KingdomCreator - Changelog
###### Dominion Randomizer from Blakevanlan
###### worked by gillesgros - for work in progress see https://71yeti.fr.


It is a kingdom randomizer, or card picker, for Dominion.
As I became a maintainer for Kingdom Creator, https://www.dominionrandomizer.com might be at the same level.

Feel free to propose any improvements you see fit and send me a pull request!

## Development
it uses vue 3, vite.js, Pinia, vue-i18n and node.js v20

### Changelog
**2026/11/11 - 7.1.17** - analytics info
>***Feat*** - Introducing analytics informatiosn to follow randomizer usage  
>***Fix*** - precise palyed button behavior  
>***Feat*** - Handling multiple release of rulebooks  
>***Fix*** - fix error google badge  
>***Feat*** - introduce What's New modal to explain news features  
>***Fix*** - fix error in rulebooks for some language  
>***Fix*** - updating package.json  
>***Fix*** - fix for vue-tsc  
>***Feat*** -finalizing Replace Supply and Addon
>***Feat*** - allow addon, ally, boon, prophecy replacement specify.  
>***Fix*** - make randomize addon follow the specified criterias.  
>***Fix*** - make replacement windows not moving depending on selection.  
>***Fix*** - allow rating reset  
>***Fix*** - Clean vite config for production  
>***Feat*** - allow flitering on history games  
>***Fix*** - enanble boon in hash and restitution on history page  
>***Feat*** - modify rendering of history page on computer  
>***Feat*** - modify rendering of history page on smartphone  
>***Fix*** - fix rendering of settings on smartphone - owned set and constraints  
>***Fix*** - translate en & fr fo history page  
>***Feat*** - blakevanlan/KingdomCreator #220 - Feature: Rule: Require Attacks  
>***Feat*** - add rating possibiliy of games  

**2026/06/25 - 7.1.8** - Features
>***Feat*** - Add lpossibility to define replacement card when 1 supply is selected.  
>***Fix*** - move to js-yaml 5  
>***Fix*** - make loading personnal sets work again  
>***Fix*** - fix select/deselect all set on randomize page.  

**2026/06/24 - 7.1.7** - played games
>***Fix*** - Add loot_supplier for replace cad type  

**2026/06/23 - 7.1.6** - played games
>***Fix*** - set .env for VITE_GOOGLE_CLIENT_ID  
>***Feat*** - Create played games history and detail  
>***Feat*** - Add card showup on hover in history detail  

**2026/06/21 - 7.1.5** - played games
>***Feat*** - allow saving randomized games to history, with button text change  
>***Feat*** - store on Gdrive randomized games  
>***Fix*** - fix crash when less supply  
>***Feat*** - add badge for Google login status  
>***Fix*** - add function to force 2 space char at line end of Changelog  
>***Fix*** - login to google drive working with nice UI  
>***Feat*** - add save and restore settings config from goggle Drive  
>***Fix*** - modify settings pages to allow easy restore form google  
>***Feat*** - add login to google drive (manual option)  
>***Fix*** - blakevanlan/KingdomCreator #220 - When you Use Custom Configuration for Set Display and only choose second editon the set isn't selectable  
>***Fix*** - Fix copy of help without directory structure  
>***Feat*** - blakevanlan/KingdomCreator PR #221 - Added missing Dutch translations  
>***Fix*** - avoid build images path with cards.en  
>***Fix*** - fix access to font path alegreya-...  
>***Fix*** - make help pages works when loaded on Github Pages  
**2026/02/20 - 7.0.5** - Dev 7 Work in progress
Dev deploy on github pages 
>***Fix*** - Fix blinking on sort for Sets and Boxes  
>***Feat*** - Rename display tab for rulebooks  
>***Fix*** - blakevanlan/KingdomCreator #193 - Issues Randomizing Events, Landmarks, Projects, Ways & Traits After the Initial Set Creation  
           Force redraw if FORCE_ADDON_USAGE is true
>***Fix*** - complemenatry fix for initial Kingdom load - Addon constraint verified and corrected  
>***Fix*** - Split components by usage (boxes, cards, randomize, ...)  
>***Feat*** - Load Cards slowly on All Page - Lazy_loading  
>***Fix*** - Add OtherCards in search. Fix sort.  
>***Fix*** - blakevanlan/KingdomCreator #207 - Underling cost  
>***Fix*** - blakevanlan/KingdomCreator #214 - Bugged Guilds & Cornucopia (2nd edition) cards  
>***Fix*** - add border for Approaching Army card  
>***Fix*** - sort on search page  
>***Feat*** - Add Othercards on search page  
>***Fix*** - sort for Box content  
>***Feat*** - add tooltip on main page  
>***Fix*** - selection ownedset impacting Randomizer selection and Box content  
>***Feat*** - Add select/unselect all Randomizer sidebas /Settings owned set  
>***Feat*** - custom settings owned set  
>***Feat*** - add help markdown file display in settings page  

**2025/09/12 - 6.6.0**
Dev deploy on github pages 
>***Fix*** - blakevanlan/KingdomCreator #207 - Underling cost  
>***Feat*** - blakevanlan/KingdomCreator PR #209 - Added missing Dutch Seaside translations  
>***Feat*** - blakevanlan/KingdomCreator PR #206 - Polish translations  
>***Feat*** - add and update ToDo  

**2025/07/24 - 6.5.0**
Dev deploy on github pages 
>***Fix*** - deduplication of candaidate cards for Addons generation  
>***Fix*** - Add Prosperity Update Pack SetId for Colony/Platine usage  
>***Feat*** - Start adding generation process documentation.  
>***Fix*** - proper menu display on 1st load (on occasion)  
>***Fix*** - Proper alchemy divider usage based on '3+ Alchemy cards' or randomly  

**2025/07/23 - 6.4.9**  
>***Fix*** - Proper alchemy divider usage based on '3+ Alchemy cards' or randomly **Broken**  
>***Feat*** - Show console.info if sessionStorage variable 'console.info' is set to true  
>***Feat*** - Startin adding generation process documentation.  

**2025/07/10 - 6.4.8**  
>***Fix*** - blakevanlan/KingdomCreator #202 - Typo in Owned Set Settings menu  
>***Fix*** - blakevanlan/KingdomCreator #196 - Bug with Addons Settings  
>***Feat*** - blakevanlan/KingdomCreator #093 - Request cost deselect all button  
>***Fix*** - Correct display of menu on smartphone (small screen)  
>***Feat*** - Extend list of supply card type for SupplyCard replacement windows  
>***Feat*** - Search SupplyCard with criteria Set, Type, Cost  
>***Feat*** - Rendering menu dynamicaly  
>***Fix*** - Fix windows resize for Custom setting page  
>***Fix*** - blakevanlan/KingdomCreator #192 - Randomization Issues  
           Add trace for candidate card selection and for candidate cards for addons  
           To do : description of selection process    
>***Fix*** - blakevanlan/KingdomCreator #193 - Issues Randomizing Events, Landmarks, Projects, Ways & Traits After the Initial Set Creation  
           Adjust number of cards selectd   
           To do : add modal windows for addons selection process   
**2025/05/20 - 6.4.7**  
>***Fix*** - blakevanlan/KingdomCreator #190 - Bug: Issue: Link to issue page broken  
>***Fix*** - blakevanlan/KingdomCreator #191 - Issue: Reaction cards (set Patron reaction:true)  
>***Fix*** - blakevanlan/KingdomCreator PR #189 - fix: Fix string key  
>***Fix*** - blakevanlan/KingdomCreator PR #188 - fix(build): Fix build on Linux systems  
>***Feat*** - blakevanlan/KingdomCreator PR #187 - feat: Add Italian translation  

2025/01/12 - 6.4.5
>***Fix*** - Regression - blakevanlan/KingdomCreator #169 - Bug: Copy does not work anymore like it used to  

2025/01/02 - 6.4.4
>***Fix*** - improper order for accentuated chararters (French)  
>***Fix*** - add rising sun no French images  
>***Feat*** - add translation for no card image translated  
>***Fix*** - blakevanlan/KingdomCreator #181 - Bug: Riverboat pile selects cards that don't cost $5  
>***Feat*** - rework of Card generation  

2024/12/28 - 6.4.3
>***Fix*** - Correcting wrong image names for other  
>***Fix*** - Usage of Dominion Randomizer - error filter fix  
>***Fix*** - Usage of Dominion Randomizer - Download all data  

2024/12/22 - 6.4.2
>***Feat*** - RisingSun: kingdoms  
>***Feat*** - RisingSun: Add ApprochingArmy supply selection  
>***Feat*** - RisingSun: handle riverboat Action card Request  
>***Feat*** - RisingSun: handlde prophecies  
>***Feat*** - Recommended kingdoms: Add a link to start building a randomized deck based on it  
>***Feat*** - Usage of Dominion Randomizer made accessible : https://suivi.71yeti.fr/  
>***Feat*** - blakevanlan/KingdomCreator #178 - Suggestion: Probability slider for cards in owned expansions  
>***Feat*** - add option to exclude cards from randomization  
           To do : handle minCards and maxCards in supplies selection
>***Feat*** - allow not valid kingdoms and add information about coherence issues  
>***Fix*** - blakevanlan/KingdomCreator #167 - The content displayed differs from the query parameters  
>***Feat*** - Clarify message when not able to randomize  
>***Fix*** - order for boxes display of special cards  
           Travellers, Split Cards, Castle
>***Fix*** - rename othercard jpg with (set)_other_(name)  
           and cleanup for old and used cards jpg

2024/09/24 - 6.3.1
>***Fix*** - blakevanlan/KingdomCreator # 169 - Bug: Copy does not work anymore like it used to  
  
2024/09/23 - 6.3.0
>***Fix*** - blakevanlan/KingdomCreator # 166 - Additional Cards such as Colonies/Platinum or Shelters are not displaying correctly  
>***Fix*** - blakevanlan/KingdomCreator # 168 - Can't open the Recommended Kingdoms and Rules page directly  
>***Feat*** - blakevanlan/KingdomCreator # 164 - Allow Customization for the Events, Ways, and Landmarks section  
>***Feat*** - blakevanlan/KingdomCreator PR # 157 - Enable running from a subdirectory  
>***Fix*** - avoid popup for site translation  
>***Feat*** - add alert if not able to Randomize  

2024/07/10 - 6.2.0
New release
>***Fix*** - Fixing enlarge display for Addons, Boons, Allies  

2024/07/08 - 6.1.0
New release
>***Fix*** - Fixing boon display  

2024/07/04 - 6.1.0
New release
>***Feat*** - add German rules and box  
>***Feat*** - add menu for new set tools  


