import test from 'ava'
import CONST from '../../src/const'

test('const should be an object', t => {
  t.is(typeof CONST, 'object')
})

test('const MAX_DEFAULT should be a number', t => {
  t.is(typeof CONST.MAX_DEFAULT, 'number')
})
