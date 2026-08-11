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

      bonus: {
        luck: 0.05
      }
    }
  }
];

export default recipes;
