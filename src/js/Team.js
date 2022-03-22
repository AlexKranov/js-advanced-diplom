import Daemon from './characters/Daemon';
import Magician from './characters/Magician';
import Vampire from './characters/Vampire';
import Undead from './characters/Undead';
import Swordsman from './characters/Swordsman';
import Bowman from './characters/Bowman';


export default class Team {
    static getPlayerTeam() {
        return [Bowman, Swordsman, Magician]
    }
    static getComputerTeam() {
        return [Daemon, Vampire, Undead]
    }
    static getCharacter(type) {
        return [Bowman, Swordsman, Magician, Daemon, Vampire, Undead].filter(char => char.getType() === type)
    }
    static getPlayerPosition(exception) {
        const max = 16 // max
        const array = []
        let even = 0;
        let odd = 1;
        for (let i = 0; i < max; i++) {
            array.push(even)
            array.push(odd)
            even += 8
            odd += 8
        }
        if (array.includes(exception)){ 
            array.splice(array.indexOf(exception), 1)
            return array[Math.floor(Math.random() * 15)]
        }
        return array[Math.floor(Math.random() * 16)]
    }
    static getComputerPosition(exception) {
        const max = 16 // max
        const array = []
        let even = 6;
        let odd = 7;
        for (let i = 0; i < max; i++) {
            array.push(even)
            array.push(odd)
            even += 8
            odd += 8
        }
        if (array.includes(exception)){ 
            array.splice(array.indexOf(exception), 1)
            return array[Math.floor(Math.random() * 15)]
        }
        return array[Math.floor(Math.random() * 16)]
    }
}
