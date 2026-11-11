import type { Card } from './card';
import type { Cost } from './cost';
import { Event } from './event';
import { Landmark } from './landmark';
import { Project } from './project';
import { Way } from './way';
import { Ally } from './ally';
import { Trait } from './trait';
import { Prophecy } from './prophecy';
import { Boon } from './boon';
import { DominionSets } from '@/dominion/dominion-sets';



export enum Addons_TYPE {
  EVENT = 'Event',
  LANDMARK = 'Landmark',
  PROJECT = 'Project',
  WAY = 'Way',
  ALLY = 'Ally',
  TRAIT = 'Trait',
  PROPHECY = 'Prophecy',
  BOON = 'Boon'
}

export interface Addon extends Card {
  readonly name: string;
  readonly cost?: Cost;
}

export interface Addons 
{ events: Event[], 
  landmarks: Landmark[], 
  projects: Project[], 
  ways: Way[], 
  allies: Ally[], 
  traits: Trait[],
  prophecies: Prophecy[],
  boons: Boon[]
}

export function getAddonTypeFromId(id: string): Addons_TYPE | null {
  const card = DominionSets.getCardById(id);
  if (card instanceof Ally) return Addons_TYPE.ALLY;
  if (card instanceof Prophecy) return Addons_TYPE.PROPHECY;
  if (card instanceof Event) return Addons_TYPE.EVENT;
  if (card instanceof Landmark) return Addons_TYPE.LANDMARK;
  if (card instanceof Project) return Addons_TYPE.PROJECT;
  if (card instanceof Way) return Addons_TYPE.WAY;
  if (card instanceof Trait) return Addons_TYPE.TRAIT;
  if (card instanceof Boon) return Addons_TYPE.BOON;
  return null;
}

export function getAllowedAddonTypes(type: Addons_TYPE | null): Addons_TYPE[] {
  if (!type) return [];
  switch (type) {
    case Addons_TYPE.ALLY:
      return [Addons_TYPE.ALLY];
    case Addons_TYPE.PROPHECY:
      return [Addons_TYPE.PROPHECY];
    case Addons_TYPE.BOON:
      return [Addons_TYPE.BOON];
    case Addons_TYPE.EVENT:
    case Addons_TYPE.LANDMARK:
    case Addons_TYPE.PROJECT:
    case Addons_TYPE.WAY:
    case Addons_TYPE.TRAIT:
      return [Addons_TYPE.EVENT, Addons_TYPE.LANDMARK, Addons_TYPE.PROJECT, Addons_TYPE.WAY, Addons_TYPE.TRAIT];
    default:
      return [];
  }
}