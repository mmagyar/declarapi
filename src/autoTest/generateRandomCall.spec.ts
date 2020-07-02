import { generateRandomCall } from './generateRandomCall'
import { ContractType } from '../globalTypes'
import { validate } from 'yaschva'
describe('generateRandomCall', () => {
  const auth = { }
  const input = ():ContractType<{}, {}> => ({
    name: 'test',
    type: 'post',
    authentication: false,
    arguments: {
      myString: 'string',
      myNumber: 'number',
      myRegex: { $string: { regex: '\\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,}\\b' } }
    },
    returns: {}
  })
  it('will fail if handle is missing', async () => {
    expect.assertions(1)
    generateRandomCall(input(), auth).catch(x => {
      expect(x).toHaveProperty('message', 'handle must be defined to call it with randomly generated arguments')
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
      return 'done'
    })
    const result = await generateRandomCall(data, auth)
    expect(result.output).toBe('done')
    expect(result.generatedInput).toStrictEqual(handlerData)
    expect(data.handle).toBeCalledTimes(1)
    expect(validate(data.arguments, result.generatedInput)).toHaveProperty('result', 'pass')
  })
})
