"use strict";

// ==================== 広告設定（アフィリエイトバナー） ====================
// ASP（A8.net / もしもアフィリエイト / 楽天アフィリエイト等）で発行した
// バナータグをこの配列に貼ると、リザルト画面の下部にだけ表示されます。
// 複数登録するとリザルト表示のたびにランダムで1つローテーション表示。
// 空のままなら広告枠ごと非表示。プレイ中の画面には一切広告を出さない方針。
//
// 貼り方の例（ASPの管理画面からコピーしたタグをそのまま1要素として追加）:
//   `<a href="https://px.a8.net/svt/ejp?a8mat=XXXX" rel="nofollow sponsored">
//      <img src="https://www21.a8.net/svt/bgt?aid=XXXX" width="320" height="50" alt=""></a>`,
const AD_BANNERS = [
];

// ==================== 定数 ====================
const REAL_WORD = "カメルーン";

// 偽物プール（すべて5文字でそろえて長さで見分けられないように）
const FAKES_EASY = [
  "カメレオン", "メカルーン", "ルーンカメ", "カメループ",
  "カルメーン", "カメルーナ", "カメルーノ", "カメンルー",
];
const FAKES_MID = [
  "カメルンー", "カメールン", "カメウーン", "カメルーヌ",
  "カヌルーン", "ガメルーン", "カメルーム", "カメリーン",
];
// 文字トラップ（力=漢字のちから、一=漢数字のいち、ソ/ン）
const FAKES_HARD = [
  "カメルーソ", "力メルーン", "カメル一ン",
];

const PRAISES = [
  "めっちゃカメルーン！", "完全にカメルーン", "それだ！",
  "ヤウンデ！", "ドゥアラ！", "アフリカの雄！",
];

// 国旗定義: stripes = 縦3色, star = { band: 星のある帯(0-2), color }
const REAL_FLAG = {
  stripes: ["#007a5e", "#ce1126", "#fcd116"],
  star: { band: 1, color: "#fcd116" },
};
const FAKE_FLAGS = [
  // セネガル
  { stripes: ["#00853f", "#fdef42", "#e31b23"], star: { band: 1, color: "#00853f" } },
  // マリ
  { stripes: ["#14b53a", "#fcd116", "#ce1126"], star: null },
  // ギニア
  { stripes: ["#ce1126", "#fcd116", "#009460"], star: null },
  // 偽カメルーン: 星なし
  { stripes: ["#007a5e", "#ce1126", "#fcd116"], star: null },
  // 偽カメルーン: 星が左の帯
  { stripes: ["#007a5e", "#ce1126", "#fcd116"], star: { band: 0, color: "#fcd116" } },
  // 偽カメルーン: 星が右の帯
  { stripes: ["#007a5e", "#ce1126", "#fcd116"], star: { band: 2, color: "#ce1126" } },
  // 偽カメルーン: 帯が逆順
  { stripes: ["#fcd116", "#ce1126", "#007a5e"], star: { band: 1, color: "#fcd116" } },
];

// 国土シルエット（実際の国境GeoJSONから生成、100x100正規化）
const SHAPE_CMR =
  "M56.8 91.5 L55.8 91.1 L50.9 92.2 L45.9 91.0 L41.9 91.6 L28.5 91.4 L29.7 84.9 L26.5 79.4 L22.7 78.0 L21.0 74.3 L18.9 73.1 L19.0 70.8 L21.1 65.0 L25.1 57.0 L27.5 56.9 L32.4 52.1 L35.5 52.0 L40.1 55.4 L45.8 52.6 L46.6 49.1 L48.5 45.8 L49.7 41.6 L54.2 38.2 L55.8 32.4 L57.6 30.6 L58.7 26.3 L60.9 21.0 L67.9 14.6 L68.3 11.9 L69.2 10.4 L66.0 7.1 L66.2 4.5 L68.6 4.0 L71.8 9.3 L72.4 14.8 L72.1 20.3 L76.6 27.8 L72.0 27.7 L69.6 28.3 L65.9 27.5 L64.1 31.4 L69.0 36.2 L72.6 37.6 L73.7 41.0 L76.3 46.7 L75.0 48.9 L70.9 57.3 L68.9 58.8 L68.3 65.2 L69.1 68.7 L68.4 71.2 L72.3 75.5 L73.0 78.4 L76.1 82.7 L79.9 85.4 L80.2 89.1 L81.1 91.5 L80.5 96.0 L73.9 94.0 L67.2 91.9 L56.8 91.5 Z";
