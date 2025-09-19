// party.js

// 仮のキャラクターデータ
const characters = [
    {
        id: 'char01', name: '剣士ソラ', role: '剣士', image: 'images/char01.png',
        status: { hp: 250, mp: 80, atk: 50, def: 40, matk: 10, mdef: 25, spd: 30 },
        passive: { name: '不屈の魂', desc: 'HPが30%以下になると、物理防御力が2倍になる。' },
        active: [
            { name: '連撃', desc: '敵単体に3回連続の物理攻撃を行う。' },
            { name: 'なぎ払い', desc: '敵全体に物理攻撃を行う。' },
            { name: 'シールドバッシュ', desc: '敵単体に物理攻撃を行い、確率で行動不能にする。' }
        ],
        special: { name: '天空斬り', desc: '空高く舞い上がり、敵全体に強力な物理ダメージを与える。' }
    },
    {
        id: 'char02', name: '魔術師ルナ', role: '魔術師', image: 'images/char02.png',
        status: { hp: 180, mp: 150, atk: 15, def: 20, matk: 60, mdef: 45, spd: 25 },
        passive: { name: 'マナの源泉', desc: 'ターン開始時、MPが少し回復する。' },
        active: [
            { name: 'ファイアボール', desc: '敵単体に炎の魔法攻撃。' },
            { name: 'ブリザード', desc: '敵全体に氷の魔法攻撃。' },
            { name: 'ヒールライト', desc: '味方単体のHPを回復する。' }
        ],
        special: { name: 'メテオストライク', desc: '巨大な隕石を召喚し、敵全体に超大な魔法ダメージを与える。' }
    },
    {
        id: 'char03', name: '僧侶セシル', role: '僧侶', image: 'images/char03.png',
        status: { hp: 200, mp: 120, atk: 20, def: 30, matk: 30, mdef: 50, spd: 35 },
        passive: { name: '聖なる守護', desc: '状態異常にかかりにくくなる。' },
        active: [
            { name: 'ホーリーライト', desc: '味方全体を少し回復する。' },
            { name: 'リザレクション', desc: '戦闘不能の味方をHP50%で復活させる。' },
            { name: 'サイレンス', desc: '敵単体の魔法を封じる。' }
        ],
        special: { name: '奇跡の讃美歌', desc: '味方全体のHPとMPを全回復させる。' }
    },
    {
        id: 'char04', name: '盗賊カイ', role: '盗賊', image: 'images/char04.png',
        status: { hp: 220, mp: 60, atk: 45, def: 25, matk: 5, mdef: 15, spd: 55 },
        passive: { name: '先制攻撃', desc: '戦闘開始時、相手より先に行動しやすい。' },
        active: [
            { name: '二連斬り', desc: '敵単体に2回連続で物理攻撃を行う。' },
            { name: '煙幕', desc: '敵全体の命中率を低下させる。' },
            { name: 'ぶんどる', desc: '敵からアイテムを盗む。' }
        ],
        special: { name: '影渡り', desc: '姿を消し、敵単体に致命的な一撃を与える。' }
    }
];

let selectedCharacterId = null;
let partyMembers = [];

const characterListEl = document.getElementById('character-list');
const characterDetailsEl = document.getElementById('details-content');
const partySlotsEl = document.querySelector('.party-slots');

// キャラクターカードの描画
function renderCharacterCards() {
    characterListEl.innerHTML = '';
    characters.forEach(char => {
        const card = document.createElement('div');
        card.className = 'character-card';
        card.dataset.id = char.id;
        card.innerHTML = `
            <img src="${char.image}" alt="${char.name}" class="char-thumb">
            <div class="char-info">
                <h4>${char.name}</h4>
                <p>${char.role}</p>
            </div>
        `;
        characterListEl.appendChild(card);
    });
}

// キャラクター詳細の描画
function renderCharacterDetails(char) {
    if (!char) {
        characterDetailsEl.innerHTML = '<p class="placeholder">キャラクターを選択してください</p>';
        return;
    }
    characterDetailsEl.innerHTML = `
        <img src="${char.image}" alt="${char.name}" class="char-image">
        <h4>${char.name} <small>(${char.role})</small></h4>
        <div class="status-list">
            <p>HP: ${char.status.hp}</p>
            <p>MP: ${char.status.mp}</p>
            <p>攻撃力: ${char.status.atk}</p>
            <p>防御力: ${char.status.def}</p>
            <p>魔力: ${char.status.matk}</p>
            <p>魔防: ${char.status.mdef}</p>
            <p>素早さ: ${char.status.spd}</p>
        </div>
        <h5>パッシブスキル</h5>
        <p><strong>${char.passive.name}</strong>: ${char.passive.desc}</p>
        <h5>アクティブスキル</h5>
        <ul>
            ${char.active.map(skill => `<li><strong>${skill.name}</strong>: ${skill.desc}</li>`).join('')}
        </ul>
        <h5>必殺技</h5>
        <p><strong>${char.special.name}</strong>: ${char.special.desc}</p>
    `;
}

// キャラクターカード選択イベント
characterListEl.addEventListener('click', (event) => {
    const card = event.target.closest('.character-card');
    if (!card) return;

    // 選択状態をリセット
    document.querySelectorAll('.character-card').forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');

    selectedCharacterId = card.dataset.id;
    const selectedChar = characters.find(c => c.id === selectedCharacterId);
    renderCharacterDetails(selectedChar);
});

// パーティースロット配置イベント
partySlotsEl.addEventListener('click', (event) => {
    const slot = event.target.closest('.party-slot');
    if (!slot) return;

    const char = characters.find(c => c.id === selectedCharacterId);

    if (selectedCharacterId && !slot.classList.contains('filled')) {
        const isAlreadyInParty = partyMembers.some(member => member.id === selectedCharacterId);
        if (isAlreadyInParty) {
            alert('そのキャラクターはすでにパーティーにいます。');
            return;
        }

        if (char) {
            slot.innerHTML = '';
            const imgEl = document.createElement('img');
            imgEl.src = char.image;
            imgEl.alt = char.name;
            imgEl.className = 'char-icon';
            slot.appendChild(imgEl);

            slot.dataset.charId = char.id;
            slot.classList.add('filled');

            partyMembers.push(char);

            selectedCharacterId = null;
            document.querySelectorAll('.character-card').forEach(c => c.classList.remove('selected'));
            renderCharacterDetails(null);
        }
    } else if (slot.classList.contains('filled')) {
        const charIdToRemove = slot.dataset.charId;
        slot.innerHTML = '';
        slot.classList.remove('filled');
        slot.dataset.charId = '';

        partyMembers = partyMembers.filter(member => member.id !== charIdToRemove);
    }
});

// パーティー編成データを取得する関数
function getSelectedParty() {
    return partyMembers;
}

// グローバルスコープに公開
window.getSelectedParty = getSelectedParty;

// 最初の描画
renderCharacterCards();