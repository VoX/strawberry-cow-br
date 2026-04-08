const PORT = 20021;
const TICK_RATE = 20;
const MAP_W = 2000, MAP_H = 1500;
const COLORS = ['pink','blue','green','gold','purple'];
const FOOD_TYPES = [
  {name:'strawberry',hunger:15,pts:10},
  {name:'cake',hunger:30,pts:25},
  {name:'pizza',hunger:20,pts:15},
  {name:'icecream',hunger:25,pts:20},
  {name:'donut',hunger:18,pts:12},
  {name:'cupcake',hunger:22,pts:18},
  {name:'cookie',hunger:12,pts:8},
];
const WEAPON_TYPES = ['shotgun','burst','bolty','shotgun','burst','bolty','cowtank'];
const BOT_NAMES = ['MooCow','BurgerBoy','SteakMate','DairyQueen','CowPoke','BeefCake','MilkMan','Cheddar'];

module.exports = { PORT, TICK_RATE, MAP_W, MAP_H, COLORS, FOOD_TYPES, WEAPON_TYPES, BOT_NAMES };
