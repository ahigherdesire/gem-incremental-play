# Gem Incremental — v0.1 Game Design

> **Status:** Pre-development / v0.1 design
> **Purpose:** Source of truth for the initial playable version.
> Values marked **Tentative** may be changed during balancing and playtesting.

---

# 1. Core Concept

Gem Incremental is an RNG/incremental game based around discovering, collecting, selling and crafting with gems.

The main gameplay loop is:

**Roll → Obtain Gem → Roll Weight → Keep / Sell / Craft → Upgrade → Roll Better Gems**

Players improve four main statistics:

* **Luck** — improves gem rarity chances
* **Roll Speed** — reduces time between rolls
* **Weight Luck** — increases the chance of unusually heavy gems
* **Weight Multiplier** — directly increases final gem weight

Each statistic has its own equipment category:

| Equipment | Stat              |
| --------- | ----------------- |
| Pickaxe   | Luck              |
| Lantern   | Roll Speed        |
| Boots     | Weight Luck       |
| Bag       | Weight Multiplier |

A fifth secret equipment slot exists for the **Dark Matter Relic**.

---

# 2. Rolling

## Base Roll Speed

Default cooldown:

**5 seconds**

Roll Speed uses a multiplier.

Example:

At `1.25× Roll Speed`:

`5 / 1.25 = 4 seconds per roll`

---

# 3. Gem RNG

Gems are checked from **rarest to most common**.

For a gem with rarity `1/r` and player Luck `L`:

`chance = L / r`

Generate a random decimal from 0 to 1.

If:

`random < chance`

the player obtains the gem.

Otherwise, move to the next gem.

This continues until a gem succeeds.

## Fallback Gem

The most common gem, **Quartz**, acts as the fallback.

If every previous check fails, Quartz is automatically selected.

However, Quartz is still displayed to players as:

**1 in 2**

---

# 4. Gem Pool

v0.1 contains **30 normal gems** plus one troll gem.

|      # | Gem           |  Display Rarity |
| -----: | ------------- | --------------: |
|      1 | Quartz        |             1/2 |
|      2 | Calcite       |             1/3 |
|      3 | Feldspar      |             1/5 |
|      4 | Fluorite      |             1/8 |
|      5 | Hematite      |            1/12 |
|      6 | Obsidian      |            1/18 |
|      7 | Agate         |            1/25 |
|      8 | Jasper        |            1/35 |
|      9 | Amethyst      |            1/50 |
|     10 | Garnet        |            1/70 |
|     11 | Peridot       |           1/100 |
|     12 | Topaz         |           1/150 |
|     13 | Aquamarine    |           1/225 |
|     14 | Tourmaline    |           1/325 |
|     15 | Opal          |           1/475 |
|     16 | Zircon        |           1/650 |
|     17 | Spinel        |           1/850 |
|     18 | Sapphire      |         1/1,100 |
|     19 | Ruby          |         1/1,400 |
|     20 | Emerald       |         1/1,800 |
|     21 | Diamond       |         1/2,300 |
|     22 | Tanzanite     |         1/2,900 |
|     23 | Alexandrite   |         1/3,600 |
|     24 | Benitoite     |         1/4,400 |
|     25 | Red Beryl     |         1/5,300 |
|     26 | Black Opal    |         1/6,300 |
|     27 | Grandidierite |         1/7,400 |
|     28 | Taaffeite     |         1/8,500 |
|     29 | Musgravite    |         1/9,300 |
|     30 | Painite       |        1/10,000 |
| SECRET | Dark Matter   | **1/1,000,000** |

Dark Matter intentionally does not follow the real-world gemstone naming scheme.

---

# 5. Weight System

Each gem has a fixed **Base Weight**.

When the gem is rolled, the game generates a continuous **Weight Roll**.

`Rolled Weight = Base Weight × Weight Roll`

The player's Weight Multiplier is applied afterwards:

`Final Weight = Rolled Weight × Weight Multiplier`

Therefore:

* Base Weight = fixed gem stat
* Weight Roll = randomly generated specimen size
* Final Weight = weight after equipment bonuses

---

# 6. Weight Distribution

Minimum Weight Roll:

**0.50×**

Most gems should be reasonably close to their Base Weight.

Approximate normal distribution targets:

| Weight      | Approx. probability |
| ----------- | ------------------: |
| 0.50×–0.85× |                ~15% |
| 0.85×–1.10× |            **~60%** |
| 1.10×–1.50× |                ~15% |
| 1.50×–2.00× |              ~3.75% |
| ≥2×         |           **6.25%** |

