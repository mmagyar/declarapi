import registerRestMethods, { reqType } from './registerRestMethods'
import { ContractWithValidatedHandler, ContractResult, ContractResultError, ContractResultSuccess } from './contractValidation'
describe('registerRestMethods', () => {
  const input = ():ContractWithValidatedHandler => ({
    test: {
      authentication: false,
      method: 'get',
      name: 'test',
      handle: async (data: { a: string }): Promise<ContractResult> =>
        ({ result: { ...data } })
    }
  })
  it('transforms correctly', () => {
    const result = registerRestMethods(input())
    expect(result[0].route).toBe('/api/test/:id?')
    expect(result[0].method).toBe('get')
    expect(typeof result[0].handler).toBe('function')
  })

  const reqMock = (
    query: {[key: string]: any} = {},
    body: {[key: string]: any} = {},
    id?: string,
    user? : {permissions?: string[]}
  ):reqType => ({ query, body, params: { id }, user })

  type ResultMockType = {
    jsonMock: jest.Mock<any, any>;
    statusMock: jest.Mock<{ json: jest.Mock<any, any>; }, []>;
    chainedMock: { status: jest.Mock<{ json: jest.Mock<any, any>; }, []>;
    };
}
  const resMock = ():ResultMockType => {
    const jsonMock = jest.fn()
    const statusMock = jest.fn(() => ({ json: jsonMock }))
    return {
      jsonMock,
      statusMock,
      chainedMock: { status: statusMock }
    }
  }

  const expectResult = (res: ResultMockType, status:number, output:any) => {
    expect(res.statusMock).toBeCalledWith(status)
    expect(res.jsonMock).toBeCalledWith(output)
  }
  it('params and query is optional', async () => {
    const result = registerRestMethods(input())
    const res = resMock()
    const req = reqMock({ a: 'sadf' })
    delete req.params
    delete req.query
    await result[0].handler(req, res.chainedMock)
    expectResult(res, 200, { })
  })

  describe('authentication handling', () => {
    it('happy path - no authentication', async () => {
      const res = resMock()
      await registerRestMethods(input())[0]
        .handler(reqMock({ a: 'sadf' }), res.chainedMock)
      expectResult(res, 200, { a: 'sadf' })
    })

    it('happy path - with simple authentication', async () => {
      const data = input()
      data.test.authentication = true
      const result = registerRestMethods(data)
      const res = resMock()
      const req = reqMock({ a: 'sadf' }, undefined, undefined, { permissions: [] })
      await result[0].handler(req, res.chainedMock)
      expectResult(res, 200, { a: 'sadf' })
    })

    it('happy path - with role authentication', async () => {
      const data = input()
      data.test.authentication = ['admin']
      const result = registerRestMethods(data)
      const res = resMock()
      const req = reqMock({ a: 'sadf' }, undefined, undefined, { permissions: ['admin'] })
      await result[0].handler(req, res.chainedMock)
      expectResult(res, 200, { a: 'sadf' })
    })

    it('auth failure - with simple authentication', async () => {
      const data = input()
      data.test.authentication = true
      const result = registerRestMethods(data)
      const res = resMock()
      await result[0].handler(reqMock({ a: 'sadf' }), res.chainedMock)
      expectResult(res, 401, {
        code: 401,
        data: { params: { id: undefined } },
        errorType: 'unauthorized',
        errors: ['Only logged in users can do this']
      })
    })

    it('auth failure - unauthenticated user with role authentication', async () => {
      const data = input()
      data.test.authentication = ['admin']
      const result = registerRestMethods(data)
      const res = resMock()
      const req = reqMock({ a: 'sadf' }, undefined, undefined, { permissions: ['user', ' moderator'] })

      await result[0].handler(req, res.chainedMock)
      expectResult(res, 401, {
        code: 401,
        data: { params: { id: undefined } },
        errorType: 'unauthorized',
        errors: ["You don't have permission to do this"]
      })
    })

    it('auth failure - user without admin role with role authentication', async () => {
      const data = input()
      data.test.authentication = ['admin']
      const result = registerRestMethods(data)
      const res = resMock()
      await result[0].handler(reqMock({ a: 'sadf' }), res.chainedMock)
      expectResult(res, 401, {
        code: 401,
        data: { params: { id: undefined } },
        errorType: 'unauthorized',
        errors: ["You don't have permission to do this"]
      })
    })
  })

  it('uses req.body for it\'s arguments on non get methods (post)', async () => {
    const data = input()
    data.test.method = 'post'
    const result = registerRestMethods(data)
    const res = resMock()
    await result[0].handler(reqMock(undefined, { a: 'sadf' }), res.chainedMock)
    expectResult(res, 201, { a: 'sadf' })
  })

  it('can get element by id from path', async () => {
    const res = resMock()
    await registerRestMethods(input())[0]
      .handler(reqMock({ a: 'sadf' }, undefined, '3'), res.chainedMock)
    expectResult(res, 200, { a: 'sadf', id: '3' })
  })

  it('can get element by id from query', async () => {
    const res = resMock()
    await registerRestMethods(input())[0]
      .handler(reqMock({ a: 'sadf', id: '3' }), res.chainedMock)
    expectResult(res, 200, { a: 'sadf', id: '3' })
  })

  it('can get element by id but if both query and path they must match', async () => {
    const res = resMock()
    await registerRestMethods(input())[0]
      .handler(reqMock({ a: 'sadf', id: '3' }, undefined, '3'), res.chainedMock)
    expectResult(res, 200, { a: 'sadf', id: '3' })

    const res2 = resMock()
    await registerRestMethods(input())[0]
      .handler(reqMock({ a: 'sadf', id: '3' }, undefined, '4'), res2.chainedMock)
    expectResult(res2, 400, {
      code: 400,
      data: { params: { id: '4' }, query: { a: 'sadf', id: '3' } },
      errorType: 'id mismatch',
      errors: ['Mismatch between the object Id in the body and the URL']
    })
  })

  it('handles when the handle function returns a contract error', async () => {
    const data = input()
    data.test.handle = async (): Promise<ContractResultError> =>
      ({ errorType: 'contractError', data: {}, code: 500, errors: ['Testing errors'] })
    const res = resMock()
    await registerRestMethods(data)[0]
      .handler(reqMock({ a: 'sadf' }), res.chainedMock)
    expectResult(res, 500, { code: 500, data: {}, errorType: 'contractError', errors: ['Testing errors'] })
  })

  describe('only returns one element if id is given', () => {
    const originalWarn = console.warn
    let consoleWarnMock = jest.fn()
    beforeEach(() => { consoleWarnMock = console.warn = jest.fn() })
    afterEach(() => { console.warn = originalWarn })

    it('extracts the first element if an array is returned', async () => {
      const data = input()
      data.test.handle = async (): Promise<ContractResultSuccess> =>
        ({ result: [{ a: 'el1' }] })
      const res = resMock()

      await registerRestMethods(data)[0]
        .handler(reqMock({ a: 'sadf', id: '3' }), res.chainedMock)
      expectResult(res, 200, { a: 'el1' })
      expect(consoleWarnMock).not.toBeCalled()
    })

    it('logs warning if an array with many elements is returned, ' +
      'returns only the first element', async () => {
      const data = input()
      data.test.handle = async (): Promise<ContractResultSuccess> =>
        ({ result: [{ a: 'el1' }, { a: 'el2' }] })
      const res = resMock()

      await registerRestMethods(data)[0]
        .handler(reqMock({ a: 'sadf', id: '3' }), res.chainedMock)
      expectResult(res, 200, { a: 'el1' })
      expect(consoleWarnMock)
        .toBeCalledWith('Results contained more than one entry for single return by id')
    })
  })

  describe('handles thrown exceptions', () => {
    it('handles simple error', async () => {
      const data = input()
      data.test.handle = async (): Promise<any> => { throw new Error('Err') }
      const res = resMock()

      await registerRestMethods(data)[0].handler(reqMock({ a: 'sadf' }), res.chainedMock)
      expectResult(res, 500,
        { code: 500, data: {}, errorType: 'exception', errors: ['Err'] })
    })

    it('handles error code on error object as status code', async () => {
      const data = input()

      data.test.handle = async (): Promise<any> => {
        const err:any = new Error('err')
        err.code = 503
        throw err
      }
      const res = resMock()

      await registerRestMethods(data)[0].handler(reqMock({ a: 'sadf' }), res.chainedMock)
      expectResult(res, 503,
        { code: 503, data: { code: 503 }, errorType: 'exception', errors: ['err'] })
    })

    it('correct out of range status code to 500', async () => {
      const data = input()

      data.test.handle = async (): Promise<any> => {
        const err:any = new Error('err')
        err.code = 703
        throw err
      }
      const res = resMock()

      await registerRestMethods(data)[0].handler(reqMock({ a: 'sadf' }), res.chainedMock)
      expectResult(res, 500,
        { code: 703, data: { code: 703 }, errorType: 'exception', errors: ['err'] })
    })

    it('handles thrown primitives', async () => {
      const test = async (thrown:any, dataOut: any) => {
        const data = input()

        data.test.handle = async (): Promise<any> => { throw thrown }
        const res = resMock()

        await registerRestMethods(data)[0].handler(reqMock({ a: 'sadf' }), res.chainedMock)
        expectResult(res, 500,
          { code: 500, data: dataOut, errorType: 'exception', errors: [undefined] })
      }
      await Promise.all([test('', ''), test(3, {}), test(null, null)])
    })
  })
})
