// characters.js

export const characters = [
    {
        id: 'char01', name: '剣士ソラ', role: '剣士', image: 'images/char01.png',
        attackType: 'physical',
        status: { 
            maxHp: 250, hp: 250, 
            maxMp: 80, mp: 80, 
            atk: 50, matk: 10, 
            def: 40, mdef: 25, 
            spd: 30, 
            support: 20, 
            criticalRate: 0.15, dodgeRate: 0.1, criticalMultiplier: 1.5 
        },
        passive: { name: '不屈の魂', desc: 'HPが30%以下になると、物理防御力が2倍になる。' },
        active: [
            { name: '連撃', desc: '敵単体に3回連続の物理攻撃を行う。' },
            { name: 'なぎ払い', desc: '敵全体に物理攻撃を行う。' },
            { name: 'シールドバッシュ', desc: '敵単体に物理攻撃を行い、確率で行動不能にする。' }
        ],
        special: { 
            name: '天空斬り', desc: '空高く舞い上がり、敵全体に強力な物理ダメージを与える。',
            condition: (player) => player.status.mp >= 50
        }
    },
    {
        id: 'char02', name: '魔術師ルナ', role: '魔術師', image: 'images/char02.png',
        attackType: 'magic',
        status: { 
            maxHp: 180, hp: 180, 
            maxMp: 150, mp: 150, 
            atk: 15, matk: 60, 
            def: 20, mdef: 45, 
            spd: 25, 
            support: 30, 
            criticalRate: 0.1, dodgeRate: 0.05, criticalMultiplier: 1.8 
        },
        passive: { name: 'マナの源泉', desc: 'ターン開始時、MPが少し回復する。' },
        active: [
            { name: 'ファイアボール', desc: '敵単体に炎の魔法攻撃。' },
            { name: 'ブリザード', desc: '敵全体に氷の魔法攻撃。' },
            { name: 'ヒールライト', desc: '味方単体のHPを回復する。' }
        ],
        special: { 
            name: 'メテオストライク', desc: '巨大な隕石を召喚し、敵全体に超大な魔法ダメージを与える。',
            condition: (player) => player.status.mp >= 80
        }
    },
    {
        id: 'char03', name: '僧侶セシル', role: '僧侶', image: 'images/char03.png',
        attackType: 'magic',
        status: { 
            maxHp: 200, hp: 200, 
            maxMp: 120, mp: 120, 
            atk: 20, matk: 30, 
            def: 30, mdef: 50, 
            spd: 35, 
            support: 50, 
            criticalRate: 0.05, dodgeRate: 0.08, criticalMultiplier: 1.5 
        },
        passive: { name: '聖なる守護', desc: '状態異常にかかりにくくなる。' },
        active: [
            { name: 'ホーリーライト', desc: '味方全体を少し回復する。' },
            { name: 'リザレクション', desc: '戦闘不能の味方をHP50%で復活させる。' },
            { name: 'サイレンス', desc: '敵単体の魔法を封じる。' }
        ],
        special: { 
            name: '奇跡の讃美歌', desc: '味方全体のHPとMPを全回復させる。',
            condition: (player) => player.status.mp >= 100 && player.status.hp < player.status.maxHp * 0.2
        }
    },
    {
        id: 'char04', name: '盗賊カイ', role: '盗賊', image: 'images/char04.png',
        attackType: 'physical',
        status: { 
            maxHp: 220, hp: 220, 
            maxMp: 60, mp: 60, 
            atk: 45, matk: 5, 
            def: 25, mdef: 15, 
            spd: 55, 
            support: 10, 
            criticalRate: 0.25, dodgeRate: 0.2, criticalMultiplier: 2.0 
        },
        passive: { name: '先制攻撃', desc: '戦闘開始時、相手より先に行動しやすい。' },
        active: [
            { name: '二連斬り', desc: '敵単体に2回連続で物理攻撃を行う。' },
            { name: '煙幕', desc: '敵全体の命中率を低下させる。' },
            { name: 'ぶんどる', desc: '敵からアイテムを盗む。' }
        ],
        special: { 
            name: '影渡り', desc: '姿を消し、敵単体に致命的な一撃を与える。',
            condition: (player) => player.status.hp === player.status.maxHp
        }
    },
    {
        id: 'char05', name: '蕩夜零唯', role: '魔導士', image: 'images/char05.png',
        attackType: 'magic',
        status: { 
            maxHp: 100, hp: 100, 
            maxMp: 250, mp: 250, 
            atk: 5, matk: 45, 
            def: 10, mdef: 25, 
            spd: 28, 
            support: 70, 
            criticalRate: 0.15, dodgeRate: 0.35, criticalMultiplier: 1.5
        },
        passive: { name: '先制攻撃', desc: 'ターン開始時、確率で相手を魅了する' },
        active: [
            { name: '二連斬り', desc: '敵単体に2回連続で物理攻撃を行う。' },
            { name: '煙幕', desc: '敵全体の命中率を低下させる。' },
            { name: 'ぶんどる', desc: '敵からアイテムを盗む。' }
        ],
        special: { 
            name: '影渡り', desc: '姿を消し、敵単体に致命的な一撃を与える。',
            condition: (player) => player.status.hp === player.status.maxHp
        }
    }
];