Weights are continuous.

Examples:

`0.873×`

`1.046×`

`2.381×`

`5.724×`

They are NOT restricted to integer multipliers.

---

# 7. High-Weight Tail

Reaching `2×` Base Weight has a base chance of:

**1/16**

Every additional whole multiplier is **twice as rare**.

| At least | Base chance |
| -------: | ----------: |
|       2× |        1/16 |
|       3× |        1/32 |
|       4× |        1/64 |
|       5× |       1/128 |
|       6× |       1/256 |
|       7× |       1/512 |
|       8× |     1/1,024 |
|       9× |     1/2,048 |
|      10× |     1/4,096 |
|      15× |   1/131,072 |
|      20× | 1/4,194,304 |

Exact continuous generation algorithm: **TBD during implementation.**

---

# 8. Weight Luck

Weight Luck does NOT directly multiply gem weight.

Instead:

> **Weight Luck makes weights above 1.10× N times more likely.**

Example:

`1.40× Weight Luck`

means results above `1.10×` become approximately **1.40× as likely**.

This affects the probability of entering the high-weight portion of the distribution without changing what each weight multiplier represents.

---

# 9. Base Weights & Values

Weights are designed primarily for **gameplay**, with loose real-world inspiration.

| Gem           |   Rarity | Base Weight | Target Avg. Value | Approx. $/g |
| ------------- | -------: | ----------: | ----------------: | ----------: |
| Quartz        |      1/2 |        100g |                $5 |      $0.050 |
| Calcite       |      1/3 |        110g |                $7 |      $0.064 |
| Feldspar      |      1/5 |        125g |               $10 |      $0.080 |
| Fluorite      |      1/8 |        140g |               $14 |      $0.100 |
| Hematite      |     1/12 |        160g |               $19 |      $0.119 |
| Obsidian      |     1/18 |        180g |               $25 |      $0.139 |
| Agate         |     1/25 |        200g |               $32 |      $0.160 |
| Jasper        |     1/35 |        225g |               $41 |      $0.182 |
| Amethyst      |     1/50 |        250g |               $55 |      $0.220 |
| Garnet        |     1/70 |        275g |               $72 |      $0.262 |
| Peridot       |    1/100 |        300g |               $95 |      $0.317 |
| Topaz         |    1/150 |        325g |              $135 |      $0.415 |
| Aquamarine    |    1/225 |        350g |              $185 |      $0.529 |
| Tourmaline    |    1/325 |        375g |              $250 |      $0.667 |
| Opal          |    1/475 |        400g |              $360 |      $0.900 |
| Zircon        |    1/650 |        425g |              $470 |      $1.106 |
| Spinel        |    1/850 |        450g |              $625 |      $1.389 |
| Sapphire      |  1/1,100 |        475g |              $850 |      $1.789 |
| Ruby          |  1/1,400 |        500g |            $1,100 |      $2.200 |
| Emerald       |  1/1,800 |        525g |            $1,400 |      $2.667 |
| Diamond       |  1/2,300 |        550g |            $1,850 |      $3.364 |
| Tanzanite     |  1/2,900 |        575g |            $2,050 |      $3.565 |
| Alexandrite   |  1/3,600 |        600g |            $2,650 |      $4.417 |
| Benitoite     |  1/4,400 |        625g |            $3,000 |      $4.800 |
| Red Beryl     |  1/5,300 |        650g |            $3,600 |      $5.538 |
| Black Opal    |  1/6,300 |        675g |            $4,300 |      $6.370 |
| Grandidierite |  1/7,400 |        700g |            $4,800 |      $6.857 |
| Taaffeite     |  1/8,500 |        725g |            $5,500 |      $7.586 |
| Musgravite    |  1/9,300 |        750g |            $6,000 |      $8.000 |
| Painite       | 1/10,000 |        800g |            $6,500 |      $8.125 |
| Dark Matter   |     1/1m |      2,500g |          $500,000 |        $200 |

For gems above approximately `1/500`, `rarity^0.95` is used as a **rough value-scaling guide**, not a strict formula.

Real-world gemstone value/prestige may also influence balancing.

---

# 10. Selling

Gem value depends on actual specimen weight.

`Sell Value = Final Weight × Gem $/g`

Therefore, unusually heavy specimens are naturally worth more money.

Players choose whether to:

* Sell gems
* Keep gems
* Lock valuable specimens
* Deposit gems into crafting recipes

---

# 11. Inventory

Starting inventory capacity:

**15 specimens**

Inventory capacity can be upgraded using money.

Exact upgrade sizes and prices:

