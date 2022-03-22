import Character from "./Character";
import PositionedCharacter from './PositionedCharacter'
/**
 * Generates random characters
 *
 * @param allowedTypes iterable of classes
 * @param maxLevel max character level
 * @returns Character type children (ex. Magician, Bowman, etc)
 */
export function* characterGenerator(allowedTypes, maxLevel) {
  // TODO: write logic here

  validator(allowedTypes)

  while (true) {
    const type = Math.floor(Math.random() * allowedTypes.length)
    const level = Math.floor(Math.random() * maxLevel)
    yield new allowedTypes[type](level)
  }
}

export function generateTeam(allowedTypes, maxLevel, characterCount) {
  // TODO: write logic here
  validator(allowedTypes)

  const team = []

  for (let i = 0; i < characterCount; i++) {
    team.push(characterGenerator(allowedTypes, maxLevel).next().value)
  }
  return team
}


function validator(allowedTypes) {
  if (typeof allowedTypes[Symbol.iterator] === 'function') {
    allowedTypes.forEach(character => {
      if (!(typeof character === 'function')) {
        throw new Error('character not class');
      }
    });
  } else {
    throw new Error('argument not iterable');
  }
}