const SHAPE_NGA =
  "M49.0 83.1 L40.9 85.9 L38.0 85.5 L35.0 87.3 L28.8 87.1 L24.7 82.2 L22.1 76.6 L16.6 71.5 L10.8 71.6 L4 71.6 L4.4 59.2 L4.2 54.2 L5.7 49.3 L8.1 47.0 L11.8 42.2 L11.0 40.1 L12.6 37.0 L10.8 32.4 L11.1 29.8 L11.7 22.9 L13.9 19.8 L15.0 15.3 L17.0 13.7 L25.3 12.7 L33.1 15.6 L36.0 18.6 L39.9 18.7 L43.6 16.8 L52.9 20.8 L56.9 20.6 L61.5 17.3 L66.0 17.5 L68.2 16.5 L72.4 16.9 L78.4 19.2 L84.4 14.8 L86.3 15.1 L91.5 23.6 L92.9 23.4 L96.0 26.5 L95.2 27.9 L94.7 30.5 L88.2 36.5 L86.2 41.4 L85.1 45.5 L83.4 47.2 L81.9 52.6 L77.7 55.8 L76.5 59.7 L74.8 62.8 L74.1 66.0 L68.8 68.6 L64.4 65.5 L61.5 65.6 L56.9 70.1 L54.6 70.2 L51.0 77.7 L49.0 83.1 Z";
const SHAPE_TCD =
  "M25.7 64.7 L26.3 62.0 L22.6 61.9 L22.6 58.2 L20.2 56.0 L22.7 48.5 L30.1 43.0 L30.4 35.5 L32.6 23.9 L33.8 21.4 L31.4 19.4 L31.3 17.6 L29.2 16.1 L27.8 7.1 L33.6 4 L56.5 15.0 L79.5 26.0 L79.8 48.9 L74.8 48.5 L72.2 52.7 L70.7 56.3 L71.9 57.6 L70.0 59.4 L70.6 61.8 L69.1 64.2 L68.5 66.3 L70.6 65.9 L71.8 68.2 L71.8 71.5 L74.0 73.2 L73.9 74.6 L70.2 75.6 L67.3 77.9 L63.2 84.2 L57.7 86.8 L52.2 86.5 L50.6 87.0 L51.1 89.0 L48.1 91.1 L45.7 93.3 L38.4 95.5 L37.0 94.2 L36.1 94.1 L35.0 95.6 L30.2 96.0 L31.1 94.4 L29.3 90.5 L28.5 88.1 L26.0 87.1 L22.6 83.8 L23.9 81.0 L26.5 81.6 L28.1 81.2 L31.3 81.3 L28.2 76.0 L28.4 72.2 L28.0 68.4 L25.7 64.7 Z";
