import {CardType} from "../dominion/card-type";

// To handle special need of cards

  // young witch
export const YOUNG_WITCH_IDS = ["cornucopia_youngwitch","guildscornucopia_youngwitch","guildscornucopia2_youngwitch", ]
export const BANE_MIN_COST = 2;
export const BANE_MAX_COST = 3;
  // young witch
export const FERRYMAN_IDS = ["guildscornucopia2_ferryman", "guildscornucopia2add_ferryman"];
export const FERRYMAN_MIN_COST = 3;
export const FERRYMAN_MAX_COST = 4;
    // Obelisk landmark
export const OBELISK_LANDMARK_ID = "empires_landmark_obelisk"
export const OBELISK_CARDTYPE_REQUESTED = CardType.ACTION
    // mouse way
export const MOUSE_WAY_ID = "menagerie_way_wayofthemouse"
export const MOUSE_MIN_COST = 2;
export const MOUSE_MAX_COST = 3;
    // Trait requested
export const TRAITS_CARDTYPE_POSSIBILITY_1= CardType.ACTION
export const TRAITS_CARDTYPE_POSSIBILITY_2 = CardType.TREASURE
  // druid
export const DRUID_ID = "nocturne_druid"
export const BOONS_NB_FROM_DRUID = 3
  // riverboat 
export const RIVERBOAT_IDS = ["risingsun_riverboat"]
export const RIVERBOAT_CARDTYPE_REQUESTED = CardType.ACTION
export const RIVERBOAT_CARDTYPE_NOTREQUESTED = CardType.DURATION
export const RIVERBOAT_COST = 5

  // ApproachingArmy
export const APPROACHINGARMY_ID = "risingsun_prophecy_approachingarmy"
export const APPROACHINGARMY_CARDTYPE_REQUESTED = CardType.ATTACK
