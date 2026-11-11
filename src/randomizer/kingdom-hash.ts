
import { Kingdom, Metadata } from '@/randomizer/kingdom';
import { Replacements, Supply } from '@/randomizer/supply';
import { DominionSets } from '@/dominion/dominion-sets';
import { SupplyCard } from '@/dominion/supply-card';

/**
 * Génère un identifiant unique stable (Hash) à partir d'un objet Kingdom.
 * Tous les éléments sont triés par leur identifiant (.id) pour garantir
 * que l'ordre du tirage n'influence pas le résultat final.
 */
export function generateKingdomHash(kingdom: Kingdom): string {
  const supply = kingdom.supply;

  // 1. Extraction et tri des 10 cartes de la réserve principale
  const supplyIds = supply.supplyCards.map(c => c.id).sort().join(',');

  // 2. Extraction et tri des paysages / Addons
  const eventIds = kingdom.events.map(e => e.id).sort().join(',');
  const landmarkIds = kingdom.landmarks.map(l => l.id).sort().join(',');
  const projectIds = kingdom.projects.map(p => p.id).sort().join(',');
  const wayIds = kingdom.ways.map(w => w.id).sort().join(',');
  const traitIds = kingdom.traits.map(t => t.id).sort().join(',');

  // 3. Extraction des cartes spéciales liées au Supply
  const baneId = supply.baneCard?.id || '';
  const ferrymanId = supply.ferrymanCard?.id || '';
  const obeliskCardId = supply.obeliskCard?.id || '';
  const mouseWayId = supply.mouseWay?.id || '';
  const riverboatId = supply.riverboatCard?.id || '';
  const approachingArmyId = supply.approachingArmyCard?.id || '';

  // 4. Extraction et tri des cartes associées aux Traits (traitsSupply)
  const traitSupplyIds = supply.traitsSupply.map(c => c.id).sort().join(',');

  // 5. Éléments uniques optionnels (Ally et Prophecy)
  const allyId = kingdom.ally?.id || '';
  const prophecyId = kingdom.prophecy?.id || '';

  // 5b. Extraction et tri des Boons
  const boonIds = kingdom.boons.map(b => b.id).sort().join(',');

  // 6. Options de jeu (Metadata)
  const meta = `c:${kingdom.metadata.useColonies ? 1 : 0},s:${kingdom.metadata.useShelters ? 1 : 0}`;

  // 7. Reconstruction d'une chaîne normalisée ultra-stricte
  const normalizedString = 
    `main:${supplyIds}|` +
    `special:${baneId},${ferrymanId},${obeliskCardId},${mouseWayId},${riverboatId},${approachingArmyId}|` +
    `addons:${eventIds};${landmarkIds};${projectIds};${wayIds};${traitIds}|` +
    `traitSupply:${traitSupplyIds}|` +
    `unique:${allyId},${prophecyId}|` +
    `boons:${boonIds}|` +
    `meta:${meta}`;

  // 8. Encodage moderne en Base64 URL-Safe (Remplace unescape de manière sûre)
  const bytes = new TextEncoder().encode(normalizedString);
  const binString = Array.from(bytes, (byte) => String.fromCharCode(byte)).join("");
  
  return btoa(binString)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Opération inverse : prend un Hash Base64 URL-Safe et reconstruit
 * la chaîne normalisée d'origine (ex: "main:cellar,chapel...|addons:...")
 */
export function decodeKingdomHash(hash: string): string {
  // 1. On remet les caractères Base64 standards (+ et /) à la place des caractères URL-Safe
  let base64 = hash.replace(/-/g, '+').replace(/_/g, '/');

  // 2. On rajoute le bourrage "=" (padding) requis par atob si la longueur n'est pas un multiple de 4
  while (base64.length % 4) {
    base64 += '=';
  }

  // 3. Décodage du Base64 en chaîne binaire
  const binString = atob(base64);

  // 4. Conversion de la chaîne binaire en tableau d'octets (Uint8Array)
  const bytes = Uint8Array.from(binString, (m) => m.charCodeAt(0));

  // 5. Lecture des octets en UTF-8 pour retrouver le texte d'origine
  return new TextDecoder().decode(bytes);
}

/**
 * Reconstruit une instance réelle et complète de Kingdom à partir d'un Hash Base64
 */
export function deserializeKingdomFromHash(hash: string): Kingdom {
  // 1. Décodage du Base64 URL-Safe vers la chaîne brute normalisée
  const decodedText = decodeKingdomHash(hash);
  
  // 2. Découpage en sections (main, special, addons, unique, meta...)
  const sections = decodedText.split('|').reduce((acc, section) => {
    const [key, value] = section.split(':');
    acc[key] = value || '';
    return acc;
  }, {} as Record<string, string>);

  // --- Parse de la section META ---
  const metaParts = (sections['meta'] || '').split(',');
  const useColonies = metaParts.includes('c:1');
  const useShelters = metaParts.includes('s:1');
  const metadata = new Metadata(useColonies, useShelters);

  // --- Parse de la section MAIN (SupplyCards) ---
  const mainIds = sections['main'] ? sections['main'].split(',') : [];
  // 🟢 On filtre et on indique explicitement à TypeScript qu'il s'agit de SupplyCard
  const supplyCards = mainIds
    .map(id => DominionSets.getCardById(id) as SupplyCard)
    .filter((card): card is SupplyCard => card != null);
  // --- Parse de la section ADDONS (Events, Landmarks, Projects, Ways, Traits) ---
  const addonsParts = (sections['addons'] || '').split(';');
  
  const eventIds = addonsParts[0] ? addonsParts[0].split(',').filter(Boolean) : [];
  const landmarkIds = addonsParts[1] ? addonsParts[1].split(',').filter(Boolean) : [];
  const projectIds = addonsParts[2] ? addonsParts[2].split(',').filter(Boolean) : [];
  const wayIds = addonsParts[3] ? addonsParts[3].split(',').filter(Boolean) : [];
  const traitIds = addonsParts[4] ? addonsParts[4].split(',').filter(Boolean) : [];

  const events = eventIds.map(id => DominionSets.getEventById(id)).filter(Boolean);
  const landmarks = landmarkIds.map(id => DominionSets.getLandmarkById(id)).filter(Boolean);
  const projects = projectIds.map(id => DominionSets.getProjectById(id)).filter(Boolean);
  const ways = wayIds.map(id => DominionSets.getWayById(id)).filter(Boolean);
  const traits = traitIds.map(id => DominionSets.getTraitById(id)).filter(Boolean);

  // --- Parse de la section UNIQUE (Ally, Prophecy) ---
  const uniqueParts = (sections['unique'] || '').split(',');
  const allyId = uniqueParts[0] || '';
  const prophecyId = uniqueParts[1] || '';
  
  const ally = allyId ? DominionSets.getAllyById(allyId) : null;
  const prophecy = prophecyId ? DominionSets.getProphecyById(prophecyId) : null;

  // --- Parse de la section BOONS ---
  const boonIds = sections['boons'] ? sections['boons'].split(',').filter(Boolean) : [];
  const boons = boonIds.map(id => DominionSets.getBoonById(id)).filter(Boolean);

  // --- Parse de la section SPECIAL (Cartes liées typées SupplyCard) ---
  const specialParts = (sections['special'] || '').split(',');
  // 🟢 Ajout du cast "as SupplyCard" pour satisfaire le constructeur de Supply
  const baneCard = specialParts[0] ? DominionSets.getCardById(specialParts[0]) as SupplyCard : null;
  const ferrymanCard = specialParts[1] ? DominionSets.getCardById(specialParts[1]) as SupplyCard : null;
  const obeliskCard = specialParts[2] ? DominionSets.getCardById(specialParts[2]) as SupplyCard : null;
  const mouseWay = specialParts[3] ? DominionSets.getCardById(specialParts[3]) as SupplyCard : null;
  const riverboatCard = specialParts[4] ? DominionSets.getCardById(specialParts[4]) as SupplyCard : null;
  const approachingArmyCard = specialParts[5] ? DominionSets.getCardById(specialParts[5]) as SupplyCard : null;

  // --- Parse de la section TRAIT SUPPLY ---
  const traitSupplyIds = sections['traitSupply'] ? sections['traitSupply'].split(',').filter(Boolean) : [];
  // 🟢 Ajout du cast "as SupplyCard" ici aussi
  const traitsSupply = traitSupplyIds
    .map(id => DominionSets.getCardById(id) as SupplyCard)
    .filter((card): card is SupplyCard => card != null);

  // 3. Construction du sous-objet Supply
  const supply = new Supply(
    supplyCards,
    baneCard,
    ferrymanCard,
    obeliskCard,
    mouseWay,
    riverboatCard,
    approachingArmyCard,
    traitsSupply,
    Replacements.empty() 
  );

  // 4. Renvoi du Kingdom tout neuf
  return new Kingdom(
    Date.now(), 
    supply,
    events,
    landmarks,
    projects,
    ways,
    boons, 
    ally,
    prophecy,
    traits,
    metadata
  );
}