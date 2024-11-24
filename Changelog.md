## KingdomCreator - Changelog
###### Dominion Randomizer from Blakevanlan
###### worked by gillesgros - for work in progress see https://71yeti.fr.


It is a kingdom randomizer, or card picker, for Dominion.
As I became a maintainer for Kingdom Creator, https://www.dominionrandomizer.com might be at the same level.

Feel free to propose any improvements you see fit and send me a pull request!

## Development
it uses vue 3, vite.js, Pinia, vue-i18n and node.js v20

### Changelog
2024/10/21 - 6.4.0
Dev deploy on github pages
  Feat - include RisingSun and prophecies
  Feat - add option to exclude cards from randomization
    To do : handle minCards and maxCards in supplies selection
  Feat - allow not valid kingdoms and add information about coherence issues
  Feat - Clarify message when not able to randomize
  Fix - order for boxes display of special cards 
      Travellers, Split Cards, Castle
  Fix - rename othercard jpg with (set)_other_(name)
      and cleanup for old and used cards jpg
  Fix blakevanlan/KingdomCreator # 167 - The content displayed differs from the query parameters
      allow not valid kingdoms

2024/09/24 - 6.3.1
  Fix blakevanlan/KingdomCreator # 169 - Bug: Copy does not work anymore like it used to
  
2024/09/23 - 6.3.0
  Fix blakevanlan/KingdomCreator # 166 - Additional Cards such as Colonies/Platinum or Shelters are not displaying correctly
  Fix blakevanlan/KingdomCreator # 168 - Can't open the Recommended Kingdoms and Rules page directly
  Feat blakevanlan/KingdomCreator # 164 - Allow Customization for the Events, Ways, and Landmarks section
  Feat blakevanlan/KingdomCreator PR # 157 - Enable running from a subdirectory
  Fix - avoid popup for site translation
  Feat - add alert if not able to Randomize

2024/07/10 - 6.2.0
New release
  Fixing enlarge display for Addons, Boons, Allies

2024/07/08 - 6.1.0
New release
  Fixing boon display

2024/07/04 - 6.1.0
New release
  add German rules and box
  add menu for new set tools


