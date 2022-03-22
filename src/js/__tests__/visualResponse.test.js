import GameController from '../GameController';
import GamePlay from '../GamePlay';
import Team from '../Team';
import PositionedCharacter from '../PositionedCharacter';
import Swordsman from '../Characters/Swordsman';
import Daemon from '../Characters/Daemon';
import { generateTeam } from '../generators'


test('onCellEnter Teammate', () => {
  // create game
  const gamePlay = new GamePlay();
  const container = document.createElement('div');
  container.outerHTML = '<div id="game-container"></div>';
  gamePlay.bindToDOM(container);
  const gameCtrl = new GameController(gamePlay, {});
  gameCtrl.init();

  // add 2 player chars
  // click on first and mouseover on second
  gameCtrl.state.playerCharacters = generateTeam(Team.getPlayerTeam(), 1, 2)
  gameCtrl.gamePlay.redrawPositions(gameCtrl.getCharactersPositions())
  gameCtrl.state.playerCharacters.forEach((player, index) => index === 0 ? gameCtrl.onCellClick(player.position) : gameCtrl.onCellEnter(player.position))

  // first selected by yellow, cursor for second change into pointer
  expect([...gamePlay.cells[gameCtrl.state.playerCharacters[0].position].classList]).toEqual(expect.arrayContaining(['selected-yellow']));
  expect(gamePlay.boardEl.style.cursor).toBe('pointer');
});

test('onCellEnter Enemy', () => {
  // create game
  const gamePlay = new GamePlay();
  const container = document.createElement('div');
  container.outerHTML = '<div id="game-container"></div>';
  gamePlay.bindToDOM(container);
  const gameCtrl = new GameController(gamePlay, {});
  gameCtrl.init();

  // add 2 player chars
  // click on first and mouseover on second
  gameCtrl.state.playerCharacters = generateTeam(Team.getPlayerTeam(), 1, 1)
  gameCtrl.state.computerCharacters = generateTeam(Team.getComputerTeam(), 1, 1)
  const [computer, player] = gameCtrl.getCharactersPositions()
  computer.position = 12
  computer.character.position = 12
  player.position = 11
  player.character.position = 11
  gameCtrl.gamePlay.redrawPositions([computer, player])
  gameCtrl.onCellClick(gameCtrl.state.playerCharacters[0].position)
  gameCtrl.onCellEnter(gameCtrl.state.computerCharacters[0].position)

  // cursor for enemy change into crosshair and adding red circle around it
  expect([...gamePlay.cells[gameCtrl.state.computerCharacters[0].position].classList]).toEqual(expect.arrayContaining(['selected-red']));
  expect(gamePlay.boardEl.style.cursor).toBe('crosshair');
});

test('onCellEnter Step', () => {
  // create game
  const gamePlay = new GamePlay();
  const container = document.createElement('div');
  container.outerHTML = '<div id="game-container"></div>';
  gamePlay.bindToDOM(container);
  const gameCtrl = new GameController(gamePlay, {});
  gameCtrl.init();

  // add 2 player chars
  // click on first and mouseover on second
  gameCtrl.state.playerCharacters = generateTeam(Team.getPlayerTeam(), 1, 1)
  gameCtrl.state.computerCharacters = generateTeam(Team.getComputerTeam(), 1, 1)
  const [computer, player] = gameCtrl.getCharactersPositions()
  player.position = 11
  player.character.position = 11
  gameCtrl.gamePlay.redrawPositions([computer, player])
  gameCtrl.onCellClick(gameCtrl.state.playerCharacters[0].position)
  gameCtrl.onCellEnter(12)

  // cursor change into pointer and adding green circle around cell
  expect([...gamePlay.cells[12].classList]).toEqual(expect.arrayContaining(['selected-green']));
  expect(gamePlay.boardEl.style.cursor).toBe('pointer');
});

test('onCellEnter Not-allowed', () => {
  // create game
  const gamePlay = new GamePlay();
  const container = document.createElement('div');
  container.outerHTML = '<div id="game-container"></div>';
  gamePlay.bindToDOM(container);
  const gameCtrl = new GameController(gamePlay, {});
  gameCtrl.init();

  // add 2 player chars
  // click on first and mouseover on second
  gameCtrl.state.playerCharacters = generateTeam(Team.getPlayerTeam(), 1, 2)
  gameCtrl.gamePlay.redrawPositions(gameCtrl.getCharactersPositions())
  gameCtrl.onCellClick(gameCtrl.state.playerCharacters[0].position)
  gameCtrl.onCellEnter(gameCtrl.state.computerCharacters[0].position)

  // cursor change into not-allowed
  expect(gamePlay.boardEl.style.cursor).toBe('not-allowed');
});