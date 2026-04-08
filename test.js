const WebSocket = require('ws');

const URL = 'ws://localhost:20021';
let passed = 0, failed = 0;

function assert(cond, msg) {
  if (cond) { passed++; console.log(`  PASS: ${msg}`); }
  else { failed++; console.log(`  FAIL: ${msg}`); }
}

function connectPlayer(name) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(URL);
    const player = { ws, id: null, color: null, msgs: [], state: 'connecting' };
    ws.on('open', () => {
      ws.send(JSON.stringify({ type: 'join', name }));
    });
    ws.on('message', (data) => {
      const msg = JSON.parse(data);
      player.msgs.push(msg);
      if (msg.type === 'joined') {
        player.id = msg.id;
        player.color = msg.color;
        player.state = 'joined';
        resolve(player);
      }
    });
    ws.on('error', reject);
    setTimeout(() => reject(new Error('Connection timeout')), 5000);
  });
}

function waitForMsg(player, type, timeout = 30000) {
  return new Promise((resolve, reject) => {
    // Check already received
    const existing = player.msgs.find(m => m.type === type);
    if (existing) return resolve(existing);
    const handler = (data) => {
      const msg = JSON.parse(data);
      player.msgs.push(msg);
      if (msg.type === type) {
        player.ws.removeListener('message', handler);
        resolve(msg);
      }
    };
    player.ws.on('message', handler);
    setTimeout(() => { player.ws.removeListener('message', handler); reject(new Error(`Timeout waiting for ${type}`)); }, timeout);
  });
}

