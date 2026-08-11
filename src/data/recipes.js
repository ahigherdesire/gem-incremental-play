const recipes = [
  {
    id: "crude-pickaxe",
    name: "Crude Pickaxe",
    category: "pickaxe",

    requirements: [
      {
        type: "gem-count",
        gem: "Quartz",
        amount: 5
      },
      {
        type: "gem-count",
        gem: "Feldspar",
        amount: 3
      },
      {
        type: "gem-count",
        gem: "Fluorite",
        amount: 2
      },
      {
        type: "gem-count",
        gem: "Amethyst",
        amount: 1
      }
    ],

    moneyCost: 250,

    reward: {
      id: "crude-pickaxe",
      name: "Crude Pickaxe",
      category: "pickaxe",
      tier: 1,

      bonus: {
        luck: 0.05
      }
    }
  },

  {
    id: "reinforced-pickaxe",
    name: "Reinforced Pickaxe",
    category: "pickaxe",

    requirements: [
      {
        type: "equipment",
        equipmentId: "crude-pickaxe"
      },
      {
        type: "gem-count",
        gem: "Hematite",
        amount: 4
      },
      {
        type: "gem-count",
        gem: "Obsidian",
        amount: 3
      },
      {
        type: "gem-count",
        gem: "Garnet",
        amount: 2
      },
      {
        type: "gem-count",
        gem: "Peridot",
        amount: 1
      }
    ],

    moneyCost: 1000,

    reward: {
      id: "reinforced-pickaxe",
      name: "Reinforced Pickaxe",
      category: "pickaxe",
      tier: 2,

      bonus: {
        luck: 0.15
      }
    }
  },

  {
    id: "polished-pickaxe",
    name: "Polished Pickaxe",
    category: "pickaxe",

    requirements: [
      {
        type: "equipment",
        equipmentId: "reinforced-pickaxe"
      },
      {
        type: "gem-count",
        gem: "Garnet",
        amount: 1
      },
      {
        type: "gem-count",
        gem: "Peridot",
        amount: 1
      },
      {
        type: "gem-count",
        gem: "Topaz",
        amount: 1
      },
      {
        type: "gem-count",
        gem: "Aquamarine",
        amount: 1
      }
    ],

    moneyCost: 3500,

    reward: {
      id: "polished-pickaxe",
      name: "Polished Pickaxe",
      category: "pickaxe",
      tier: 3,

      bonus: {
        luck: 0.50
      }
    }
  },

  {
    id: "refined-pickaxe",
    name: "Refined Pickaxe",
    category: "pickaxe",

    requirements: [
      {
        type: "equipment",
        equipmentId: "polished-pickaxe"
      },
      {
        type: "gem-count",
        gem: "Topaz",
        amount: 1
      },
      {
        type: "gem-count",
        gem: "Aquamarine",
        amount: 1
      },
      {
        type: "gem-count",
        gem: "Tourmaline",
        amount: 1
      },
      {
        type: "gem-count",
        gem: "Opal",
        amount: 1
      }
    ],

    moneyCost: 7500,

    reward: {
      id: "refined-pickaxe",
      name: "Refined Pickaxe",
      category: "pickaxe",
      tier: 4,

      bonus: {
        luck: 0.80
      }
    }
  },

  {
    id: "masterwork-pickaxe",
    name: "Masterwork Pickaxe",
    category: "pickaxe",

    requirements: [
      {
        type: "equipment",
        equipmentId: "refined-pickaxe"
      },
      {
        type: "gem-count",
        gem: "Quartz",
        amount: 100
      },
      {
        type: "gem-count",
        gem: "Feldspar",
        amount: 50
      },
      {
        type: "gem-count",
        gem: "Hematite",
        amount: 25
      },
      {
        type: "gem-count",
        gem: "Obsidian",
        amount: 15
      },
      {
        type: "gem-count",
        gem: "Sapphire",
        amount: 1
      }
    ],

    moneyCost: 20000,

    reward: {
      id: "masterwork-pickaxe",
      name: "Masterwork Pickaxe",
      category: "pickaxe",
      tier: 5,

      bonus: {
        luck: 1.50
      }
    }
  }
];

export default recipes;
