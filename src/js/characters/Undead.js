import Character from "../Character";

export default class Undead extends Character {
    constructor(level) {
        super(level)
        this.type = 'undead'
        this.level = level
        this.attack = 40;
        this.defence = 10;
        this.step = 4;
        this.attackRadius = 1
    }
    static getType() {
        return 'undead';
      }
}