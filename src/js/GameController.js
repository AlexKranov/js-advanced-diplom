import themes from './themes'
import { generateTeam } from './generators'
import Team from './Team';
import PositionedCharacter from './PositionedCharacter';
import GamePlay from './GamePlay';
import GameState from './GameState';
import { calcTileType } from './utils';
import Bowman from './characters/Bowman';
import Swordsman from './characters/Swordsman';
import Magician from './characters/Magician';
import Daemon from './characters/Daemon';
import Vampire from './characters/Vampire';
import Undead from './characters/Undead';
import Character from './Character';

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
    this.computerTeam = null
    this.playerTeam = null
    this.exception = null
    this.currentCharacter = undefined
    this.initialState = {
      currentTurn: 'Player',
      currentCharacter: undefined,
      selectCell: null,
      availableMoves: [],
      attackRadius: [],
      playerCharacters: [],
      computerCharacters: [],
      level: 1,
      computerPoints: 0,
      playerPoints: 0,
    }
    this.state = Object.assign({}, this.initialState)
  }

  init() {
    // TODO: add event listeners to gamePlay events
    // TODO: load saved stated from stateService
    this.gamePlay.drawUi(themes.prairie)
    this.addListeners()
    //get characters
    this.state.computerCharacters = generateTeam(Team.getComputerTeam(), 1, 2)
    this.state.playerCharacters = generateTeam(Team.getPlayerTeam(), 1, 2)
    this.gamePlay.redrawPositions(this.getCharactersPositions())
  }

  getCharactersPositions() {
    //get positions characters
    const redraw = []
    this.state.computerCharacters.forEach(player => {
      const position = Team.getComputerPosition(this.exception)
      this.exception = position
      player.position = position
      redraw.push(new PositionedCharacter(player, position))
    })
    this.state.playerCharacters.forEach(player => {
      const position = Team.getPlayerPosition(this.exception)
      this.exception = position
      player.position = position
      redraw.push(new PositionedCharacter(player, position))
    })
    this.exception = null
    return redraw
  }

  getNewPositions() {
    const redraw = []
    console.log('state', this.state)
    this.state.computerCharacters.forEach(player => {
      redraw.push(new PositionedCharacter(player, player.position))
    })
    this.state.playerCharacters.forEach(player => {
      redraw.push(new PositionedCharacter(player, player.position))
    })
    console.log('redraw', redraw)
    return redraw
  }

  addListeners() {
    this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this));
    this.gamePlay.addCellLeaveListener(this.onCellLeave.bind(this));
    this.gamePlay.addCellClickListener(this.onCellClick.bind(this));
    this.gamePlay.addNewGameListener(this.onNewGameClick.bind(this));
    this.gamePlay.addSaveGameListener(this.onSaveGameClick.bind(this));
    this.gamePlay.addLoadGameListener(this.onLoadGameClick.bind(this));
  }

  onNewGameClick() {
    if(this.gamePlay.cellEnterListeners.length === 0) {
      this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this));
      this.gamePlay.addCellLeaveListener(this.onCellLeave.bind(this));
      this.gamePlay.addCellClickListener(this.onCellClick.bind(this));
    }
    this.gamePlay.drawUi(themes.prairie)
    this.state.computerCharacters = generateTeam(Team.getComputerTeam(), 1, 2)
    this.state.playerCharacters = generateTeam(Team.getPlayerTeam(), 1, 2)
    this.gamePlay.redrawPositions(this.getCharactersPositions())
    this.createGameState(Object.assign(
      this.initialState,
      {
        playerCharacters: this.state.playerCharacters,
        computerCharacters: this.state.computerCharacters,
        currentTurn: 'Player',
        level: 1
      },
    ))
  }

  onSaveGameClick() {
    this.stateService.save(GameState.from(this.state));
    GamePlay.showMessage('Игра сохранена');
  }

  onLoadGameClick() {
    try {
      const load = this.stateService.load();
      if (load) {
        this.state = Object.assign(this.state, load)
        console.log('old', this.state)
        const newPlayerCharacters = this.state.playerCharacters.map(char => {
          if (char.type === 'bowman') {
            const character = new Bowman(char.level)
            for (let key in char) {
              character[key] = char[key]
            }
            return character
          } else if (char.type === 'swordsman') {
            const character = new Swordsman(char.level)
            for (let key in char) {
              character[key] = char[key]
            }
            return character
          } else {
            const character = new Magician(char.level)
            for (let key in char) {
              character[key] = char[key]
            }
            return character
          }

        })
        const newComputerCharacters = this.state.computerCharacters.map(char => {
          if (char.type === 'daemon') {
            const character = new Daemon(char.level)
            for (let key in char) {
              character[key] = char[key]
            }
            return character
          } else if (char.type === 'vampire') {
            const character = new Vampire(char.level)
            for (let key in char) {
              character[key] = char[key]
            }
            return character
          } else {
            const character = new Undead(char.level)
            for (let key in char) {
              character[key] = char[key]
            }
            return character
          }
        })
        this.state = { ...this.state, playerCharacters: newPlayerCharacters, computerCharacters: newComputerCharacters }
        console.log('new', this.state)

        this.gamePlay.redrawPositions(this.getNewPositions())
      }
    } catch (e) {
      GamePlay.showError(e.message);
    }
  }

  onCellClick(index) {
    // TODO: react to click
    this.characterOnCell = this.gamePlay.cells[index].firstElementChild
    if (this.characterOnCell && this.state.currentTurn === 'Player') {//если в ячейке есть персонаж
      const currentCharacter = [...this.state.playerCharacters].find(item => item.position === index)
      const computerCharacter = [...this.state.computerCharacters].find(item => item.position === index)
      if (currentCharacter) {//свой персонаж
        this.deselectCells()
        this.gamePlay.selectCell(index)
        this.createGameState({
          currentTurn: 'Player',
          currentCharacter,
          selectCell: index,
          availableMoves: this.getAvaliblePositions(index, currentCharacter.step),
          attackRadius: this.checkAttack(index, currentCharacter.attackRadius),
        })
      } else if (computerCharacter && this.state.currentCharacter) {//если чужой и выбран персонаж
        if (this.state.attackRadius.includes(index)) {
          const damage = computerCharacter.getAttack(this.state.currentCharacter)
          this.deselectCells()
          this.checkHealthCharacters()
          this.gamePlay.showDamage(index, damage).then(() => {
            this.gamePlay.redrawPositions(this.getNewPositions())
            this.createGameState(Object.assign(
              this.initialState,
              {
                playerCharacters: this.state.playerCharacters,
                computerCharacters: this.state.computerCharacters,
                currentTurn: 'Computer'
              },
            ))
            const { computerCharacters, playerCharacters } = this.state
            if (computerCharacters.length === 0 || playerCharacters.length === 0) {
              this.setNextLevel()
            } else {
              this.computerStep()
            }
          })
        }
      }
      else {
        GamePlay.showError("Вы можете выбирать только своего персонажа")
      }
    } else if (this.state.currentCharacter && this.state.currentTurn === 'Player') {//если уже выбран персонаж
      if (this.state.availableMoves.includes(index)) {//может ли персонаж ходить в эту ячейку
        const currentCharacter = [...this.state.playerCharacters, ...this.state.computerCharacters].find(character => character.position === this.state.selectCell)
        currentCharacter.position = index
        this.deselectCells()
        this.gamePlay.redrawPositions(this.getNewPositions())
        this.createGameState(Object.assign(this.initialState, { playerCharacters: this.state.playerCharacters, computerCharacters: this.state.computerCharacters, currentTurn: 'Computer' }))
        const { computerCharacters, playerCharacters } = this.state
        if (computerCharacters.length === 0 || playerCharacters.length === 0) {
          this.setNextLevel()
        } else {
          this.computerStep()
        }
      }
    }
    console.log(this.state)
  }



  deselectCells() {
    this.gamePlay.cells.forEach((cell, index) => {
      cell.classList.contains('selected') ? this.gamePlay.deselectCell(index) : null
    })
  }

  onCellEnter(index) {
    // TODO: react to mouse enter
    this.characterOnCell = this.gamePlay.cells[index].firstElementChild
    if (this.state.currentCharacter) {
      if (this.state.attackRadius.includes(index) && this.checkPosition(index, this.state.computerCharacters)) {
        this.clearCells()
        this.gamePlay.setCursor('crosshair')
        this.gamePlay.selectCell(index, 'red')
      } else if (this.state.availableMoves.includes(index)) {
        this.clearCells()
        this.gamePlay.setCursor('pointer')
        this.gamePlay.selectCell(index, 'green')
      } else if (this.checkPosition(index, this.state.playerCharacters)) {
        this.gamePlay.setCursor('pointer')
        this.clearCells()
      } else {
        this.gamePlay.setCursor('not-allowed')
        this.clearCells()
      }
    } else if (this.characterOnCell) {
      const character = [...this.state.playerCharacters, ...this.state.computerCharacters].find(character => character.position === index)
      if (this.state.playerCharacters.includes(character)) {
        this.gamePlay.setCursor('pointer')
      } else {
        this.gamePlay.setCursor('not-allowed')
      }
      const message = this.createToolTip(character)
      this.gamePlay.showCellTooltip(message, index)
    } else {
      this.gamePlay.setCursor('auto')
    }
  }

  clearCells() {
    const indexCell = this.gamePlay.cells.findIndex(cell => cell.classList.contains('selected-green'))
    const indexCellRed = this.gamePlay.cells.findIndex(cell => cell.classList.contains('selected-red'))
    indexCell !== -1 ? this.gamePlay.deselectCell(indexCell) : null
    indexCellRed !== -1 ? this.gamePlay.deselectCell(indexCellRed) : null
  }

  onCellLeave(index) {
    this.gamePlay.hideCellTooltip(index)
    // TODO: react to mouse leave
  }

  createToolTip(character) {
    return `${'\u{1F396}'} ${character.level} ${'\u{2694}'} ${character.attack
      } ${'\u{1F6E1}'} ${character.defence} ${'\u{2764}'} ${character.health}`
  }

  createGameState(newState) {
    this.state = Object.assign(this.state, newState)
  }

  getAvaliblePositions(index, step) {
    return [
      ...this.getTopPositions(index, step),
      ...this.getLeftPositions(index, step),
      ...this.getRightPositions(index, step),
      ...this.getBottomPositions(index, step),
      ...this.getTopRightPositions(index, step),
      ...this.getTopLeftPositions(index, step),
      ...this.getBottomLeftPositions(index, step),
      ...this.getBottomRightPositions(index, step)
    ].filter(position => !this.checkPosition(position, [...this.state.playerCharacters, ...this.state.computerCharacters]))
  }

  getPositions(exceptions, index, step, formula) {
    const positions = []
    for (let i = 0; i <= step; i++) {
      const availableStep = formula(i, index)
      const tileType = calcTileType(availableStep, this.gamePlay.boardSize)
      const exception = exceptions.some(tile => tile === tileType)
      if (exception && i === 0) {
        break
      } else if (i !== 0) {
        positions.push(availableStep)
        if (exception) {
          break
        }
      } else if (exception) {
        break
      }
    }
    return positions
  }

  getTopPositions(index, step) {
    const exceptions = ['top-left', 'top-right', 'top', 'error']
    const formula = (i, index) => index - this.gamePlay.boardSize * i
    return this.getPositions(exceptions, index, step, formula)
  }
  getLeftPositions(index, step) {
    const exceptions = ['top-left', 'left', 'error', 'bottom-left']
    const formula = (i, index) => index - 1 * i
    return this.getPositions(exceptions, index, step, formula)
  }
  getRightPositions(index, step) {
    const exceptions = ['top-right', 'right', 'error', 'bottom-right']
    const formula = (i, index) => index + 1 * i
    return this.getPositions(exceptions, index, step, formula)
  }
  getBottomPositions(index, step) {
    const exceptions = ['bottom-left', 'bottom', 'error', 'bottom-right']
    const formula = (i, index) => index + this.gamePlay.boardSize * i
    return this.getPositions(exceptions, index, step, formula)
  }
  getTopRightPositions(index, step) {
    const exceptions = ['top-left', 'top', 'error', 'top-right', 'right', 'bottom-right']
    const formula = (i, index) => index - this.gamePlay.boardSize * i + i
    return this.getPositions(exceptions, index, step, formula)
  }
  getTopLeftPositions(index, step) {
    const exceptions = ['top-left', 'top', 'error', 'top-right', 'left', 'bottom-left']
    const formula = (i, index) => index - this.gamePlay.boardSize * i - i
    return this.getPositions(exceptions, index, step, formula)
  }
  getBottomLeftPositions(index, step) {
    const exceptions = ['top-left', 'bottom', 'error', 'bottom-right', 'left', 'bottom-left']
    const formula = (i, index) => index + this.gamePlay.boardSize * i - i
    return this.getPositions(exceptions, index, step, formula)
  }
  getBottomRightPositions(index, step) {
    const exceptions = ['top-right', 'bottom', 'error', 'bottom-right', 'right', 'bottom-left']
    const formula = (i, index) => index + this.gamePlay.boardSize * i + i
    return this.getPositions(exceptions, index, step, formula)
  }

  checkPosition(index, team) {
    const result = team.find(character => character.position === index)
    return result
  }

  getAttackRadius(formula, positionsX, positionsY) {
    const positions = []
    const boardSize = this.gamePlay.boardSize
    if (positionsX.length > 0 && positionsY.length > 0) {
      for (let i = 0; i < this.getMostLength(positionsX, positionsY).length; i++) {
        for (let j = 0; j < this.getMostLength(positionsX, positionsY).length; j++) {
          const attackPosition = formula(positionsY[i], boardSize, j)
          if (attackPosition >= 0 && !this.checkPosition(attackPosition, this.state.playerCharacters)) {
            positions.push(attackPosition)
          }
        }
      }
    }
    return positions
  }

  getTopRightAttack(topPositions, rightPositions) {
    const formula = (position, boardSize, j) => position - boardSize * (j + 1)
    return this.getAttackRadius(formula, topPositions, rightPositions)
  }

  getTopLefttAttack(topPositions, leftPositions) {
    const formula = (position, boardSize, j) => position - boardSize * (j + 1)
    return this.getAttackRadius(formula, topPositions, leftPositions)
  }

  getBottomRightAttack(bottomPositions, rightPositions) {
    const formula = (position, boardSize, j) => position + boardSize * (j + 1)
    return this.getAttackRadius(formula, bottomPositions, rightPositions)
  }

  getBottomLeftAttack(bottomPositions, leftPositions) {
    const formula = (position, boardSize, j) => position + boardSize * (j + 1)
    return this.getAttackRadius(formula, bottomPositions, leftPositions)
  }

  checkAttack(index, step) {
    const topPositions = this.getTopPositions(index, step)
    const rightPositions = this.getLeftPositions(index, step)
    const leftPositions = this.getRightPositions(index, step)
    const bottomPositions = this.getBottomPositions(index, step)
    const topRight = this.getTopRightAttack(topPositions, rightPositions)
    const topLeft = this.getTopLefttAttack(topPositions, leftPositions)
    const bottomRight = this.getBottomRightAttack(bottomPositions, rightPositions)
    const bottomLeft = this.getBottomLeftAttack(bottomPositions, leftPositions)
    return [...topPositions, ...rightPositions, ...leftPositions, ...bottomPositions, ...topRight, ...topLeft, ...bottomLeft, ...bottomRight]
  }
  getMostLength(a, b) {
    return a.length > b.length ? a : b
  }


  computerStep() {
    const characters = this.state.computerCharacters
    const currentCharacter = characters[Math.floor(Math.random() * characters.length)]
    this.createGameState({
      currentTurn: 'Computer',
      currentCharacter,
      selectCell: currentCharacter.position,
      availableMoves: this.getAvaliblePositions(currentCharacter.position, currentCharacter.step),
      attackRadius: this.checkAttack(currentCharacter.position, currentCharacter.attackRadius),
    })
    const playerCharacter = this.state.playerCharacters.find(character => this.state.attackRadius.includes(character.position))
    if (playerCharacter) { //атака
      const damage = playerCharacter.getAttack(currentCharacter)
      this.gamePlay.showDamage(playerCharacter.position, damage).then(() => {
        this.checkHealthCharacters()
        this.gamePlay.redrawPositions(this.getNewPositions())
        this.createGameState(Object.assign(
          this.initialState,
          {
            playerCharacters: this.state.playerCharacters,
            computerCharacters: this.state.computerCharacters,
            currentTurn: 'Player'
          },
        ))
        const { computerCharacters, playerCharacters } = this.state
        if (computerCharacters.length === 0 || playerCharacters.length === 0) {
          this.setNextLevel()
        }
      })

    } else { //ход
      const nextStep = this.state.availableMoves[Math.floor(Math.random() * this.state.availableMoves.length)]
      currentCharacter.position = nextStep
      this.gamePlay.redrawPositions(this.getNewPositions())
      this.createGameState(Object.assign(this.initialState, { playerCharacters: this.state.playerCharacters, computerCharacters: this.state.computerCharacters, currentTurn: 'Player' }))
    }
    const { computerCharacters, playerCharacters } = this.state
    if (computerCharacters.length === 0 || playerCharacters.length === 0) {
      this.setNextLevel()
    }
    console.log(this.state)
  }

  checkHealthCharacters() {
    this.state.computerCharacters = this.state.computerCharacters.filter(character => character.health > 0)
    this.state.playerCharacters = this.state.playerCharacters.filter(character => character.health > 0)
  }

  setNextLevel() {
    this.setPoints()
    this.state.level += 1
    if (this.state.level === 2) {
      this.gamePlay.drawUi(themes.desert)
      this.createLevel(3)
    } else if (this.state.level === 3) {
      this.gamePlay.drawUi(themes.arctic)
      this.createLevel(5)
    } else if (this.state.level === 4) {
      this.gamePlay.drawUi(themes.mountain)
      this.createLevel(7)
    } else {
      this.gamePlay.cellEnterListeners = [];
      this.gamePlay.cellLeaveListeners = [];
      this.gamePlay.cellClickListeners = [];
      if (this.state.playerPoints > this.state.computerPoints) {
        GamePlay.showMessage(`Победил Player, счет ${this.state.playerPoints} : ${this.state.computerPoints}`);
      } else {
        GamePlay.showMessage(`Победил Computer, счет ${this.state.playerPoints} : ${this.state.computerPoints}`);
      }

    }
  }

  createLevel(countCharacters) {
    const level = this.state.level
    const characters = [...this.state.playerCharacters, ...this.state.computerCharacters]
    characters.forEach(character => {
      character.levelUp()
    })
    this.state.computerCharacters = [...this.state.computerCharacters, ...generateTeam(Team.getComputerTeam(), level - 1, countCharacters - this.state.computerCharacters.length)]
    this.state.playerCharacters = [...this.state.playerCharacters, ...generateTeam(Team.getPlayerTeam(), level, countCharacters - this.state.playerCharacters.length)]
    this.gamePlay.redrawPositions(this.getCharactersPositions())
    this.createGameState(Object.assign(
      this.initialState,
      {
        playerCharacters: this.state.playerCharacters,
        computerCharacters: this.state.computerCharacters,
        currentTurn: 'Player',
        level,
        playerPoints: this.state.playerPoints,
        computerPoints: this.state.computerPoints
      },
    ))
  }

  setPoints() {
    const { computerCharacters, playerCharacters } = this.state
    this.state.computerPoints = computerCharacters.reduce((acc, value) => {
      return acc + value.health
    }, this.state.computerPoints)
    this.state.playerPoints = playerCharacters.reduce((acc, value) => {
      return acc + value.health
    }, this.state.playerPoints)
  }
}
