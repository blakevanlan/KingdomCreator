# Randomize Constraints Custom Settings

To fine-tune your deck generation, the application allows you to apply precise constraints on the number of cards from each expansion and to exclude specific cards from the pool.

---
## 1. Enabling Constraints

- **Activation Option**: Toggle the "Use constraint on randomization" switch in the settings.
- **Set Selection**: For each expansion, you can check the activation box to edit its specific distribution and exclusion constraints.

---
## 2. Setting Min/Max Bounds per Expansion

For each enabled expansion, you can configure:
- **Minimum Cards (nb min)**: Forces the algorithm to include at least this number of cards from this expansion in the generated deck (e.g., forcing at least 2 cards from *Seaside*).
- **Maximum Cards (nb max)**: Limits the number of cards from this expansion to this maximum value in the generated deck (e.g., no more than 4 cards from a single set to encourage diversity).

> [!IMPORTANT]
> - The sum of all configured minimums must not exceed 10 (the standard number of Kingdom cards in a deck). If this sum exceeds 10, the algorithm temporarily ignores the minimums to prevent a lockup.
> - The application automatically validates and adjusts your inputs in real time to prevent impossible configurations (such as setting a minimum greater than the maximum).

---
## 3. Excluding Specific Cards (Blacklist)

If you dislike certain cards, or want to temporarily exclude them from your games:
- **Selecting Cards to Exclude**: A dropdown menu for each expansion allows you to select individual cards to set aside.
- **Effect on Generation**: All checked cards are excluded from the generation and will not appear in the final deck.

---
## 4. How the Distribution Algorithm Works

During randomized deck (Kingdom) generation, the algorithm proceeds as follows:
1. **Exclusion**: Cards on the blacklist (excluded) are immediately removed from the pool of available cards.
2. **Pre-allocating Minimums**: The algorithm reserves slots in the deck to satisfy the minimum number of cards required for each configured expansion.
3. **Distributing the Rest**: The remaining slots (to complete the deck of 10 Kingdom cards) are randomly distributed among the eligible expansions, ensuring that the maximum limit defined for each is never exceeded.
