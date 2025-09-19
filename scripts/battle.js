import { enemyData, enemyGroups } from './enemies.js';

const enemyPartyEl = document.getElementById('enemy-party');
const playerPartyEl = document.getElementById('player-party');
const messageLogEl = document.getElementById('message-log');
const commandAreaEl = document.getElementById('command-area');
const battleScreenEl = document.getElementById('battle-screen');
const goButton = document.getElementById('go-button');
const partyScreen = document.getElementById('party-screen');

let currentEnemies;
let currentPlayerParty;
let activePlayerIndex = 0;
let currentGroupIndex = 0;

// ダメージ計算関数
function calculateDamage(attacker, defender, isMagic = false) {
    // 回避判定
    if (Math.random() < defender.status.dodgeRate) {
        logMessage(`${defender.name}は攻撃を回避した！`);
        return 0;
    }

    let damage;
    if (isMagic) {
        damage = Math.max(1, attacker.status.matk - Math.floor(defender.status.mdef / 2));
    } else {
        damage = Math.max(1, attacker.status.atk - Math.floor(defender.status.def / 2));
    }

    // 会心判定
    if (Math.random() < attacker.status.criticalRate) {
        damage = Math.floor(damage * attacker.status.criticalMultiplier);
        logMessage(`会心の一撃！`);
    }

    logMessage(`${attacker.name}の攻撃！${defender.name}に${damage}のダメージ！`);
    return damage;
}

// 敵キャラクターの更新
function updateEnemyDisplay() {
    currentEnemies.forEach((enemy, index) => {
        const enemyEl = enemyPartyEl.children[index];
        const hpFill = enemyEl.querySelector('.hp-bar-fill');
        const hpPercentage = (enemy.status.hp / enemy.status.maxHp) * 100;
        hpFill.style.width = `${hpPercentage}%`;

        const hpText = enemyEl.querySelector('.hp-text');
        if (hpText) {
            hpText.textContent = `${enemy.status.hp}/${enemy.status.maxHp}`;
        }

        if (enemy.status.hp <= 0) {
            enemyEl.classList.add('fainted');
        }
    });
}

// 味方キャラクターの更新
function updatePlayerDisplay() {
    currentPlayerParty.forEach((player, index) => {
        const playerEl = playerPartyEl.children[index];
        const hpFill = playerEl.querySelector('.hp-bar-fill');
        const mpFill = playerEl.querySelector('.mp-bar-fill');

        const hpPercentage = (player.status.hp / player.status.maxHp) * 100;
        const mpPercentage = (player.status.mp / player.status.maxMp) * 100;

        hpFill.style.width = `${hpPercentage}%`;
        mpFill.style.width = `${mpPercentage}%`;

        const hpText = playerEl.querySelector('.hp-text');
        const mpText = playerEl.querySelector('.mp-text');
        if (hpText) {
            hpText.textContent = `${player.status.hp}/${player.status.maxHp}`;
        }
        if (mpText) {
            mpText.textContent = `${player.status.mp}/${player.status.maxMp}`;
        }

        if (player.status.hp <= 0) {
            playerEl.classList.add('fainted');
        }
    });
}

// 戦闘ロジックの開始
async function startBattle() {
    logMessage('戦闘開始！');
    currentPlayerParty = window.getSelectedParty();
    currentGroupIndex = 0;

    // 最初の敵グループを設定
    await startNextGroup();
}

// 次の敵グループとの戦闘を開始する
async function startNextGroup() {
    if (currentGroupIndex >= enemyGroups.length) {
        // すべてのグループをクリア
        handleGameWin();
        return;
    }

    const group = enemyGroups[currentGroupIndex];
    logMessage(`${group.name}との戦闘！`);

    // グループの敵データを読み込み
    currentEnemies = group.enemies.map(enemyId => {
        const enemy = enemyData.find(e => e.id === enemyId);
        // ステータスをコピーして新たな敵を作成
        return { ...enemy, status: { ...enemy.status } };
    });

    renderBattle(); // 敵パーティーを再描画
    await battleLoop();
}

// 戦闘ループ
async function battleLoop() {
    while (true) {
        // 味方ターンの処理
        for (let i = 0; i < currentPlayerParty.length; i++) {
            activePlayerIndex = i;
            if (currentPlayerParty[i].status.hp > 0) {
                await playerTurn(currentPlayerParty[i]);
            }
            if (isBattleOver()) break;
        }
        if (isBattleOver()) break;

        // 敵ターンの処理
        for (const enemy of currentEnemies) {
            if (enemy.status.hp > 0) {
                await enemyTurn(enemy);
            }
            if (isBattleOver()) break;
        }
        if (isBattleOver()) break;
    }

    // 戦闘終了
    handleBattleEnd();
}

