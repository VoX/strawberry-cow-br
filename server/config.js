const { MAP_W, MAP_H, COLORS, FOOD_TYPES, WEAPON_TYPES } = require('../shared/constants');

const PORT = parseInt(process.env.PORT || '20021', 10);
const TICK_RATE = 40;

// Bot roster. Each name maps to a permanent personality + a per-cow
// chat pool that fits the name's vibe. Bots whose name isn't in the
// table get a random personality and only the personality + global
// pools to draw from.
//
// Personalities: 'timid' | 'balanced' | 'aggressive' — also affects
// AI behaviour in bot-ai.js (engage range, retreat thresholds, etc.).
const BOT_PROFILES = {
  // --- Aggressive: trash-talkers, alphas, predators ---
  'CowntDracula':    { personality: 'aggressive', lines: ["i vant to suck your milk", "the night is ours", "rise from the udder, my children", "your blood... is sweet like cream"] },
  'MooFasa':         { personality: 'aggressive', lines: ["everything the light touches is my pasture", "remember who you are, prey", "long live the king", "this is the circle of strife"] },
  'AngusYoung':      { personality: 'aggressive', lines: ["thunderstruck, baby", "for those about to graze, i salute you", "highway to the meadow", "rock and roll ain't moo pollution"] },
  'Heifernator':     { personality: 'aggressive', lines: ["i'll be back", "hasta la vista, baby cow", "come with me if you want to graze", "your clothes, give them to me"] },
  'BeefCake':        { personality: 'aggressive', lines: ["do you even lift, calf?", "leg day is every day", "sun's out, udders out", "swole patrol checking in"] },
  'T-Bone':          { personality: 'aggressive', lines: ["medium rare or medium dead", "i am the cut", "bone in, hooves up", "they call me T for terror"] },
  'Brisket':         { personality: 'aggressive', lines: ["low and slow ends with you", "smoke ring around your corpse", "fork tender, just like u", "16 hours in the pit, baby"] },
  'Longhorn':        { personality: 'aggressive', lines: ["yeehaw, partner", "this town ain't big enough", "draw, you varmint", "horns out, pride high"] },
  'CowPoke':         { personality: 'aggressive', lines: ["yippee ki yay, milk drinker", "sundown, showdown", "this is my saloon now", "tumbleweeds and fresh udder"] },
  'SirLoin':         { personality: 'aggressive', lines: ["bow before the cut, peasant", "knighted by the grill", "the round table is mine", "for the realm, for the rump"] },
  'MooShiesty':      { personality: 'aggressive', lines: ["blue hunnids only", "pour up the moo, lil cow", "this is my block now", "moo gang moo gang"] },
  'CowRupt':         { personality: 'aggressive', lines: ["everything is rigged", "the swamp runs on milk", "follow the udder, find the truth", "they don't want you to graze"] },
  'PattyMelt':       { personality: 'aggressive', lines: ["griddled to perfection", "two patties, no mercy", "diner's open, hours: forever", "rye bread or die bread"] },

  // --- Timid: anxious, apologetic, soft, sad ---
  'Cuddles':         { personality: 'timid',     lines: ["s-sorry...", "please don't hurt me", "i just wanted to be friends", "do you have any cake?"] },
  'CreamPuff':       { personality: 'timid',     lines: ["i flatten so easily", "is it safe to come out?", "my whipped cream filling is leaking", "i'd rather be in the pastry case"] },
  'JellyBean':       { personality: 'timid',     lines: ["i'm too sweet for this", "the meadow is scary", "p-please pick me last", "wait i wasn't ready"] },
  'Daisy':           { personality: 'timid',     lines: ["i just like the flowers", "the bees are nice though", "my petals are wilting", "is it spring yet?"] },
  'Clover':          { personality: 'timid',     lines: ["four-leaf or bust", "irish goodbye, see ya", "rabbits scare me", "my luck has run out"] },
  'Bessie':          { personality: 'timid',     lines: ["back in my day...", "i don't run anymore", "where did all the calves go", "it's past my milking time"] },
  'Clarabelle':      { personality: 'timid',     lines: ["oh dear", "this is most unbecoming", "i'd like to go home", "pardon me, pardon me"] },
  'Brie':            { personality: 'timid',     lines: ["i'm too soft for this", "room temperature please", "don't squish me", "my rind is delicate"] },
  'Feta':            { personality: 'timid',     lines: ["crumbling under pressure", "salty about everything", "greek to me", "preserved in brine, preserved in fear"] },

  // --- Balanced: jokers, weirdos, pun lords ---
  'Cheddar':         { personality: 'balanced',  lines: ["that's mighty cheesy of you", "sharp tongue, sharper cheese", "i age like fine wine", "extra mild, extra deadly"] },
  'Gruyere':         { personality: 'balanced',  lines: ["fondue or die", "swiss army cow", "alpine vibes only", "holes in your argument, none in me"] },
  'MozzaMoo':        { personality: 'balanced',  lines: ["that's amore", "stretchy and forgiving", "pizza party in the meadow", "fresh outta the buffalo udder"] },
  'DairyQueen':      { personality: 'balanced',  lines: ["blizzard incoming", "soft serve, hard hits", "size large pls", "i'm flipping you upside down"] },
  'MilkMan':         { personality: 'balanced',  lines: ["delivery's here", "got milk?", "leave the bottles by the porch", "always cold, always fresh"] },
  'BurgerBoy':       { personality: 'balanced',  lines: ["want fries with that L?", "two all-beef hooves", "have it your way", "drive-thru's closed"] },
  'SteakMate':       { personality: 'balanced',  lines: ["medium-well meets cold-blooded", "season first, hit second", "marbling matters", "my crust is divine"] },
  'DrMoo':           { personality: 'balanced',  lines: ["the prognosis isn't good", "say ahh", "this is for science", "i practice on willing subjects"] },
  'Hoofdini':        { personality: 'balanced',  lines: ["now you see me", "abracalfdabra", "pick a perk, any perk", "my next trick: vanishing"] },
  'MooDonna':        { personality: 'balanced',  lines: ["material cow in a material meadow", "vogue, vogue, vogue", "papa don't graze", "express yourself"] },
  'MooTang':         { personality: 'balanced',  lines: ["wu-tang for the udders", "protect ya neck", "C.R.E.A.M. (cows rule everything around me)", "udderlly butter for ya"] },
  'MooJesty':        { personality: 'balanced',  lines: ["bow before the throne", "the crown is heavy and sticky", "off with their hooves", "the queen has spoken"] },
  'Cowbell':         { personality: 'balanced',  lines: ["needs more cowbell", "i got a fever", "explore the studio space", "guess what? i got a fever..."] },
  'Cowculator':      { personality: 'balanced',  lines: ["let me run the numbers", "your odds are 0.03%", "math doesn't lie, you do", "compute this"] },
  'Bovinity':        { personality: 'balanced',  lines: ["divine intervention", "the udder reveals all", "blessed by the herd", "holy moo"] },
  'Bullseye':        { personality: 'balanced',  lines: ["dead center", "20s on the dartboard", "right between the eyes", "called my shot"] },
  'Ferdinand':       { personality: 'timid',     lines: ["i just want to smell the flowers", "no fighting please", "the bees! ow!", "leave me under the cork tree"] },
  'Cashmoo':         { personality: 'aggressive', lines: ["money talks, milk walks", "ka-ching", "bag secured", "i invented the udder market"] },
  'PrimeMooVer':     { personality: 'aggressive', lines: ["next day delivery", "logistics is my game", "the convoy never sleeps", "moving units, moving udders"] },
  'Holstein':        { personality: 'balanced',  lines: ["black and white, just like the world", "i'm the friesian rep", "milk production: maximum", "spotted excellence"] },
  'Wagyu':           { personality: 'balanced',  lines: ["A5 only, nothing less", "i was massaged for this", "marbling is my love language", "$300 a pound, baby"] },
  'Ribeye':          { personality: 'balanced',  lines: ["bone in, glory out", "the cap is the best part", "thick and juicy", "ask me about marbling"] },
  'LadyMoo':         { personality: 'balanced',  lines: ["pearls and pasture", "tea at four, war at five", "shall we?", "mind your manners"] },
  'MooStache':       { personality: 'balanced',  lines: ["sacre bleu", "twirl twirl", "pardonnez-moi", "the gentleman has arrived"] },
  'ButterScotch':    { personality: 'balanced',  lines: ["smooth and golden", "candied to perfection", "rich, sweet, and lethal", "i melt in your mouth"] },
  'MilkDud':         { personality: 'balanced',  lines: ["chewy victory", "stuck in your teeth, like me in your kill cam", "candy aisle champion", "small but devastating"] },
  'Rumpsteak':       { personality: 'balanced',  lines: ["cheeky and tender", "best served from behind", "the unsung cut", "no offense taken"] },

  // --- The Inchworm Survivor (special) ---
  'Inchworm Survivor': { personality: 'aggressive', lines: [
    "i lived through the inchworm era",
    "you weren't there. you don't understand.",
    "it pulled me back forever",
    "we don't talk about the rubberband",
    "the smoother... the smoother saw things",
    "every quick turn, a small death",
  ]},
};

