import Bowman from '../characters/Bowman';

test('icon', () => {
  const bowman = new Bowman("name");
  const status = `${'\u{1F396}'}${bowman.level}${'\u{2694}'}${bowman.attack}${'\u{1F6E1}'}${bowman.defence}${'\u{2764}'}${bowman.health}`;
  const toBe = '\u{1F396}name\u{2694}25\u{1F6E1}25\u{2764}50';

  expect(status).toBe(toBe);
});