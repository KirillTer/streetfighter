import controls from '../../constants/controls';

export function getHitPower(fighter) {
    return fighter.attack * Math.random() + 1;
}

export function getBlockPower(fighter) {
    return fighter.defense * Math.random() + 1;
}

export function getDamage(attacker, defender) {
    const damage = getHitPower(attacker) - getBlockPower(defender);
    return damage >= 0 ? damage : 0;
}

function getCriticalDamage(fighter) {
    return fighter.attack * 2;
}

function checkComboEquality(pressedCombo, expectedCombo) {
    return expectedCombo.every(value => pressedCombo.includes(value));
}

function collectCriticalCombo(fighter, keyPressed) {
    // eslint-disable-next-line no-param-reassign
    if (!fighter.pressedCombo) fighter.pressedCombo = new Set();
    // eslint-disable-next-line no-unused-expressions
    fighter.pressedCombo.has(keyPressed)
        ? fighter.pressedCombo.delete(keyPressed)
        : fighter.pressedCombo.add(keyPressed);
}

function tryToCriticalHit(attacker, defender, makeHit, bar, keyPressed, combo) {
    collectCriticalCombo(attacker, keyPressed);

    const { isCriticalActive, isBlock } = attacker;

    if (checkComboEquality(Array.from(attacker.pressedCombo), combo) && isCriticalActive && !isBlock) {
        makeHit(attacker, defender, getCriticalDamage, bar, true);
        // eslint-disable-next-line no-param-reassign
        attacker.isCriticalActive = false;
        // eslint-disable-next-line no-return-assign, no-param-reassign
        setTimeout(() => (attacker.isCriticalActive = true), 10000);
    }
}

function beforeStart(firstFighter, secondFighter) {
    if (firstFighter === secondFighter) {
        // eslint-disable-next-line no-param-reassign
        firstFighter = { ...firstFighter };
    }

    // eslint-disable-next-line no-param-reassign
    firstFighter.currenthealth = firstFighter.health;
    // eslint-disable-next-line no-param-reassign
    secondFighter.currenthealth = secondFighter.health;

    // eslint-disable-next-line no-param-reassign
    firstFighter.isCriticalActive = true;
    // eslint-disable-next-line no-param-reassign
    secondFighter.isCriticalActive = true;
}

export async function fight(firstFighter, secondFighter) {
    return new Promise(resolve => {
        beforeStart(firstFighter, secondFighter);

        const firstFighterHealthBar = document.getElementById('left-fighter-indicator');
        const secondFighterHealthBar = document.getElementById('right-fighter-indicator');

        const hit = (attacker, defender, getCurrentDamage, bar, isCrit) => {
            if ((!attacker.isBlock && !defender.isBlock) || isCrit) {
                // eslint-disable-next-line no-param-reassign
                defender.currenthealth -= getCurrentDamage(attacker, defender);
                // eslint-disable-next-line no-param-reassign
                bar.style.width =
                    defender.currenthealth >= 0 ? `${(defender.currenthealth / defender.health) * 100}%` : '0%';
            }

            if (defender.currenthealth <= 0) {
                resolve(attacker);
            }
        };

        document.addEventListener('keydown', event => {
            switch (event.code) {
                case controls.PlayerOneBlock:
                    // eslint-disable-next-line no-param-reassign
                    firstFighter.isBlock = true;
                    break;
                case controls.PlayerTwoBlock:
                    // eslint-disable-next-line no-param-reassign
                    secondFighter.isBlock = true;
                    break;
                default:
                    if (controls.PlayerOneCriticalHitCombination.includes(event.code)) {
                        // eslint-disable-next-line no-use-before-define
                        tryToCriticalHit(
                            firstFighter,
                            secondFighter,
                            hit,
                            secondFighterHealthBar,
                            event.code,
                            controls.PlayerOneCriticalHitCombination
                        );
                    }
                    if (controls.PlayerTwoCriticalHitCombination.includes(event.code)) {
                        // eslint-disable-next-line no-use-before-define
                        tryToCriticalHit(
                            secondFighter,
                            firstFighter,
                            hit,
                            firstFighterHealthBar,
                            event.code,
                            controls.PlayerTwoCriticalHitCombination
                        );
                    }
                    break;
            }
        });

        document.addEventListener('keyup', event => {
            switch (event.code) {
                case controls.PlayerOneAttack:
                    hit(firstFighter, secondFighter, getDamage, secondFighterHealthBar);
                    break;
                case controls.PlayerOneBlock:
                    // eslint-disable-next-line no-param-reassign
                    firstFighter.isBlock = false;
                    break;
                case controls.PlayerTwoAttack:
                    hit(secondFighter, firstFighter, getDamage, firstFighterHealthBar);
                    break;
                case controls.PlayerTwoBlock:
                    // eslint-disable-next-line no-param-reassign
                    secondFighter.isBlock = false;
                    break;
                default:
                    if (controls.PlayerOneCriticalHitCombination.includes(event.code)) {
                        collectCriticalCombo(firstFighter, event.code);
                    }
                    if (controls.PlayerTwoCriticalHitCombination.includes(event.code)) {
                        collectCriticalCombo(secondFighter, event.code);
                    }
                    break;
            }
        });
    });
}
