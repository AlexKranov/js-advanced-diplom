import Character from '../Character';

test('throw err', () => {
    expect(()=> new Character(1,'daemon')).toThrow(new Error('error'));
})

test('not to throw err', () => {
    expect(() => class Daemon extends Character {}).not.toThrow();
})