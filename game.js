const BASE_ATTACKS = [
  {id:"guard_slash", name:"검격 방어", type:"attack", effect:4, desc:"방어력 +4"},
  {id:"brace", name:"받아치기", type:"attack", effect:5, desc:"방어력 +5"},
  {id:"iron_guard", name:"철벽 자세", type:"attack", effect:6, desc:"방어력 +6"}
];

const BASE_RESOURCES = [
  {id:"gather", name:"채집", type:"resource", effect:1, desc:"자원 +1"},
  {id:"mine", name:"채굴", type:"resource", effect:1, desc:"자원 +1"},
  {id:"scavenge", name:"수집", type:"resource", effect:1, desc:"자원 +1"}
];

const DECKS = [
  {
    id:"warrior",
    name:"⚔️ 전투 덱",
    desc:"방어를 안정적으로 확보하는 덱",
    cards:[
      {id:"power_guard", name:"강력한 방어", type:"attack", effect:7, desc:"방어력 +7"},
      {id:"counter", name:"반격 준비", type:"attack", effect:4, desc:"방어력 +4. 다음 라운드 자원 +1"},
      {id:"quick_guard", name:"빠른 방어", type:"attack", effect:3, desc:"방어력 +3. 카드 1장 추가"},
      {id:"battle_supply", name:"전투 보급", type:"resource", effect:2, desc:"자원 +2"},
      {id:"salvage", name:"전리품 회수", type:"resource", effect:1, desc:"자원 +1. 카드 1장 추가"}
    ]
  },
  {
    id:"resource",
    name:"💰 자원 덱",
    desc:"자원을 많이 모아 빠르게 덱을 성장시키는 덱",
    cards:[
      {id:"rich_mine", name:"풍부한 광맥", type:"resource", effect:3, desc:"자원 +3"},
      {id:"treasure", name:"보물 수집", type:"resource", effect:2, desc:"자원 +2"},
      {id:"scout", name:"탐색", type:"resource", effect:1, desc:"자원 +1. 카드 2장 추가"},
      {id:"emergency_guard", name:"비상 방어", type:"attack", effect:3, desc:"방어력 +3"},
      {id:"wooden_shield", name:"나무 방패", type:"attack", effect:5, desc:"방어력 +5"}
    ]
  },
  {
    id:"balanced",
    name:"⚖️ 균형 덱",
    desc:"공격과 자원을 고르게 확보하는 덱",
    cards:[
      {id:"solid_guard", name:"단단한 방어", type:"attack", effect:5, desc:"방어력 +5"},
      {id:"tactical", name:"전술 방어", type:"attack", effect:4, desc:"방어력 +4. 자원 +1"},
      {id:"supply", name:"보급", type:"resource", effect:2, desc:"자원 +2"},
      {id:"search", name:"수색", type:"resource", effect:1, desc:"자원 +1. 카드 1장 추가"},
      {id:"risk_reward", name:"위험한 채집", type:"resource", effect:3, desc:"자원 +3. 다음 적 공격 +2"}
    ]
  },
  {
    id:"luck",
    name:"🎲 운빨 덱",
    desc:"작은 확률 효과로 큰 이득을 노리는 덱",
    cards:[
      {id:"lucky_guard", name:"행운의 방어", type:"attack", effect:4, desc:"방어력 +4. 50% 확률로 +3"},
      {id:"lucky_coin", name:"행운의 동전", type:"resource", effect:1, desc:"자원 +1. 50% 확률로 +2"},
      {id:"jackpot", name:"잭팟", type:"resource", effect:0, desc:"50%: 자원 +5 / 50%: 자원 +0"},
      {id:"gamble_guard", name:"도박 방어", type:"attack", effect:0, desc:"50%: 방어 +10 / 50%: 방어 +1"},
      {id:"reroll", name:"운명 바꾸기", type:"resource", effect:2, desc:"자원 +2. 카드 1장 추가"}
    ]
  }
];

let state = null;

const $ = id => document.getElementById(id);
const clone = obj => JSON.parse(JSON.stringify(obj));
const rand = arr => arr[Math.floor(Math.random() * arr.length)];

function buildDeck(chosen) {
  return [...clone(BASE_ATTACKS), ...clone(BASE_RESOURCES), ...clone(chosen.cards)];
}