const SHAPE_CAF =
  "M9.8 44.9 L15.7 44.4 L17.0 42.5 L18.2 42.7 L20.0 44.3 L29.0 41.6 L32.0 38.8 L35.7 36.3 L35.0 33.8 L37.0 33.1 L43.9 33.6 L50.6 30.3 L55.7 22.5 L59.4 19.6 L63.9 18.4 L64.7 21.4 L68.8 25.9 L68.8 28.8 L67.7 31.8 L68.1 34.0 L70.6 36.0 L76.0 39.1 L79.9 42.0 L80.0 44.3 L84.8 48.0 L87.7 51.1 L89.5 55.4 L94.9 58.2 L96.0 60.5 L93.6 61.2 L89.1 61.1 L83.7 60.3 L81.1 60.9 L80.0 62.7 L77.7 62.9 L74.9 61.4 L67.0 64.9 L63.7 64.2 L62.7 64.8 L60.6 69.1 L55.3 67.7 L50.1 67.0 L45.5 64.3 L39.7 61.9 L35.9 64.2 L33.1 67.8 L32.4 72.8 L27.9 72.4 L23.0 71.2 L18.8 75.0 L15.1 81.6 L14.3 79.5 L14.0 76.3 L10.7 74.0 L8.1 70.3 L7.5 67.8 L4.1 64.1 L4.7 61.9 L4 58.9 L4.5 53.4 L6.3 52.1 L9.8 44.9 Z";
const SHAPE_COG =
  "M31.3 93.3 L27.4 89.7 L24.2 91.5 L20.0 96.0 L11.4 84.9 L19.4 79.1 L15.4 72.2 L19.0 69.5 L26.1 68.2 L26.9 63.6 L32.5 68.6 L41.8 69.1 L45.0 64.1 L46.3 57.1 L45.2 48.9 L40.2 42.7 L44.8 30.6 L42.2 28.5 L34.4 29.3 L31.4 23.9 L32.2 19.3 L45.4 19.7 L53.9 22.5 L62.3 25.0 L63.0 19.3 L68.5 9.6 L74.8 4 L81.9 5.8 L88.6 6.3 L88.0 12.7 L84.9 18.3 L82.8 24.8 L81.5 34.1 L82.0 40.1 L80.3 43.7 L80.1 47.6 L78.9 50.9 L72.0 56.0 L67.1 61.4 L62.6 71.6 L62.9 80.2 L60.3 83.6 L54.2 88.7 L48.0 95.3 L44.1 93.4 L43.4 90.5 L37.7 90.4 L34.1 94.4 L31.3 93.3 Z";

// 偽シルエット: 鏡像・回転カメルーン ＋ 近隣国（実際の形）
const REAL_SHAPE = { path: SHAPE_CMR, transform: "" };
const FAKE_SHAPES = [
  { path: SHAPE_CMR, transform: "translate(100 0) scale(-1 1)" },   // 左右反転
  { path: SHAPE_CMR, transform: "translate(0 100) scale(1 -1)" },   // 上下反転
  { path: SHAPE_CMR, transform: "rotate(90 50 50)" },
  { path: SHAPE_CMR, transform: "rotate(180 50 50)" },
  { path: SHAPE_CMR, transform: "rotate(-90 50 50)" },
  { path: SHAPE_NGA, transform: "" },                               // ナイジェリア
  { path: SHAPE_TCD, transform: "" },                               // チャド
  { path: SHAPE_CAF, transform: "" },                               // 中央アフリカ
  { path: SHAPE_COG, transform: "" },                               // コンゴ共和国
  { path: SHAPE_NGA, transform: "translate(100 0) scale(-1 1)" },
  { path: SHAPE_TCD, transform: "rotate(180 50 50)" },
];

const PROMPTS = {
  word: "本物の「カメルーン」をタップ！",
  flag: "本物のカメルーン国旗をタップ！",
  shape: "本物のカメルーンの形をタップ！",
};

const START_TIME = 20;      // 秒
const TIME_BONUS = 1.2;     // 正解で回復
const TIME_PENALTY = 2.5;   // 誤タップで減少
const MAX_TIME = 25;
const BEST_KEY = "mecchaCameroonBest";

const RANKS = [
  [0, "カメルーン、どこ…"],
  [1, "カメルーン見習い"],
  [4, "カメルーン初段"],
  [8, "カメルーン通"],
  [13, "カメルーンマスター"],
  [18, "カメルーン大使"],
  [25, "めっちゃカメルーン"],
];

// ==================== 状態 ====================
let score = 0;
let timeLeft = START_TIME;
let round = 0;
let playing = false;
let roundLocked = false;
let lastTick = 0;