**TBD**

Players should be able to lock/favourite specimens to prevent accidental selling.

Recipe deposits prevent large recipes from requiring everything to fit in the player's inventory simultaneously.

---

# 12. Gem Index

Every gem has an Index entry.

Before discovery:

**???**

After discovery, the player can view information including:

* Name
* Rarity
* Base Weight
* Personal discovery information
* Short description
* Information about the gem/mineral in real life

Dark Matter may use fictional information instead.

---

# 13. Crafting

Crafting produces permanent equipment.

Only **one item from each normal equipment category** can be equipped at a time.

Higher tiers replace the stat bonus of lower tiers rather than stacking with them.

Recipe materials may be deposited gradually.

Large-quantity recipes may support automatic depositing/crafting to avoid inventory problems.

---

# 14. Pickaxes — Luck

Pickaxes increase gem Luck.

Player-facing bonuses should use percentages.

Example:

**+5% Luck**

Backend:

`+0.05 Luck`

Progression currently locked around:

| Tier     |           Luck |
| -------- | -------------: |
| T1       |            +5% |
| T2       |           +15% |
| T3       |           +50% |
| T4       |       **+80%** |
| T5       |      **+150%** |
| T5 total | **2.50× Luck** |

Notable recipe design decisions:

* Early recipes use mostly common materials.
* T2 uses common materials plus one material around the `1/60–1/80` range.
* Recipes generally shifted toward **one of each rarer material** rather than unnecessarily large quantities.
* T4 recipe remains unchanged after its Luck bonus was finalized at +80%.
* T5 uses **very large quantities of extremely common materials**.
* T5 additionally requires **1× Sapphire (1/1,100)**.
* Auto-deposit/auto-craft should help with its large material quantities.

**IMPORTANT:** Exact Pickaxe material lists should be copied into this section from the final balancing sheet/code before implementation. Do not infer missing recipe numbers from this summary.

---

# 15. Lanterns — Roll Speed

Lanterns increase Roll Speed.

## T1 — Dim Lantern

**+5% Roll Speed**

Total:

`1.05×`

Cooldown:

~`4.76s`

Recipe:

* 5× Calcite
* 3× Fluorite
* 2× Hematite
* 1× Jasper
* $250

## T2 — Bright Lantern

**+10% Roll Speed**

Total:

`1.10×`

Cooldown:

~`4.55s`

Recipe:

* 1× Dim Lantern
* 4× Fluorite
* 3× Hematite
* 2× Amethyst
* 1× Garnet
* $1,000

## T3 — Radiant Lantern

**+25% Roll Speed**

Total:

`1.25×`

Cooldown:

**4.00s**

Recipe:

* 1× Bright Lantern
* **3× Peridot (1/100)**
* **$3,500 — Tentative**

## T4 — Beacon Lantern

**+40% Roll Speed**

Total:

`1.40×`

Cooldown:

~`3.57s`

### Recipe gimmick: Heavy specimens

Uses only relatively common gems because the player must pass both:

1. Gem RNG
2. Weight RNG

Proposed structure:

* Radiant Lantern ×1
* Fluorite — unusually heavy specimen
* Hematite — unusually heavy specimen
* Agate — unusually heavy specimen
* Amethyst — unusually heavy specimen
* $8,000 — Tentative

Possible thresholds:

* Fluorite ≥3× Base Weight
* Hematite ≥2.5×
* Agate ≥2×
* Amethyst ≥1.5×

**Exact thresholds remain subject to weight-system playtesting.**

## T5 — Eternal Lantern

**+60% Roll Speed**

Total:

`1.60×`

Cooldown:

~`3.125s`

### Recipe gimmick: Rarity milestone set

Requires:

* Beacon Lantern ×1
* Amethyst ×1
* Peridot ×1
* Aquamarine ×1
* Opal ×1
* Sapphire ×1
* Emerald ×1
* $20,000 — Tentative

---

# 16. Boots — Weight Luck

Boots improve the probability of rolling weights above `1.10×`.

## T1 — Miner's Boots

**+5% Weight Luck**

Total:

`1.05×`

Recipe:

* 4× Quartz
* 3× Calcite
* 2× Obsidian
* 1× Jasper
* $250

## T2 — Reinforced Boots

**+15% Weight Luck**

Total:

`1.15×`

Recipe:

* Miner's Boots ×1
* Feldspar ×4
* Hematite ×3
* Jasper ×2
* Amethyst ×1
* $1,000

## T3 — Prospector's Boots

**+40% Weight Luck**

Total:

`1.40×`