function startGame(deckId) {
  const chosen = DECKS.find(d => d.id === deckId);
  state = {
    chosenDeck: chosen,
    deck: buildDeck(chosen),
    drawPile: [],
    discard: [],
    hand: [],
    hp: 30,
    maxHp: 30,
    block: 0,
    resources: 0,
    round: 1,
    enemyHp: 20,
    enemyMaxHp: 20,
    enemyAttack: 6,
    extraNextAttack: 0,
    bonusNextResource: 0,
    cardsPlayed: 0
  };
  showScreen("gameScreen");
  log(`「${chosen.name}」을 선택했습니다. 시작 덱은 11장입니다.`);
  startRound();
}

function resetPiles() {
  state.drawPile = clone(state.deck).sort(() => Math.random() - 0.5);
  state.discard = [];
}

function drawCards(n) {
  for (let i=0; i<n; i++) {
    if (state.drawPile.length === 0) {
      if (state.discard.length === 0) break;
      state.drawPile = state.discard.splice(0).sort(() => Math.random() - 0.5);
    }
    state.hand.push(state.drawPile.pop());
  }
}

function startRound() {
  state.block = 0;
  state.resources = 0;
  state.hand = [];
  if (state.drawPile.length === 0 && state.discard.length === 0) resetPiles();
  drawCards(5);
  log(`라운드 ${state.round} 시작! 5장을 뽑았습니다.`);
  render();
}

function playCard(index) {
  const card = state.hand[index];
  if (!card) return;

  let message = "";
  if (card.type === "attack") {
    let value = card.effect;
    if (card.id === "lucky_guard") value += Math.random() < 0.5 ? 3 : 0;
    if (card.id === "gamble_guard") value = Math.random() < 0.5 ? 10 : 1;
    state.block += value;
    if (card.id === "counter") state.bonusNextResource += 1;
    if (card.id === "quick_guard") drawCards(1);
    if (card.id === "tactical") state.resources += 1;
    if (card.id === "lucky_guard") message = ` 행운 판정으로 방어 ${value}!`;
    else message = ` 방어 ${value}!`;
  } else {
    let value = card.effect;
    if (card.id === "jackpot") value = Math.random() < 0.5 ? 5 : 0;
    if (card.id === "lucky_coin") value += Math.random() < 0.5 ? 2 : 0;
    if (card.id === "scout") drawCards(2);
    if (card.id === "salvage" || card.id === "reroll" || card.id === "search") drawCards(1);
    if (card.id === "risk_reward") state.extraNextAttack += 2;
    value += state.bonusNextResource;
    state.bonusNextResource = 0;
    state.resources += value;
    message = ` 자원 +${value}!`;
  }

  state.hand.splice(index, 1);
  state.discard.push(card);
  state.cardsPlayed++;
  log(`▶ ${card.name} 사용.${message}`);
  render();
}

function endTurn() {
  if (state.hand.length) {
    state.discard.push(...state.hand);
    state.hand = [];
  }

  const damage = Math.max(0, state.enemyAttack + state.extraNextAttack - state.block);
  const blocked = Math.min(state.block, state.enemyAttack + state.extraNextAttack);
  state.hp -= damage;
  state.extraNextAttack = 0;

  log(`👹 적의 공격 ${state.enemyAttack + (damage > 0 ? 0 : 0)}. 방어 ${blocked}, 피해 ${damage}.`);

  if (state.hp <= 0) {
    state.hp = 0;
    showGameOver(false);
    return;
  }

  state.enemyHp -= 0;
  openShop();
}

function openShop() {
  const offers = [];
  const pool = state.chosenDeck.cards.concat(BASE_ATTACKS, BASE_RESOURCES);
  const unique = [];
  pool.forEach(c => { if (!unique.some(x => x.id === c.id)) unique.push(c); });
  while (offers.length < 4 && unique.length) {
    const c = clone(rand(unique));
    if (!offers.some(x => x.id === c.id)) offers.push(c);
  }
  state.shopOffers = offers.map(c => ({
    ...c,
    price: c.type === "attack" ? 3 + Math.floor(Math.random() * 3) : 2 + Math.floor(Math.random() * 3)
  }));
  showScreen("shopScreen");
  renderShop();
}