// ==================== DOM ====================
const $ = (id) => document.getElementById(id);
const screens = {
  title: $("screen-title"),
  game: $("screen-game"),
  result: $("screen-result"),
};
const gridEl = $("grid");
const scoreEl = $("score");
const timerFillEl = $("timer-fill");
const praiseEl = $("praise");

function showScreen(name) {
  Object.values(screens).forEach((s) => s.classList.remove("active"));
  screens[name].classList.add("active");
}

// ==================== サウンド（WebAudio、素材不要） ====================
let audioCtx = null;

function ensureAudio() {
  if (!audioCtx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (AC) audioCtx = new AC();
  }
  if (audioCtx && audioCtx.state === "suspended") audioCtx.resume();
}

function beep(freq, endFreq, duration, type, volume) {
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  const now = audioCtx.currentTime;
  osc.type = type;
  osc.frequency.setValueAtTime(freq, now);
  osc.frequency.exponentialRampToValueAtTime(endFreq, now + duration);
  gain.gain.setValueAtTime(volume, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
  osc.connect(gain).connect(audioCtx.destination);
  osc.start(now);
  osc.stop(now + duration);
}

const soundCorrect = () => beep(660, 1320, 0.15, "square", 0.08);
const soundWrong = () => beep(220, 90, 0.25, "sawtooth", 0.1);
const soundEnd = () => beep(440, 110, 0.5, "triangle", 0.1);

// ==================== ユーティリティ ====================
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ==================== ラウンド生成 ====================
function gridCols(r) {
  if (r <= 1) return 2;
  if (r <= 3) return 3;
  if (r <= 7) return 4;
  return 5;
}

// 3の倍数ラウンドはビジュアル問題（国旗と国土を交互に）
function roundType(r) {
  if (r < 3 || r % 3 !== 0) return "word";
  return (r / 3) % 2 === 1 ? "flag" : "shape";
}

function fakeWordPool(r) {
  if (r <= 2) return FAKES_EASY;
  if (r <= 5) return [...FAKES_EASY, ...FAKES_MID];
  if (r <= 8) return [...FAKES_MID, ...FAKES_HARD];
  return [...FAKES_MID, ...FAKES_HARD, ...FAKES_HARD]; // トラップ率アップ
}

function flagHTML(flag) {
  const bands = flag.stripes
    .map((color, i) => {
      const star =
        flag.star && flag.star.band === i
          ? `<i class="star" style="color:${flag.star.color}">★</i>`
          : "";
      return `<span class="band" style="background:${color}">${star}</span>`;
    })
    .join("");
  return `<div class="flag">${bands}</div>`;
}

function shapeHTML(shape) {
  return (
    `<svg viewBox="0 0 100 100" aria-hidden="true">` +
    `<path d="${shape.path}"${shape.transform ? ` transform="${shape.transform}"` : ""}` +
    ` fill="#2fbf94"/></svg>`
  );
}

function buildRound() {
  round++;
  roundLocked = false;
  const cols = gridCols(round);
  const count = cols * cols;
  const type = roundType(round);
  const realIndex = Math.floor(Math.random() * count);

  $("prompt").textContent = PROMPTS[type];
  gridEl.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
  gridEl.style.setProperty("--tile-font", `${Math.max(11, 24 - cols * 2.6)}px`);
  gridEl.innerHTML = "";

  const pool = fakeWordPool(round);
  for (let i = 0; i < count; i++) {
    const tile = document.createElement("button");
    tile.className = "tile";
    tile.type = "button";
    const isReal = i === realIndex;
    if (type === "flag") {
      tile.classList.add("flag-tile");
      tile.innerHTML = flagHTML(isReal ? REAL_FLAG : pick(FAKE_FLAGS));
    } else if (type === "shape") {
      tile.classList.add("shape-tile");
      tile.innerHTML = shapeHTML(isReal ? REAL_SHAPE : pick(FAKE_SHAPES));
    } else {
      tile.textContent = isReal ? REAL_WORD : pick(pool);
    }
    tile.addEventListener("pointerdown", () => onTap(tile, isReal), { passive: true });
    gridEl.appendChild(tile);
  }
}

// ==================== タップ処理 ====================
function onTap(tile, isReal) {
  if (!playing || roundLocked) return;
  if (isReal) {
    roundLocked = true;
    score++;
    scoreEl.textContent = score;
    timeLeft = Math.min(MAX_TIME, timeLeft + TIME_BONUS);
    tile.classList.add("correct");
    soundCorrect();
    showPraise();
    setTimeout(() => {
      if (playing) buildRound();
    }, 220);
  } else {
    timeLeft -= TIME_PENALTY;
    tile.classList.add("wrong");
    soundWrong();
    gridEl.classList.remove("shake");
    void gridEl.offsetWidth; // アニメーション再トリガ
    gridEl.classList.add("shake");
    if (navigator.vibrate) navigator.vibrate(60);
  }
}

function showPraise() {
  praiseEl.textContent = pick(PRAISES);
  praiseEl.classList.remove("show");
  void praiseEl.offsetWidth;
  praiseEl.classList.add("show");
}

// ==================== タイマー ====================
function tick(now) {
  if (!playing) return;
  const dt = (now - lastTick) / 1000;
  lastTick = now;
  timeLeft -= dt;

  const ratio = Math.max(0, timeLeft / MAX_TIME);
  timerFillEl.style.width = `${ratio * 100}%`;
  timerFillEl.classList.toggle("low", timeLeft < 5);

  if (timeLeft <= 0) {
    endGame();
    return;
  }
  requestAnimationFrame(tick);
}

// ==================== ゲーム進行 ====================
function startGame() {
  ensureAudio();
  score = 0;
  round = 0;
  timeLeft = START_TIME;
  scoreEl.textContent = "0";
  showScreen("game");
  buildRound();
  playing = true;
  lastTick = performance.now();
  requestAnimationFrame(tick);
}

function getRank(s) {
  let rank = RANKS[0][1];
  for (const [min, name] of RANKS) {
    if (s >= min) rank = name;
  }
  return rank;
}

// アフィリエイトバナーをリザルト画面の枠に表示（毎回ランダムにローテーション）。
// タグに<script>が含まれる場合も動くよう、script要素は作り直して差し替える。
function loadAd() {
  if (AD_BANNERS.length === 0) return;
  $("ad-slot").hidden = false;
  const content = $("ad-content");
  content.innerHTML = pick(AD_BANNERS);
  content.querySelectorAll("script").forEach((old) => {
    const s = document.createElement("script");
    for (const attr of old.attributes) s.setAttribute(attr.name, attr.value);
    s.textContent = old.textContent;
    old.replaceWith(s);
  });
}

function endGame() {
  playing = false;
  soundEnd();

  const rank = getRank(score);
  $("result-score").textContent = score;
  $("result-rank").textContent = rank;

  const best = Math.max(score, Number(localStorage.getItem(BEST_KEY) || 0));
  localStorage.setItem(BEST_KEY, best);
  $("result-best").textContent = `ベスト記録：${best}個`;

  const shareText =
    score === 0
      ? `「めっちゃカメルーン」でカメルーンを1個も見つけられませんでした…\n称号：${rank}\n#めっちゃカメルーン`
      : `「めっちゃカメルーン」で本物のカメルーンを${score}個発見！\n称号：${rank}\n#めっちゃカメルーン`;
  const url = location.origin + location.pathname;
  $("btn-share").href =
    `https://x.com/intent/post?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(url)}`;

  loadAd();
  showScreen("result");
}

// ==================== 初期化 ====================
$("btn-start").addEventListener("click", startGame);
$("btn-retry").addEventListener("click", startGame);

const savedBest = Number(localStorage.getItem(BEST_KEY) || 0);
if (savedBest > 0) {
  $("title-best").textContent = `ベスト記録：${savedBest}個`;
}
