import { addValidationToContract, isContractInError } from './contractValidation'
import { ContractType } from '../globalTypes'
describe('contractProcessor', () => {
  const auth = { authentication: false }
  const input: ()=>{test: ContractType<{a:string}, {b:string}>} = () => ({
    test: {
      arguments: { a: 'string' },
      manageFields: {},
      name: 'test',
      returns: { b: 'string' },
      handle: async (obj) => ({ b: obj.a }),
      type: 'get',
      authentication: false
    }
  })

  it('can add validation to a single contract', () => {
    const result = addValidationToContract(input())
    expect(result.test.contract.name).toEqual('test')
    expect(result.test.contract.type).toEqual('get')
    expect(result.test.contract.authentication).toEqual(false)
    expect(result.test.handle).not.toEqual(input().test.handle)
    expect(typeof result.test.handle).toBe('function')
  })

  it('runs the defined handler - happy path', async () => {
    const contracts = input()
    expect(await addValidationToContract(contracts).test.handle({ a: 'foo' }, auth, contracts.test))
      .toStrictEqual({ result: { b: 'foo' } })
  })

  it('runs the defined handler - input validation error', async () => {
    const testData = input()
    const ogHandle = testData.test.handle = jest.fn(testData.test.handle)
    const handle = jest.fn(addValidationToContract(testData).test.handle)
    expect(await handle({ x: 'foo' }, auth, testData.test))
      .toStrictEqual({
        code: 400,
        data: { x: 'foo' },
        errorType: 'Input validation failed',
        errors: {
          output: {
            a: { error: 'Value is not a string', value: undefined },
            x: { error: 'Key does not exist on validator', value: 'foo' }
          },
          result: 'fail'
        }
      })
    expect(handle).toBeCalled()
    expect(ogHandle).not.toBeCalled()
  })

  it('runs the defined handler - output validation error', async () => {
    const modifiedHandler = input()
    const ogHandle = modifiedHandler.test.handle = jest.fn((args:any):any => ({ z: args.a }))
    expect(await addValidationToContract(modifiedHandler).test.handle({ a: 'foo' }, auth, modifiedHandler.test))
      .toStrictEqual({
        code: 500,
        data: { z: 'foo' },
        errorType: 'Unexpected result from function',
        errors: {
          output: {
            b: { error: 'Value is not a string', value: undefined },
            z: { error: 'Key does not exist on validator', value: 'foo' }
          },
          result: 'fail'
        }
      })
    expect(ogHandle).toBeCalled()
  })

  it('runs the defined handler - output validation can be turned off', async () => {
    const modifiedHandler = input()
    const ogHandle = modifiedHandler.test.handle = jest.fn((args:any):any => ({ z: args.a }))
    expect(await addValidationToContract(modifiedHandler, false).test.handle({ a: 'foo' }, auth, modifiedHandler.test))
      .toStrictEqual({ result: { z: 'foo' } })
    expect(ogHandle).toBeCalled()
  })

  it('runs a fully formed error when the handler is undefined', async () => {
    const modifiedHandler = input()
    modifiedHandler.test.handle = undefined
    expect(await addValidationToContract(modifiedHandler).test.handle({ a: 'foo' }, auth, modifiedHandler.test))
      .toStrictEqual({
        code: 501,
        data: 'test',
        errorType: 'Not implemented',
        errors: ['Handler for test was not defined']
      })
  })

  it('can identify if contract returned an error', async () => {
    const modifiedHandler = input()
    modifiedHandler.test.handle = undefined
    const result = await addValidationToContract(modifiedHandler).test.handle({ a: 'foo' }, auth, modifiedHandler.test)
    if (isContractInError(result)) {
      expect(result.code).toBe(501)
    } else { throw new Error('Test failed') }
  })
})