const PERSONALITY_LINES = {
  aggressive: [
    "get udder'd, loser",
    "i'm lactose intolerant to your L's",
    "this ain't your pasture",
    "moo-ve aside peasant",
    "i'm the gr8est of all thyme",
    "ez dubs",
    "prepare to be grilled",
    "you couldn't hit the broadside of a barn",
    "im the cream of the crop",
    "hope u brought a straw",
    "time to churn butter",
    "udderly embarrassing for you",
    "the pasture is mine",
    "bro thought he was something",
    "beef is served",
    "i'll be taking that udder",
    "kos, no u",
    "offline my barn bro",
    "that's my loot, naked",
    "bag check the corpse",
    "wiped ur barn, ez",
    "i dropped a satchel on your hay bale",
    "my moo-zine is fuller than yours",
  ],
  timid: [
    "got raided, lost everything except the cows",
    "the meadow is cruel",
    "p-please don't",
    "i'm just here for the grass",
    "is it safe?",
    "i don't want any trouble",
    "maybe we could be friends?",
    "the udder hurts",
    "i should go home",
    "every day is a gift, every shot is a curse",
    "i miss my barn",
    "hooves are shaking",
    "wasn't there yesterday a peace?",
  ],
  balanced: [
    "that was a mooving experience",
    "got milked lol",
    "cud i BE any better?",
    "steaks are high, homie",
    "hoof would've thought",
    "spit gun is meta btw",
    "how now brown cow",
    "no beef?",
    "got the moo-jo working",
    "milk before cereal pls",
    "send it",
    "thats a nah from me dawg",
    "cowabunga it is",
    "rare steak only",
    "moooove",
    "you just got countered at the moo-cade",
  ],
};

