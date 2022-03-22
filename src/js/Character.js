export default class Character {
  constructor(level, type = 'generic') {
    this.level = level;
    this.attack = 0;
    this.defence = 0;
    this.health = 50;
    this.type = type;
    this.position = undefined
    // TODO: throw error if user use "new Character()"
    if (new.target.name === 'Character') {
      throw new Error('error')
    }
  }
  levelUp() {
    this.level += 1;
    this.attack = Math.max(this.attack, this.attack * (1.8 - this.health))
    this.health = this.health + 80 > 100 ? 100 : this.health + 80
  }
  getAttack(attacker) {
    const damage = Math.max(attacker.attack - this.defence, attacker.attack * 0.1)
    this.health = this.health - damage
    return damage
  }
}
