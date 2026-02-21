# Generating a Card Deck

The algorithm for generating a card deck (or "kingdom") in our application follows several steps, adapted to different use cases.   
Below is the Standard mode, without applying specific advanced settings.

---
## 1. Selecting Card Sets

- **Choosing sets**: The user selects one or more sets among those available (for example, "Base", "Alchemy", "Seaside").
- **Set content**: Each set contains different types of cards:
  - **Kingdom Cards**: The main cards used for playing.
  - **Complementary Cards**: Events, Landmarks, Projects, etc...

---
## 2. Applying Constraints to Generate the Deck

The user can define specific constraints to guide the random generation of the deck. These constraints allow for customizing the deck based on preferences or strategic needs.

**Available Constraints:**

- **Require +2 Actions**: Ensures at least one card provides +2 actions.
- **Require Drawer**: Ensures at least one card allows drawing additional cards.
- **Require Buy**: Ensures at least one card provides additional buys.
- **Allow Attack**: Allows including "Attack" cards in the deck.
- **Require Reaction**: Ensures at least one "Reaction" card to counter "Attack" cards.
- **3+ Alchemy Cards**: If the "Alchemy" set is selected, forces the presence of at 3 to 5 cards from this set.
- **Distribute Costs**: Balances the cost of cards in the deck by ensuring a 3 to 5 expensive cards (5+) are included.
- **Prioritize Sets**: Prioritizes a set to ensure it is well-represented in the deck by 5 cards.

---
## 3. Random Selection of "Kingdom" Cards

Once the sets are selected, the algorithm proceeds to select the Kingdom cards.

**Selection Steps:**

- **Deduplication of cards**: Cards from the selected sets are deduplicated to avoid duplicates (e.g., handling cards from the 1st and 2nd editions or Update Packs).
- **Grouping of cards**: Cards are grouped according to a maximum of 4 criteria:
   - **Cards from the "Alchemy" set**: If the "3+ Alchemy Cards" option is activated or with a probability of 1 chance out of the number of selected sets.
   - **Expensive cards**: If the "Distribute Costs" option is activated, cards costing more than 5 coins are grouped.
   - **Cards from the prioritized set**: If the "Prioritize Sets" option is activated, cards from this set are grouped.
   - **Remaining cards**: All other available cards.
- **Satisfying constraints**: For each "Require" constraint, if it is not satisfied with the already selected cards, the algorithm identifies card groupings that meet the constraint and selects one or more randomly.

---
## 4. Verification and Adjustments

Once the cards are initially selected, the algorithm verifies that all user-defined constraints are met. If a constraint is not satisfied, adjustments are made:

- **Adding additional cards**: Cards can be added to meet unsatisfied constraints. This is the case for managing the presence of "Reaction" cards.
- **Locking selected cards**: Already selected cards are locked to prevent them from being modified during adjustments.

**Handling Exceptions**
The algorithm is designed to handle special cases and exceptions:
- **Lack of available cards**: If a set does not contain enough cards to meet the constraints, a warning message is displayed.
- **Conflicts between constraints**: If conflicts arise between multiple constraints, the algorithm prioritizes those with the most impact on playability.

---
## 5. Adding Special Cards

Depending on the specific rules of certain sets or activated options, special cards can be added to the deck:

- **"Bane" Card**: If the "Young Witch" card is included, a "Bane" card is automatically selected from the available cards that meet the cost criteria.
- **"FerrymanCard", "RiverboatCard"**: If the corresponding cards are included, one or more complementary cards are added, respecting cost, type, etc.
- **Other special cards**: Certain cards like "Obelisk", "MouseWay", or "Approaching Army" may require adding cards according to the specific rules of the sets.

---
## 6. Finalizing the Deck

Once all constraints are met and special cards are added, the algorithm finalizes the deck:
- **Organizing the cards**: Cards are grouped and organized to form a complete deck.
- **Managing replacements**: Possible replacements for certain cards are recorded, allowing the user to customize the deck after its generation.

---
## 7. Generating Addon Cards

In addition to "Kingdom" cards, the algorithm also generates complementary cards to enrich the deck. These cards include addons, allies, prophecies, and boons.  
Events, Landmarks, Projects, Ways, and Traits are added as follows:
- By default, a maximum of 2 Addons are chosen, in accordance with the rules' recommendations.
- From all the cards composing the selected sets (after Deduplication), twice the number of Kingdom-type cards (20 cards) are randomly selected. Among these cards, the Addons are retained.

---
## 8. Complement and Adjustment Based on Addons
Depending on the selected Kingdom and Addon cards, other cards may be identified or selected:
- If the "Druid" card is present, 3 Boons are randomly selected.
- If a Liaison card is present in the Kingdom cards, an Ally card is randomly selected.
- If an Omen card is present in the Kingdom cards, a Prophecy card is randomly selected.
- In the Kingdom cards, cards corresponding to the needs of Obelisk (Landmark), Way of the Mouse (Way), Approaching Army Prophecy, and Kingdom cards associated with Traits are identified.

---
## 9. Using Provinces/Platinums and Shelters
Depending on:
- The number of cards meeting the criteria (Nb_Cards_Criteria) (Prosperity 1st, 2nd edition, or update pack or Dark Ages set),
- The number of deduplicated cards (Nb_Cards),

A decision is made to use Provinces and Platinums or Shelters with Nb_Cards_Criteria chance out of Nb_Cards randomly.


---
# Tooltips on main page
Require +2 Action : include a card allowing 1 or more actions
Require Drawer : include a card allowing to draw cards
Require Buy : include a card allowing 1 or more extra buy
Allow Attacks : allow attacks card to be in the deck
Require Reaction : include a reaction card in the deck if an attack is present
Require Trashing : include a card allowing trash cards

3+ Alchemy Cards : include 3 or more card of Alchemy set in the deck
Distribute Cost : include 3 to 5 cards of cost 5 or more
Prioritize Set : include 5 cards of the selected set