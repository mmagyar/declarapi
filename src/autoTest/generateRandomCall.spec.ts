import { generateRandomCall } from './generateRandomCall'
import { } from 'declarapi-runtime'
import { validate } from 'yaschva'
import { Expressable } from 'declarapi-runtime/registerRestMethods'
describe('generateRandomCall', () => {
  const auth = { }
  const input = ():Expressable => ({
    method: 'POST',
    route: '/',
    handle: jest.fn(),
    handler: jest.fn(),
    contract: {
      name: 'test',
      type: 'POST',
      authentication: false,
      manageFields: {},
      arguments: {
        myString: 'string',
        myNumber: 'number',
        myRegex: { $string: { regex: '\\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,}\\b' } }
      },
      returns: {}
    }
  })
  it('will fail if handle is missing', async () => {
    expect.assertions(1)
    const data = input()
    await generateRandomCall(data.handle, data.contract, auth).catch(x => {
      expect(x).toHaveProperty('message', 'Random data generation returned with error: undefined, undefined')
    })
  })

  it('calls handle with randomly generated, arguments that conform to the schema', async () => {
    expect.assertions(7)

    const data:any = input()
    let handlerData:any
    data.handle = jest.fn((input) => {
      expect(typeof input.myNumber).toBe('number')
      expect(typeof input.myString).toBe('string')
      expect(Object.keys(input)).toHaveLength(3)
      handlerData = input
      return { response: 'done', code: 200 }
    })
    const result = await generateRandomCall(data.handle, data.contract, auth)
    expect(result.output).toBe('done')
    expect(result.generatedInput).toStrictEqual(handlerData)
    expect(data.handle).toBeCalledTimes(1)
    expect(validate(data.contract.arguments, result.generatedInput)).toHaveProperty('result', 'pass')
  })

  it('handle can return falsy value', async () => {
    expect.assertions(1)
    const data:any = input()
    data.handle = jest.fn(() => false)
    await generateRandomCall(data.handle, data.contract, auth).catch(x => {
      expect(x).toHaveProperty('message', 'Random data generation returned with error: undefined, undefined')
    })
  })

  it('handle can return error code', async () => {
    expect.assertions(1)
    const data:any = input()
    data.handle = jest.fn(() => ({ code: 401 }))
    await generateRandomCall(data.handle, data.contract, auth).catch(x => {
      expect(x).toHaveProperty('message', 'Random data generation returned with error: 401, undefined')
    })
  })
})
