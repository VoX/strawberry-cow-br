const MAP_W = 2000;
const MAP_H = 1500;
const COLORS = ['pink','blue','green','gold','purple','red','orange','cyan'];
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

module.exports = { MAP_W, MAP_H, COLORS, FOOD_TYPES, WEAPON_TYPES };
