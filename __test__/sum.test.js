const { sum } = require('./sum');

describe.skip('pruebas para sumar', () => {
    test('1 + 2 is 3', () => {
        expect(sum(1, 2)).toBe(3);
    });

    it('should return 3 whit 1 + 2', () => {
        expect(sum(1, 2)).toBe(3);
    });
});

/**
 * COMMON MATCHERS
 */
// toBe(number)
// toEqual({ })     -> object validation
// not.toEqual({ }) -> negar

/**
 * THRUTHINESS
 */
// toBeNull()       -> natches only null
// toBeUndefided()  -> matches only undefined
// toBeDefined()    -> is the opposite of toBeUndefined
// toBeTruthy()     -> matches anything that an if statement treats as true
// toBeFalsy()      -> matches anything that an if statement treats as false

/**
 * NUMBERS
 */
// toBeGreaterThan()            -> mayor que
// toBeGreaterThanOrEqual()     -> mayor o igual que
// toBeLessThan()               -> menor que
// toBeLessThanOrEqual()        -> menor o igual que
// toBe()                       -> igual
// toBeCloseTo()                -> para floating
// toEqual()                    -> igual

/**
 * STRINGS
 */
// toMatch(expresion regular)

/**
 * ARRAYS
 */
//  toContain(contenido)    -> si contiene
//  toHaveLength(size)      -> tamaño del array

/**
 * Promise
 * https://youtu.be/hjlaGH-TbGc?list=PLIddmSRJEJ0s3cxl5RIbDcthFc7yUzGTW
 */

/**
 * Async & Await
 * https://youtu.be/wi58ILS1okA?list=PLIddmSRJEJ0s3cxl5RIbDcthFc7yUzGTW
 */
