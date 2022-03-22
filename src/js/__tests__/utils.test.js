import {calcTileType} from "../utils";

describe('testing calcTileType',() => {
    test('top', () => {

        expect(calcTileType(5,8)).toBe('top');
    })
    
    test('center', () => {
    
        expect(calcTileType(11,8)).toBe('center');
    })
    
    test('top-left', () => {
    
        expect(calcTileType(0,8)).toBe('top-left');
    })
    
    test('top-right', () => {
    
        expect(calcTileType(7,8)).toBe('top-right');
    })
    
    test('left', () => {
    
        expect(calcTileType(32,8)).toBe('left');
    })
    
    test('right', () => {
    
        expect(calcTileType(55,8)).toBe('right');
    })
    
    test('bottom-left', () => {
    
        expect(calcTileType(56,8)).toBe('bottom-left');
    })
    
    test('bottom-right', () => {
    
        expect(calcTileType(63,8)).toBe('bottom-right');
    })
    
    test('bottom', () => {
    
        expect(calcTileType(60,8)).toBe('bottom');
    })
})