// 味方ターンの処理
function playerTurn(player) {
    return new Promise(resolve => {
        logMessage(`${player.name}のターン！`);
        selectCommand(activePlayerIndex);

        commandAreaEl.onclick = async (event) => {
            const target = event.target;
            let actionTaken = false;

            if (target.classList.contains('action-attack')) {
                // 攻撃対象を選択
                logMessage('攻撃する敵を選択してください。');
                const enemySelection = await selectEnemyTarget();
                if (enemySelection) {
                    performAttack(player, enemySelection);
                    actionTaken = true;
                }
            } else if (target.classList.contains('action-skill')) {
                const skillMenuEl = commandAreaEl.querySelector('.skill-menu');
                skillMenuEl.classList.toggle('hidden');
            } else if (target.classList.contains('skill-button')) {
                const skillName = target.textContent;
                const skill = player.active.find(s => s.name === skillName);
                if (skill) {
                    logMessage(`${player.name}は${skill.name}を使った！`);
                    // スキルの効果をここで実行
                    if (skill.name === 'ヒールライト') {
                        const targetPlayer = await selectPlayerTarget();
                        if (targetPlayer) {
                            performHeal(player, targetPlayer);
                            actionTaken = true;
                        }
                    } else if (skill.name === '連撃') {
                        const targetEnemy = await selectEnemyTarget();
                        if (targetEnemy) {
                            performMultiAttack(player, targetEnemy);
                            actionTaken = true;
                        }
                    } else if (skill.name === 'なぎ払い' || skill.name === 'ブリザード') {
                        performAreaAttack(player, currentEnemies);
                        actionTaken = true;
                    } else {
                        logMessage('このスキルはまだ実装されていません。');
                    }
                }
            } else if (target.classList.contains('action-defend')) {
                logMessage(`${player.name}は防御した。`);
                actionTaken = true;
            }

            if (actionTaken) {
                // ターン終了
                commandAreaEl.classList.add('hidden');
                commandAreaEl.onclick = null;
                resolve();
            }
        };
    });
}

// 敵ターンの処理
function enemyTurn(enemy) {
    return new Promise(resolve => {
        setTimeout(() => {
            logMessage(`${enemy.name}のターン！`);
            const alivePlayers = currentPlayerParty.filter(p => p.status.hp > 0);
            if (alivePlayers.length > 0) {
                const targetPlayer = alivePlayers[Math.floor(Math.random() * alivePlayers.length)];
                // 敵の行動（ここではシンプルに物理攻撃）
                const damage = calculateDamage(enemy, targetPlayer);
                targetPlayer.status.hp = Math.max(0, targetPlayer.status.hp - damage);
                updatePlayerDisplay();
            }
            resolve();
        }, 1000); // 1秒待機
    });
}

// ターゲット選択ロジック（敵）
function selectEnemyTarget() {
    return new Promise(resolve => {
        const enemyEls = document.querySelectorAll('.enemy-character');
        enemyEls.forEach((el, index) => {
            if (currentEnemies[index].status.hp > 0) {
                el.classList.add('selectable');
                el.onclick = () => {
                    enemyEls.forEach(e => e.classList.remove('selectable'));
                    resolve(currentEnemies[index]);
                };
            }
        });
    });
}

// ターゲット選択ロジック（味方）
function selectPlayerTarget() {
    return new Promise(resolve => {
        const playerEls = document.querySelectorAll('.player-character');
        playerEls.forEach((el, index) => {
            if (currentPlayerParty[index].status.hp > 0) {
                el.classList.add('selectable');
                el.onclick = () => {
                    playerEls.forEach(e => e.classList.remove('selectable'));
                    resolve(currentPlayerParty[index]);
                };
            }
        });
    });
}

// 攻撃アクション
function performAttack(attacker, target) {
    const damage = calculateDamage(attacker, target, attacker.attackType === 'magic');
    target.status.hp = Math.max(0, target.status.hp - damage);
    updateEnemyDisplay();
}

// 複数回攻撃アクション
function performMultiAttack(attacker, target) {
    const attacks = 3;
    for (let i = 0; i < attacks; i++) {
        const damage = calculateDamage(attacker, target, attacker.attackType === 'magic');
        target.status.hp = Math.max(0, target.status.hp - damage);
        if (target.status.hp <= 0) break;
    }
    updateEnemyDisplay();
}

// 全体攻撃アクション
function performAreaAttack(attacker, targets) {
    targets.forEach(target => {
        if (target.status.hp > 0) {
            const damage = calculateDamage(attacker, target, attacker.attackType === 'magic');
            target.status.hp = Math.max(0, target.status.hp - damage);
        }
    });
    updateEnemyDisplay();
}