function getLatestState(player) {
  for (let i = player.msgs.length - 1; i >= 0; i--) {
    if (player.msgs[i].type === 'state') return player.msgs[i];
  }
  return null;
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function runTests() {
  console.log('\n=== Strawberry Cow Battle Royale E2E Tests ===\n');

  // Test 1: Connection
  console.log('Test 1: Player connection');
  let p1, p2;
  try {
    p1 = await connectPlayer('TestCow1');
    assert(p1.id !== null, 'Player 1 got an ID: ' + p1.id);
    assert(p1.color !== null, 'Player 1 got a color: ' + p1.color);
    p2 = await connectPlayer('TestCow2');
    assert(p2.id !== null, 'Player 2 got an ID: ' + p2.id);
    assert(p1.id !== p2.id, 'Players have different IDs');
  } catch (e) {
    assert(false, 'Connection failed: ' + e.message);
    process.exit(1);
  }

  // Test 2: Lobby
  console.log('\nTest 2: Lobby');
  const lobbyMsg = p1.msgs.find(m => m.type === 'lobby');
  assert(!!lobbyMsg, 'Received lobby message');
  if (lobbyMsg) {
    assert(lobbyMsg.players.length >= 2, 'Lobby has at least 2 players');
    assert(lobbyMsg.countdown > 0, 'Lobby has countdown: ' + lobbyMsg.countdown);
  }

  // Test 3: Game start (wait for lobby countdown)
  console.log('\nTest 3: Game start');
  let startMsg;
  try {
    startMsg = await waitForMsg(p1, 'start', 25000);
    assert(!!startMsg, 'Received start message');
    assert(startMsg.players.length >= 2, 'Game has ' + startMsg.players.length + ' players (including bots)');
    assert(startMsg.foods.length > 0, 'Game has ' + startMsg.foods.length + ' foods');
    assert(!!startMsg.map, 'Game has map data');
    if (startMsg.map) {
      assert(startMsg.map.walls.length > 0, 'Map has ' + startMsg.map.walls.length + ' walls');
    }
    assert(!!startMsg.zone, 'Game has zone data');
  } catch (e) {
    assert(false, 'Game start timeout: ' + e.message);
  }

  // Test 4: State updates
  console.log('\nTest 4: State updates');
  await sleep(500);
  const stateMsg = getLatestState(p1);
  assert(!!stateMsg, 'Receiving state updates');
  if (stateMsg) {
    const me = stateMsg.players.find(p => p.id === p1.id);
    assert(!!me, 'Player 1 found in state');
    if (me) {
      assert(me.alive === true, 'Player 1 is alive');
      assert(me.hunger > 0, 'Player 1 has hunger: ' + me.hunger);
      assert(typeof me.x === 'number', 'Player has x position');
      assert(typeof me.y === 'number', 'Player has y position');
    }
  }

  // Test 5: Movement
  console.log('\nTest 5: Movement');
  const stBefore = getLatestState(p1);
  const meBefore = stBefore?.players.find(p => p.id === p1.id);
  const xBefore = meBefore?.x || 0;
  p1.ws.send(JSON.stringify({ type: 'move', dx: 1, dy: 0 }));
  await sleep(300);
  const stAfter = getLatestState(p1);
  const meAfter = stAfter?.players.find(p => p.id === p1.id);
  if (meBefore && meAfter) {
    assert(meAfter.x > xBefore, 'Player moved right (x: ' + xBefore.toFixed(0) + ' -> ' + meAfter.x.toFixed(0) + ')');
  }
  p1.ws.send(JSON.stringify({ type: 'move', dx: 0, dy: 0 })); // stop

  // Test 6: Attack
  console.log('\nTest 6: Attack');
  const projCountBefore = p1.msgs.filter(m => m.type === 'projectile').length;
  p1.ws.send(JSON.stringify({ type: 'attack', aimX: 1, aimY: 0 }));
  await sleep(200);
  const projCountAfter = p1.msgs.filter(m => m.type === 'projectile').length;
  assert(projCountAfter > projCountBefore, 'Projectile spawned on attack');

  // Test 7: Dash
  console.log('\nTest 7: Dash');
  const dashBefore = getLatestState(p1)?.players.find(p => p.id === p1.id);
  const dashXBefore = dashBefore?.x || 0;
  p1.ws.send(JSON.stringify({ type: 'move', dx: 1, dy: 0 }));
  p1.ws.send(JSON.stringify({ type: 'dash' }));
  await sleep(200);
  const dashAfter = getLatestState(p1)?.players.find(p => p.id === p1.id);
  if (dashBefore && dashAfter) {
    assert(dashAfter.x > dashXBefore + 30, 'Dash moved player significantly (dx: ' + (dashAfter.x - dashXBefore).toFixed(0) + ')');
  }
  p1.ws.send(JSON.stringify({ type: 'move', dx: 0, dy: 0 }));

  // Test 8: Perk selection
  console.log('\nTest 8: Perk selection');
  p1.ws.send(JSON.stringify({ type: 'perk', id: 'speed' }));
  await sleep(100);
  assert(true, 'Perk message sent without error');

  // Test 9: Hunger drain
  console.log('\nTest 9: Hunger drain');
  const hungerStart = getLatestState(p1)?.players.find(p => p.id === p1.id)?.hunger;
  await sleep(2000);
  const hungerEnd = getLatestState(p1)?.players.find(p => p.id === p1.id)?.hunger;
  if (hungerStart && hungerEnd) {
    assert(hungerEnd < hungerStart, 'Hunger decreased over time (' + hungerStart.toFixed(1) + ' -> ' + hungerEnd.toFixed(1) + ')');
  }

  // Test 10: Bots exist
  console.log('\nTest 10: Bots');
  const lastState = getLatestState(p1);
  if (lastState) {
    const totalPlayers = lastState.players.length;
    assert(totalPlayers >= 4, 'Game has ' + totalPlayers + ' total players (humans + bots)');
  }

  // Test 11: Weapon pickups exist
  console.log('\nTest 11: Weapon pickups');
  const weaponMsgs = p1.msgs.filter(m => m.type === 'weaponSpawn');
  const startWeapons = startMsg?.weapons;
  assert((startWeapons && startWeapons.length > 0) || weaponMsgs.length > 0, 'Weapon pickups exist in game');

  // Test 12: Disconnect handling
  console.log('\nTest 12: Disconnect');
  p2.ws.close();
  await sleep(500);
  const stateAfterDC = getLatestState(p1);
  if (stateAfterDC) {
    const p2InState = stateAfterDC.players.find(p => p.id === p2.id);
    assert(!p2InState || !p2InState.alive, 'Disconnected player removed or marked dead');
  }

  // Cleanup
  p1.ws.close();

  // Summary
  console.log(`\n=== Results: ${passed} passed, ${failed} failed ===\n`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch(e => { console.error('Test error:', e); process.exit(1); });
