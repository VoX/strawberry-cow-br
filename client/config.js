import { MAP_W, MAP_H, COLORS, FOOD_TYPES, WEAPON_TYPES } from '../shared/constants.js';

export const MW=MAP_W,MH=MAP_H,CH=35;
export { COLORS, FOOD_TYPES, WEAPON_TYPES };
export const COL={pink:0xff88aa,blue:0x88aaff,green:0x88ff88,gold:0xffdd44,purple:0xcc88ff};
export const FOOD_E={strawberry:'\u{1F353}',cake:'\u{1F382}',pizza:'\u{1F355}',icecream:'\u{1F366}',donut:'\u{1F369}',cupcake:'\u{1F9C1}',cookie:'\u{1F36A}'};
export const WPCOL={shotgun:0xff4444,burst:0x44aaff,bolty:0xffaa00,cowtank:0x44ff44};
export const PERKS=[
  {id:'speed',name:'Swift Hooves',desc:'+15% speed'},
  {id:'extrahunger',name:'Big Belly',desc:'+40 max hunger'},
  {id:'xpboost',name:'Quick Learner',desc:'+50% XP'},
  {id:'fastfire',name:'Trigger Job',desc:'-25% cooldown'},
  {id:'cheapshot',name:'Eco Mag',desc:'-33% shot hunger cost'},
  {id:'bigbore',name:'Hollow Points',desc:'+20% damage'},
  {id:'kevlar',name:'Kevlar',desc:'+25 max armor'},
  {id:'dashcd',name:'Quick Hoof',desc:'-40% dash cooldown'},
  {id:'tiny',name:'Tiny Mode',desc:'smaller + faster'},
  {id:'cowstrike',name:'Cowstrike',desc:'bomb the map'},
];