// 回復アクション
function performHeal(healer, target) {
    const healAmount = healer.status.support * 2;
    logMessage(`${healer.name}は${target.name}を${healAmount}回復した。`);
    target.status.hp = Math.min(target.status.maxHp, target.status.hp + healAmount);
    updatePlayerDisplay();
}

// 戦闘終了判定
function isBattleOver() {
    const playersAlive = currentPlayerParty.some(p => p.status.hp > 0);
    const enemiesAlive = currentEnemies.some(e => e.status.hp > 0);
    return !playersAlive || !enemiesAlive;
}

// 敵グループ戦闘終了後の処理
function handleBattleEnd() {
    const playersAlive = currentPlayerParty.some(p => p.status.hp > 0);
    if (playersAlive) {
        logMessage('敵グループを撃破しました！');
        currentGroupIndex++;
        // プレイヤーのHPとMPを回復
        currentPlayerParty.forEach(p => {
            p.status.hp = p.status.maxHp;
            p.status.mp = p.status.maxMp;
        });
        updatePlayerDisplay();

        // 次の戦闘に進むか、全クリか
        if (currentGroupIndex < enemyGroups.length) {
            logMessage('次の敵グループに挑みます...');
            setTimeout(() => {
                startNextGroup();
            }, 2000); // 2秒後に次の戦闘開始
        } else {
            handleGameWin();
        }
    } else {
        logMessage('全滅しました... ゲームオーバー');
        handleGameOver();
    }
}

// ゲーム勝利処理
function handleGameWin() {
    logMessage('すべての敵を倒しました！');
    logMessage('ゲームクリア！おめでとうございます！');
    commandAreaEl.innerHTML = '';
    goButton.disabled = false;
    battleScreenEl.classList.add('hidden');
    partyScreen.classList.remove('hidden');
}

// ゲームオーバー処理
function handleGameOver() {
    commandAreaEl.innerHTML = '';
    goButton.disabled = false;
    battleScreenEl.classList.add('hidden');
    partyScreen.classList.remove('hidden');
}

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
    currentEnemies.forEach(enemy => { // 変更：currentEnemiesを使用
        const enemyDiv = document.createElement('div');
        enemyDiv.className = 'enemy-character';
        enemyDiv.innerHTML = `
            <img src="${enemy.image}" alt="${enemy.name}">
            <p>${enemy.name}</p>
            <div class="hp-bar"><div class="hp-bar-fill" style="width: 100%;"></div></div>
            <p class="hp-text">${enemy.status.hp}/${enemy.status.maxHp}</p>
        `;
        enemyPartyEl.appendChild(enemyDiv);
    });

    // 味方パーティーの描画（パーティー編成画面で選んだキャラクターを反映）
    playerPartyEl.innerHTML = '';
    currentPlayerParty.forEach(player => { // 変更：currentPlayerPartyを使用
        const playerDiv = document.createElement('div');
        playerDiv.className = 'player-character';
        playerDiv.dataset.charId = player.id;
        playerDiv.innerHTML = `
            <img src="${player.image}" alt="${player.name}">
            <p>${player.name}</p>
            <div class="hp-bar"><div class="hp-bar-fill" style="width: 100%;"></div></div>
            <p class="hp-text">${player.status.hp}/${player.status.maxHp}</p>
            <div class="mp-bar"><div class="mp-bar-fill" style="width: 100%;"></div></div>
            <p class="mp-text">${player.status.mp}/${player.status.maxMp}</p>
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

// キャラクターにコマンド選択を促す関数
function selectCommand(playerIndex) {
    const players = document.querySelectorAll('.player-character');
    const partyMembers = window.getSelectedParty();

    players.forEach(p => p.classList.remove('active'));
    players[playerIndex].classList.add('active');
    commandAreaEl.classList.remove('hidden');

    updateCommandMenu(partyMembers[playerIndex]);
}

// コマンドメニューの更新（特技と必殺技の表示・非表示を制御）
function updateCommandMenu(player) {
    const skillMenuEl = commandAreaEl.querySelector('.skill-menu');
    const specialButtonEl = commandAreaEl.querySelector('.action-special');

    skillMenuEl.innerHTML = player.active.map(skill => {
        return `<button class="skill-button">${skill.name}</button>`;
    }).join('');

    if (player.special.condition(player)) {
        specialButtonEl.classList.remove('hidden');
    } else {
        specialButtonEl.classList.add('hidden');
    }
}

// グローバルスコープに公開
window.startBattle = startBattle;
window.renderBattle = renderBattle;