### Recipe gimmick: Cumulative Weight

Instead of specimen quantity, players contribute a required **combined weight**.

Conceptual requirements:

* Reinforced Boots ×1
* Quartz — total contribution around 10× its Base Weight
* Obsidian — around 5× Base Weight
* Amethyst — around 2× Base Weight
* $3,500 — Tentative

Exact required grams are **TBD**.

## T4 — Fortune Boots

**+70% Weight Luck**

Total:

`1.70×`

### Recipe gimmick: Weight-range collection

Players must contribute specimens from different parts of the weight distribution.

Concept:

* Prospector's Boots ×1
* Small specimen
* Normal specimen
* Heavy specimen
* Huge specimen
* $8,000 — Tentative

Example ranges:

* Small: ≤0.75×
* Normal: 0.90×–1.10×
* Heavy: ≥2×
* Huge: ≥3×

Eligible gems should be limited to approximately `1/50` or more common.

Exact thresholds are **TBD**.

## T5 — Gravity Boots

**+125% Weight Luck**

Total:

`2.25×`

### Recipe gimmick: One enormous specimen

Requires:

* Fortune Boots ×1
* **1 specimen from a gem with base rarity 1/10 or rarer**
* Specimen must weigh **≥5× Base Weight**
* $20,000 — Tentative

Because the rarity ladder jumps from Fluorite (1/8) to Hematite (1/12), this effectively means:

**Hematite or rarer.**

The `5×` requirement may be adjusted after simulation.

---

# 17. Bags — Weight Multiplier

Bags directly increase Final Weight.

Because sell value is weight-based, Bags indirectly increase income as well.

Bonuses are intentionally smaller than the other equipment categories.

## T1 — Worn Bag

**+1% Weight**

Backend:

`1.01×`

Recipe:

* Quartz ×6
* Feldspar ×4
* Hematite ×2
* Amethyst ×1
* $400

## T2 — Sturdy Bag

**+3% Weight**

Backend:

`1.03×`

Recipe:

* Worn Bag ×1
* Feldspar ×6
* Obsidian ×4
* Jasper ×2
* Garnet ×1
* $1,500 — Tentative

## T3 — Reinforced Bag

**+6% Weight**

Backend:

`1.06×`

### Recipe gimmick: Value sacrifice

Players deposit gems until their combined sell value reaches a target.

Proposed:

* Sturdy Bag ×1
* **$7,500 worth of gems**
* Additional **$2,500**
* Values Tentative

Actual specimen sell values are used.

Excess deposited value is not refunded.

## T4 — Gemkeeper's Bag

**+10% Weight**

Backend:

`1.10×`

### Recipe gimmick: Rarity Points

Sacrificed gems grant points based on rarity.

Tentative point brackets:

| Rarity      | Points |
| ----------- | -----: |
| 1/2–1/9     |      1 |
| 1/10–1/49   |      3 |
| 1/50–1/99   |      8 |
| 1/100–1/249 |     20 |
| 1/250–1/499 |     50 |
| 1/500+      |    100 |

Proposed requirement:

* Reinforced Bag ×1
* **500 Rarity Points**
* At least **5 different gem types**
* $10,000 — Tentative

Exact point balancing is TBD.

## T5 — Bottomless Bag

**+15% Weight**

Backend:

`1.15×`

### Recipe gimmick: Gem Collection

Requires one of **every gem from Quartz through Sapphire**.

This means the player must contribute every consecutive gem in the early/mid-game collection up to Sapphire.

Also requires:

* Gemkeeper's Bag ×1
* $25,000 — Tentative

Recipe deposits allow players to complete the collection gradually.

---

# 18. Secret Equipment — Dark Matter Relic

The Dark Matter Relic is intentionally absurd and is NOT part of normal progression.

It occupies its **own unique equipment slot**.

## Hidden State

Initially, the crafting menu displays:

**???**

Its:

* Name
* Description
* Recipe
* Bonuses

are hidden.

The recipe permanently reveals once the player has **obtained Dark Matter at least once**.

Dark Matter rarity:

**1/1,000,000**

---

# 19. Dark Matter Relic Bonuses

Provides:

* **+25% Luck**
* **+25% Roll Speed**
* **+25% Weight Luck**
* **+25% Weight**

Backend contribution:

`+0.25` to all four statistics.

Relic bonuses stack additively with normal equipment.

With all T5 equipment + Relic:

| Stat              |     Final |
| ----------------- | --------: |
| Luck              | **2.75×** |
| Roll Speed        | **1.85×** |
| Weight Luck       | **2.50×** |
| Weight Multiplier | **1.40×** |

