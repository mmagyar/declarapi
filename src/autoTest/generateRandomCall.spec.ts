import { generateRandomCall } from './generateRandomCall'
import { ContractType } from '../globalTypes'
describe('generateRandomCall', () => {
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
    generateRandomCall(input()).catch(x => {
      expect(x).toHaveProperty('message', 'handle must be defined to call it with randomly generated arguments')
    })
  })

  it('calls handle with randomly generated, arguments that conform to the schema', async () => {
    expect.assertions(5)

    const data:any = input()
    data.handle = jest.fn((input) => {
      expect(typeof input.myNumber).toBe('number')
      expect(typeof input.myString).toBe('string')
      expect(Object.keys(input)).toHaveLength(3)
      return 'done'
    })
    expect(await generateRandomCall(data)).toBe('done')
    expect(data.handle).toBeCalledTimes(1)
  })
})
