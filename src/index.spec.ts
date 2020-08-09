import { registerRestMethods, addValidationToContract } from './index.js'
describe('index.ts', () => {
  it('does not do anything', () => {
    expect(true).toEqual(true)
  })

  it('can call methods exported from index', () => {
    registerRestMethods({})
    addValidationToContract({})
  })
})
