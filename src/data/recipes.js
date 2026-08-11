const recipes = [
  {
    id: "crude-pickaxe",
    name: "Crude Pickaxe",
    category: "pickaxe",

    cost: 250,

    ingredients: [
      { gem: "Quartz", amount: 5 },
      { gem: "Feldspar", amount: 3 },
      { gem: "Fluorite", amount: 2 },
      { gem: "Amethyst", amount: 1 }
    ],

    bonus: {
      luck: 0.05
    }
  }
];

export default recipes;
