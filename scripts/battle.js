// 仮の敵データ
const enemies = [
    {
        id: 'enemy01', name: 'スライム', image: 'images/enemy01.png',
        status: { hp: 120, mp: 0, atk: 20, def: 15, matk: 0, mdef: 10, spd: 20 }
    },
    {
        id: 'enemy02', name: 'ゴブリン', image: 'images/enemy02.png',
        status: { hp: 180, mp: 10, atk: 35, def: 25, matk: 5, mdef: 15, spd: 35 }
    },
    {
        id: 'enemy03', name: 'オーク', image: 'images/enemy03.png',
        status: { hp: 250, mp: 15, atk: 50, def: 40, matk: 10, mdef: 20, spd: 25 }
    },
    {
        id: 'enemy04', name: 'スケルトン', image: 'images/enemy04.png',
        status: { hp: 150, mp: 5, atk: 30, def: 20, matk: 5, mdef: 10, spd: 45 }
    },
];

const enemyPartyEl = document.getElementById('enemy-party');
const playerPartyEl = document.getElementById('player-party');
const messageLogEl = document.getElementById('message-log');
const commandAreaEl = document.getElementById('command-area');

let activePlayerIndex = 0;

// コマンドメニューのテンプレートを生成
function createCommandMenu() {
    return `
        <div class="commands">
            <button class="command-button action-attack">こうげき</button>
            <button class="command-button action-skill">とくぎ</button>
            <div class="skill-menu hidden"></div>
            <button class="command-button action-special hidden">ひっさつ</button>
            <button class="command-button action-defend">ぼうぎょ</button>
        </div>
    `;
}

// 戦闘画面を描画する関数
function renderBattle() {
    // 敵パーティーの描画
    enemyPartyEl.innerHTML = '';
    enemies.forEach(enemy => {
        const enemyDiv = document.createElement('div');
        enemyDiv.className = 'enemy-character';
        enemyDiv.innerHTML = `
            <img src="${enemy.image}" alt="${enemy.name}">
            <p>${enemy.name}</p>
            <div class="hp-bar"><div class="hp-bar-fill" style="width: 100%;"></div></div>
        `;
        enemyPartyEl.appendChild(enemyDiv);
    });

    // 味方パーティーの描画（パーティー編成画面で選んだキャラクターを反映）
    playerPartyEl.innerHTML = '';
    const partyMembers = window.getSelectedParty();
    partyMembers.forEach(player => {
        const playerDiv = document.createElement('div');
        playerDiv.className = 'player-character';
        playerDiv.dataset.charId = player.id;
        playerDiv.innerHTML = `
            <img src="${player.image}" alt="${player.name}">
            <p>${player.name}</p>
            <div class="hp-bar"><div class="hp-bar-fill" style="width: 100%;"></div></div>
            <div class="mp-bar"><div class="mp-bar-fill" style="width: 100%;"></div></div>
        `;
        playerPartyEl.appendChild(playerDiv);
    });

    // コマンドエリアを初期化
    commandAreaEl.innerHTML = createCommandMenu();
}

// 戦闘開始メッセージをログに追加
function logMessage(message) {
    const p = document.createElement('p');
    p.textContent = message;
    messageLogEl.appendChild(p);
    messageLogEl.scrollTop = messageLogEl.scrollHeight;
}

// 戦闘ロジックの開始
function startBattle() {
    logMessage('戦闘開始！');
    // 最初のキャラクターにコマンド選択を促す
    selectCommand(0);
}

// キャラクターにコマンド選択を促す関数
function selectCommand(playerIndex) {
    const players = document.querySelectorAll('.player-character');
    const partyMembers = window.getSelectedParty();

    // 以前に選択されていたキャラクターの強調を解除
    players.forEach(p => p.classList.remove('active'));

    // 現在行動するキャラクターを強調表示
    players[playerIndex].classList.add('active');

    // コマンドメニューを表示
    commandAreaEl.classList.remove('hidden');

    // 特技と必殺技のメニューを更新
    updateCommandMenu(partyMembers[playerIndex]);
}

// コマンドメニューの更新（特技と必殺技の表示・非表示を制御）
function updateCommandMenu(player) {
    const skillMenuEl = commandAreaEl.querySelector('.skill-menu');
    const specialButtonEl = commandAreaEl.querySelector('.action-special');

    // 特技の動的生成
    skillMenuEl.innerHTML = player.active.map(skill => {
        return `<button class="skill-button">${skill.name}</button>`;
    }).join('');

    // 必殺技の条件判定（例: MPが50以上の場合）
    if (player.status.mp >= 50) {
        specialButtonEl.classList.remove('hidden');
    } else {
        specialButtonEl.classList.add('hidden');
    }
}

// コマンドのイベントリスナー
commandAreaEl.addEventListener('click', (event) => {
    const target = event.target;
    if (target.classList.contains('action-skill')) {
        const skillMenuEl = commandAreaEl.querySelector('.skill-menu');
        skillMenuEl.classList.toggle('hidden');
    }
    // ここに他のコマンド（こうげき、ぼうぎょなど）のロジックを追加
    // 例:
    // if (target.classList.contains('action-attack')) {
    //   logMessage(`${window.getSelectedParty()[activePlayerIndex].name}のこうげき！`);
    //   // 次のキャラクターへ
    //   activePlayerIndex = (activePlayerIndex + 1) % window.getSelectedParty().length;
    //   selectCommand(activePlayerIndex);
    // }
});

// グローバルスコープに公開
window.startBattle = startBattle;
window.renderBattle = renderBattle;