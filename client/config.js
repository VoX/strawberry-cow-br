import { MAP_W, MAP_H } from '../shared/constants.js';

export const MW=MAP_W,MH=MAP_H,CH=35;
export const COL={pink:0xff88aa,blue:0x88aaff,green:0x88ff88,gold:0xffdd44,purple:0xcc88ff,red:0xff4444,orange:0xff8844,cyan:0x44ffdd};
export const WPCOL={shotgun:0xff4444,burst:0x44aaff,bolty:0xffaa00,cowtank:0x44ff44,aug:0xaa44ff};
export const PERKS=[
  {id:'speed',name:'Swift Hooves',desc:'+15% speed'},
  {id:'extrahunger',name:'Big Udders',desc:'+40 max milk'},
  {id:'fastfire',name:'Trigger Job',desc:'-25% cooldown'},
  {id:'cheapshot',name:'Eco Mag',desc:'-33% shot milk cost'},
  {id:'bigbore',name:'Hollow Points',desc:'+20% damage'},
  {id:'kevlar',name:'Hide of Steel',desc:'-15% damage taken'},
  {id:'dashcd',name:'Quick Hoof',desc:'-40% dash cooldown'},
  {id:'tiny',name:'Tiny Mode',desc:'smaller + faster'},
  {id:'cowstrike',name:'Cowstrike',desc:'bomb the map'},
  {id:'extmag',name:'Extended Mag',desc:'+25% magazine capacity'},
  {id:'tacticow',name:'Tacti-Cow Gloves',desc:'-30% recoil'},
  {id:'milksteal',name:'Milksteal',desc:'+0.5 dmg, heal 0.5% on hit'},
];