// Global pool — drawn from by every bot regardless of name or personality.
// Mostly meta / Rust-clone references / inside jokes.
const GLOBAL_LINES = [
  "Do you like Pizza",
  "rat you out my udder",
  "nakeds out, suited in",
  "roof camping w/ the L9",
  "farming hemp with my cud",
  "heli on the map, cows beware",
  "sulfur before stew, always",
  "no honor in this server, only udder",
  "metal bbq hours",
  "build tower, farm udder, repeat",
  // Inchworm references — historical event.
  "is anyone else getting the inchworm bug",
  "did they fix inchworm yet",
  "i swear i had inchworm again",
  "rip inchworm, gone but not forgotten",
  "back when inchworm was real, life was hard",
  "skill issue, sounds like inchworm",
  "the inchworm survivors club",
  "i miss inchworm tbh, kept things spicy",
];

// Backwards-compat: BOT_CHAT_LINES used to be a flat array. The new code
// goes through pickBotChatLine; this stays exported as the global pool
// for any caller that hasn't migrated.
const BOT_CHAT_LINES = GLOBAL_LINES;

// Bot name list — derived from BOT_PROFILES keys plus a few generic
// fillers so spawnBots always has enough names even if profiles shrink.
const BOT_NAMES = [
  ...Object.keys(BOT_PROFILES),
  'MooCow', 'UdderChaos', 'MooLander', 'Grazey', 'Moosician', 'Barnaby',
];

// Pick a chat line for a bot from its merged pool. Per-cow lines weight
// 3× so signature lines for distinctive bots actually show up; per-
// personality and global lines fill out the rotation.
function pickBotChatLine(bot) {
  const profile = BOT_PROFILES[bot.name];
  const cowLines = profile ? profile.lines : [];
  const personality = (profile && profile.personality) || bot.personality || 'balanced';
  const personalityLines = PERSONALITY_LINES[personality] || [];
  const total = cowLines.length * 3 + personalityLines.length + GLOBAL_LINES.length;
  if (total === 0) return null;
  let r = Math.floor(Math.random() * total);
  if (r < cowLines.length * 3) return cowLines[Math.floor(r / 3)];
  r -= cowLines.length * 3;
  if (r < personalityLines.length) return personalityLines[r];
  r -= personalityLines.length;
  return GLOBAL_LINES[r];
}

module.exports = {
  PORT, TICK_RATE, MAP_W, MAP_H, COLORS, FOOD_TYPES, WEAPON_TYPES,
  BOT_NAMES, BOT_CHAT_LINES, BOT_PROFILES, PERSONALITY_LINES, GLOBAL_LINES,
  pickBotChatLine,
};