---

# 20. Dark Matter Relic Recipe

Requirements:

* **OBTAIN** Masterwork Pickaxe
* **OBTAIN** Eternal Lantern
* **OBTAIN** Gravity Boots
* **OBTAIN** Bottomless Bag
* Dark Matter ×1
* Quartz ×1,000
* Sapphire ×10
* Emerald ×5
* Painite ×1
* One specimen ≥10× Base Weight
* 10,000 Rarity Points
* **$1,000,000**

The four T5 equipment requirements are **ownership/achievement checks**.

They are NOT consumed.

All other recipe materials are consumed.

Large material requirements should support recipe depositing.

## Description

*"Statistically speaking, you should probably be doing something else."*

---

# 21. Temporary Boosts

Temporary boosts will exist in v0.1.

Current planned categories include:

* Luck
* Roll Speed
* Weight Luck

Possible Weight Multiplier boost: **TBD**

Exact:

* Bonus amounts
* Prices
* Durations

are **TBD**.

Temporary boosts should not replace the purpose of permanent equipment progression.

---

# 22. Currency

Currency is displayed simply as:

**$**

There is no fictional currency name required for v0.1.

A new player should generally earn from **a few hundred dollars up to several thousand dollars** during early progression rather than immediately reaching extremely large amounts.

Economic balance should be tested through simulation before final release.

---

# 23. v0.1 Main Screens

Minimum required interfaces:

## Roll

Displays:

* Roll button
* Cooldown
* Obtained gem
* Rarity
* Weight
* Weight multiplier
* Value

## Inventory

Displays:

* Stored specimens
* Weight
* Value
* Lock status
* Sell controls
* Capacity

## Crafting

Displays:

* Pickaxes
* Lanterns
* Boots
* Bags
* Recipe progress
* Deposits
* Hidden Dark Matter Relic

## Shop

Displays:

* Temporary boosts
* Inventory upgrades

## Gem Index

Displays:

* Discovered gems
* `???` for undiscovered gems
* Gem information

---

# 24. Recommended v0.1 Development Order

## Prototype 1 — Core RNG

Implement:

* Roll button
* 5-second cooldown
* Gem RNG
* Weight RNG
* Value calculation
* Result display

No crafting or complex UI required.

## Prototype 2 — Economy

Implement:

* Inventory
* Selling
* Money
* Inventory limits
* Locking

## Prototype 3 — Progression

Implement:

* Saving
* Gem Index
* Discovery tracking

## Prototype 4 — Crafting

Implement:

* Recipe system
* Recipe deposits
* Pickaxes

## Prototype 5 — Equipment

Implement:

* Lanterns
* Boots
* Bags
* Equipment slots
* Stat calculations

## Prototype 6 — Supporting Systems

Implement:

* Temporary boosts
* Inventory upgrades
* Large recipe auto-deposit/crafting
* Balancing

## Prototype 7 — Secrets

Implement:

* Dark Matter
* Hidden recipe
* Dark Matter Relic

## Final v0.1 Pass

* UI
* Animations
* Sound
* Balance
* Bug fixing
* Playtesting

---

# 25. Explicitly Out of Scope for v0.1

Do NOT expand v0.1 with major new systems until the core game is playable.

Possible future features include:

* Prestige / rebirth systems
* Mutations
* Multiple areas
* Quests
* Achievements
* Trading
* Leaderboards
* Events
* Additional gem pools
* New equipment tiers
* Additional crafting systems

These are potential **v0.2+** features.

---

# 26. Remaining v0.1 Decisions

Before v0.1 can be considered fully balanced:

* [ ] Finalize exact Pickaxe recipes in implementation data
* [ ] Finalize continuous Weight RNG algorithm
* [ ] Test Weight Luck probability modification
* [ ] Finalize T4 Lantern weight thresholds
* [ ] Finalize T3/T4 Boots weight requirements
* [ ] Finalize crafting money costs
* [ ] Finalize Rarity Point balancing
* [ ] Design temporary boosts
* [ ] Design inventory upgrade prices/capacities
* [ ] Simulate expected $/minute
* [ ] Simulate expected crafting times
* [ ] Test progression with all equipment tiers
* [ ] Create basic UI mockup
* [ ] Implement save system
* [ ] Playtest
* [ ] Rebalance

---

# 27. Design Principle

v0.1 should remain focused on one satisfying loop:

**Roll something → decide what to do with it → become stronger → roll better things.**

Do not add complexity merely to make the game larger.

The goal of v0.1 is to determine whether this core loop is fun.
