import { transform } from './crud.js'
import { CrudContract, CrudAuthAll, CrudAuthSome, AuthType, Output } from './types.js'
describe('transform crud', () => {
  const getArgs = (result: Output, method:string) => {
    const res = result.results?.find(x => x.method === method)?.arguments
    if (!res) throw new Error(`Method not found ${method}`)
    return res
  }

  const getReturns = (result: Output, method:string) => {
    const res = result.results?.find(x => x.method === method)?.returns
    if (!res) throw new Error(`Method not found ${method}`)
    return res
  }

  it('id must be present on input', async () => {
    const resultErr = await transform({ name: 'test', authentication: false, dataType: { notId: 'string' } })
    expect(resultErr).toStrictEqual({
      type: 'error',
      errors: 'id field does not exist in the data declaration'
    })

    const result = await transform({
      name: 'test',
      authentication: false,
      dataType: { id: 'string', notId: 'string' }
    })
    expect(result).toHaveProperty('type', 'result')
    expect(result).toHaveProperty('results')
    expect(result.results).toHaveLength(5)
  })

  it('does not generate arguments for get is search is not set', async () => {
    const input:CrudContract = {
      name: 'test',
      authentication: false,
      dataType: {
        id: 'string',
        myNumber: 'number',
        myString: 'string'
      }
    }

    const output = await transform(input)
    expect(output.results?.[0]?.arguments).toStrictEqual({})
    expect(output.results?.[0]?.method).toBe('GET')
    // expect(output).toMatchSnapshot()
  })

  it.skip('generates full, parametric search option', async () => {
    const input:CrudContract = {
      name: 'test',
      authentication: false,
      dataType: {
        id: 'string',
        myNumber: 'number',
        myString: 'string'
      },
      search: 'full'
    }
    expect(await transform(input)).toMatchSnapshot()
  })

  it('generates a full text search search option', async () => {
    const input:CrudContract = {
      name: 'test',
      authentication: false,
      dataType: {
        id: 'string',
        myNumber: 'number',
        myString: 'string'
      },
      search: 'textSearch'
    }

    const output = await transform(input)
    expect(output.results?.[0]?.arguments).toStrictEqual({
      id: ['string', { $array: 'string' }, '?'],
      search: ['string', '?']
    })
    expect(output.results?.[0]?.method).toBe('GET')
    // expect(output).toMatchSnapshot()
  })

  it.skip('generates an id only get', async () => {
    const input:CrudContract = {
      name: 'test',
      authentication: false,
      dataType: {
        id: 'string',
        myNumber: 'number',
        myString: 'string'
      },
      search: 'idOnly'
    }

    expect(await transform(input)).toMatchSnapshot()
  })

  it('does not generate methods that are disabled ver 1', async () => {
    const input:CrudContract = {
      name: 'test',
      authentication: false,
      methods: {
        put: false,
        patch: false
      },
      dataType: {
        id: 'string',
        myNumber: 'number',
        myString: 'string'
      },
      search: 'idOnly'
    }

    const result = await transform(input)
    expect(result.results).toHaveLength(3)
    expect(result.results?.find(x => x.method === 'PUT')).toBeUndefined()
    expect(result.results?.find(x => x.method === 'PATCH')).toBeUndefined()
    expect(result.results?.find(x => x.method === 'GET')).toBeTruthy()
    expect(result.results?.find(x => x.method === 'POST')).toBeTruthy()
    expect(result.results?.find(x => x.method === 'DELETE')).toBeTruthy()
  })

  it('does not generate methods that are disabled ver 2', async () => {
    const input:CrudContract = {
      name: 'test',
      authentication: false,
      methods: {
        get: false,
        post: false,
        delete: false
      },
      dataType: {
        id: 'string',
        myNumber: 'number',
        myString: 'string'
      },
      search: 'idOnly'
    }

    const result = await transform(input)
    expect(result.results).toHaveLength(2)
    expect(result.results?.find(x => x.method === 'PUT')).toBeTruthy()
    expect(result.results?.find(x => x.method === 'PATCH')).toBeTruthy()
    expect(result.results?.find(x => x.method === 'GET')).toBeUndefined()
    expect(result.results?.find(x => x.method === 'POST')).toBeUndefined()
    expect(result.results?.find(x => x.method === 'DELETE')).toBeUndefined()
  })

  it('generates a custom arguments parameters for get ', async () => {
    const input:CrudContract = {
      name: 'test',
      authentication: false,
      dataType: {
        id: 'string',
        myNumber: 'number',
        myString: 'string'
      },
      search: { customSearchField: 'string' }
    }
    const result = await transform(input)
    expect(result.results?.[0]?.arguments?.customSearchField).toEqual('string')
    // expect(result).toMatchSnapshot()
  })

  it('accepts regex validated id', async () => {
    const input:CrudContract = {
      name: 'test',
      authentication: false,
      dataType: {
        id: { $string: { regex: '[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89aAbB][a-f0-9]{3}-[a-f0-9]{12}' } },
        notAnId: 'boolean'
      },
      search: 'idOnly'
    }
    const output = await transform(input)
    expect(output.results?.[0]?.arguments).toStrictEqual(
      {
        id: [
          { $string: { regex: '[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89aAbB][a-f0-9]{3}-[a-f0-9]{12}' } },
          { $array: { $string: { regex: '[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89aAbB][a-f0-9]{3}-[a-f0-9]{12}' } } },
          '?'
        ]
      }
    )
    expect(output.results).toHaveLength(5)
  })

  it('returns an object with an error message on invalid id type', async () => {
    const input:CrudContract = {
      name: 'test',
      authentication: false,
      dataType: {
        id: 'number',
        notAnId: 'boolean'
      }
    }
    const result = await transform(input)
    expect(result.errors).toEqual('Type of id field must be string')
  })

  it('returns an object with an error message on validation error', async () => {
    const input: any = {
      name: 'test',
      authenticationz: false,
      dataType: {
        id: 'string',
        notAnId: 'boolean'
      }
    }
    const result = await transform(input)
    expect(result.errors).toHaveLength(2)
    expect(result.errors?.[0]).toStrictEqual({ dataPath: '', keyword: 'additionalProperties', message: 'should NOT have additional properties', params: { additionalProperty: 'authenticationz' }, schemaPath: '#/additionalProperties' })
  })

  it('makes all parameters optional for patch', async () => {
    const input: CrudContract = {
      name: 'test',
      authentication: false,
      dataType: {
        id: 'string',
        notAnId: ['boolean', '?'],
        singleElementArrayType: ['string'],
        obj: { a: 'string', b: 'number' },
        obj2: { a: ['string', '?'], b: ['number', '?'] },
        duoType: ['boolean', 'number']
      }
    }
    const result = await transform(input)
    expect(result.results?.find(x => x.method === 'PATCH')?.arguments).toStrictEqual({
      id: 'string',
      notAnId: ['boolean', '?'],
      singleElementArrayType: ['string', '?'],
      obj: [{ a: 'string', b: 'number' }, '?'],
      obj2: [{ a: ['string', '?'], b: ['number', '?'] }, '?'],
      duoType: ['boolean', 'number', '?']
    })
  })

  it('supports different auth protocols', async () => {
    const withAuth: (auth? : string[] | boolean | CrudAuthAll | CrudAuthSome) => CrudContract =
     (auth: string[] | boolean | CrudAuthAll | CrudAuthSome = true) => ({
       name: 'test',
       authentication: auth,
       dataType: {
         id: 'string',
         notAnId: 'boolean'
       }
     })

    expect((await transform(withAuth(false))).results?.every(x => x.authentication === false)).toBeTruthy()
    expect((await transform(withAuth(true))).results?.every(x => x.authentication === true)).toBeTruthy()

    const stringAllRole = (await transform(withAuth(['aUserRole']))).results || []
    expect(stringAllRole).toHaveLength(5)
    stringAllRole.forEach(x => expect(x.authentication).toStrictEqual(['aUserRole']))

    const resultAuthSome = await transform(withAuth({ get: false, modify: ['admin'] }))
    expect(resultAuthSome.results?.find(x => x.method === 'GET')?.authentication).toStrictEqual(false)
    const authSomeOtherMethods = resultAuthSome.results?.filter(x => x.method !== 'GET') || []
    expect(authSomeOtherMethods).toHaveLength(4)
    authSomeOtherMethods.forEach(x => expect(x.authentication).toStrictEqual(['admin']))

    const resultAuth = await transform(withAuth({ get: false, post: true, put: ['owner'], delete: ['admin'] }))
    expect(resultAuth.results?.find(x => x.method === 'GET')?.authentication).toStrictEqual(false)
    expect(resultAuth.results?.find(x => x.method === 'POST')?.authentication).toStrictEqual(true)
    expect(resultAuth.results?.find(x => x.method === 'PUT')?.authentication).toStrictEqual(['owner'])
    expect(resultAuth.results?.find(x => x.method === 'DELETE')?.authentication).toStrictEqual(['admin'])
  })

  it('does not required user to post when user auth is set globally', async () => {
    const auth = ['admin', { createdBy: true }]
    const withAuth: (auth? : AuthType | CrudAuthAll | CrudAuthSome) => CrudContract =
     (auth: AuthType | CrudAuthAll | CrudAuthSome = true) => ({
       name: 'test',
       authentication: auth,
       dataType: {
         id: 'string',
         notAnId: 'boolean',
         createdBy: 'string'
       }
     })

    const stringAllRole = (await transform(withAuth(['aUserRole']))).results || []
    expect(stringAllRole).toHaveLength(5)
    stringAllRole.forEach(x => expect(x.authentication).toStrictEqual(['aUserRole']))

    const boolAll = (await transform(withAuth(true))).results || []
    expect(boolAll).toHaveLength(5)
    boolAll.forEach(x => expect(x.authentication).toStrictEqual(true))

    const resultAuth = await transform(withAuth(auth))
    expect(resultAuth.results?.find(x => x.method === 'GET')?.authentication).toStrictEqual(auth)
    expect(resultAuth.results?.find(x => x.method === 'POST')?.authentication).toStrictEqual(true)
    expect(resultAuth.results?.find(x => x.method === 'PUT')?.authentication).toStrictEqual(auth)
    expect(resultAuth.results?.find(x => x.method === 'DELETE')?.authentication).toStrictEqual(auth)
  })

  describe('manageFields', () => {
    const schema = () => ({
      name: 'test',
      authentication: false,
      manageFields: { createdBy: true },
      dataType: {
        id: 'string',
        notAnId: 'boolean'
      }
    })
    it('returns error when manageFields createdBy is set to true, but the field is missing', async () => {
      const result = await transform(schema())

      expect(result).toHaveProperty('type', 'error')
      expect(result).toHaveProperty('errors', 'managed field "createdBy" is not present on data type')
    })

    it('returns error when manageFields createdBy is set to true, but field is not declared as string', async () => {
      const input:any = schema()
      input.dataType.createdBy = 'number'
      const result = await transform(input)

      expect(result).toHaveProperty('type', 'error')
      expect(result).toHaveProperty('errors', 'managed field "createdBy" must be a string, current type :number')
    })
    it('does not generate error when createdBy managedField is a string', async () => {
      const input:any = schema()
      input.dataType.createdBy = 'string'

      expect(await transform(input)).toHaveProperty('type', 'result')

      input.dataType.createdBy = { $string: {} }
      expect(await transform(input)).toHaveProperty('type', 'result')
    })

    it('does not generate error when createdBy managedField is disabled', async () => {
      const input:any = schema()
      input.manageFields.createdBy = false
      input.dataType.createdBy = 'number'

      expect(await transform(input)).toHaveProperty('type', 'result')
    })

    it('removes managed field from post arguments', async () => {
      const input:any = schema()
      input.dataType.createdBy = 'string'

      const result = await transform(input)
      expect(result).toHaveProperty('type', 'result')

      expect(getReturns(result, 'GET').$array).toHaveProperty('createdBy', 'string')

      expect(getArgs(result, 'POST')).not.toHaveProperty('createdBy')
      expect(getReturns(result, 'POST')).toHaveProperty('createdBy', 'string')

      expect(getArgs(result, 'PUT')).not.toHaveProperty('createdBy')
      expect(getReturns(result, 'PUT')).toHaveProperty('createdBy', 'string')

      expect(getArgs(result, 'PATCH')).not.toHaveProperty('createdBy')
      expect(getReturns(result, 'PATCH')).toHaveProperty('createdBy', 'string')

      expect(getArgs(result, 'DELETE')).not.toHaveProperty('createdBy')
      expect(getReturns(result, 'DELETE').$array).toHaveProperty('createdBy', 'string')
    })
  })
})