function buyCard(index) {
  const card = state.shopOffers[index];
  if (!card || card.bought) return;
  if (state.resources < card.price) return;
  state.resources -= card.price;
  state.deck.push(clone(card));
  card.bought = true;
  log(`🛒 ${card.name}을 구매했습니다. 덱이 ${state.deck.length}장으로 늘었습니다.`);
  renderShop();
}

function nextRound() {
  state.resources = 0;
  state.round++;
  state.enemyHp = Math.min(state.enemyMaxHp + (state.round - 1) * 4, state.enemyHp + 8);
  state.enemyMaxHp = Math.max(state.enemyMaxHp, state.enemyHp);
  state.enemyAttack = 5 + state.round;
  if (state.round >= 6) {
    showGameOver(true);
    return;
  }
  showScreen("gameScreen");
  startRound();
}

function showGameOver(win) {
  showScreen("gameOverScreen");
  $("resultTitle").textContent = win ? "🏆 던전 클리어!" : "💀 쓰러졌습니다";
  $("resultText").textContent = win
    ? `5라운드까지 버텼습니다. 최종 덱은 ${state.deck.length}장입니다.`
    : `라운드 ${state.round}에서 쓰러졌습니다. 다시 도전해보세요.`;
}

function showScreen(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.add("hidden"));
  $(id).classList.remove("hidden");
}

function log(text) {
  const el = $("battleLog");
  if (!el) return;
  el.textContent = text;
}

function render() {
  $("playerHp").textContent = state.hp;
  $("block").textContent = state.block;
  $("resources").textContent = state.resources;
  $("round").textContent = state.round;
  $("enemyHp").textContent = state.enemyHp;
  $("enemyIntent").textContent = state.enemyAttack;
  $("handCount").textContent = `${state.hand.length}장`;
  $("hand").innerHTML = "";

  state.hand.forEach((card, i) => {
    const btn = document.createElement("button");
    btn.className = `card ${card.type}`;
    btn.innerHTML = `
      <div class="card-name">${card.type === "attack" ? "⚔️" : "💰"} ${card.name}</div>
      <div class="card-cost">${card.type === "attack" ? "방어 행동" : "자원 획득"}</div>
      <div class="card-desc">${card.desc}</div>
    `;
    btn.addEventListener("click", () => playCard(i));
    $("hand").appendChild(btn);
  });
}

function renderShop() {
  $("shopSummary").textContent = `이번 라운드 획득 자원: 💰 ${state.resources} · 구매하지 않은 자원은 다음 라운드에 이월되지 않습니다.`;
  $("shopCards").innerHTML = "";
  state.shopOffers.forEach((card, i) => {
    const box = document.createElement("div");
    box.className = "shop-card";
    box.innerHTML = `
      <div class="card-name">${card.type === "attack" ? "⚔️" : "💰"} ${card.name}</div>
      <div class="card-cost">구매 비용 💰 ${card.price}</div>
      <div class="card-desc">${card.desc}</div>
    `;
    const b = document.createElement("button");
    b.textContent = card.bought ? "구매 완료" : `💰 ${card.price}에 구매`;
    b.disabled = card.bought || state.resources < card.price;
    b.addEventListener("click", () => buyCard(i));
    box.appendChild(b);
    $("shopCards").appendChild(box);
  });
}

function renderDeckChoices() {
  $("deckChoices").innerHTML = "";
  DECKS.forEach(deck => {
    const btn = document.createElement("button");
    btn.className = "deck-card";
    btn.innerHTML = `
      <h3>${deck.name}</h3>
      <p>${deck.desc}</p>
      <div class="deck-list">${deck.cards.map(c => `${c.type === "attack" ? "⚔️" : "💰"} ${c.name}`).join("<br>")}</div>
    `;
    btn.addEventListener("click", () => startGame(deck.id));
    $("deckChoices").appendChild(btn);
  });
}

$("endTurnBtn").addEventListener("click", endTurn);
$("nextRoundBtn").addEventListener("click", nextRound);
$("restartBtn").addEventListener("click", () => showScreen("deckSelectScreen"));
$("restartBtn2").addEventListener("click", () => showScreen("deckSelectScreen"));

renderDeckChoices();
