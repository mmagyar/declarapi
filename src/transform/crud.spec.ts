import { transform } from './crud'
import { CrudContract, CrudAuthAll, CrudAuthSome, AuthType } from './types'
describe('transform crud', () => {
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
    expect(output.results?.[0]?.method).toBe('get')
    expect(output).toMatchSnapshot()
  })

  it('generates full, parametric search option', async () => {
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
    expect(output.results?.[0]?.method).toBe('get')
    expect(output).toMatchSnapshot()
  })

  it('generates an id only get', async () => {
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
    expect(result.results?.find(x => x.method === 'put')).toBeUndefined()
    expect(result.results?.find(x => x.method === 'patch')).toBeUndefined()
    expect(result.results?.find(x => x.method === 'get')).toBeTruthy()
    expect(result.results?.find(x => x.method === 'post')).toBeTruthy()
    expect(result.results?.find(x => x.method === 'delete')).toBeTruthy()
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
    expect(result.results?.find(x => x.method === 'put')).toBeTruthy()
    expect(result.results?.find(x => x.method === 'patch')).toBeTruthy()
    expect(result.results?.find(x => x.method === 'get')).toBeUndefined()
    expect(result.results?.find(x => x.method === 'post')).toBeUndefined()
    expect(result.results?.find(x => x.method === 'delete')).toBeUndefined()
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
    expect(result).toMatchSnapshot()
  })

  it('accpets regex validated id', async () => {
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
    expect(result.results?.find(x => x.method === 'patch')?.arguments).toStrictEqual({
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
    expect(resultAuthSome.results?.find(x => x.method === 'get')?.authentication).toStrictEqual(false)
    const authSomeOtherMethods = resultAuthSome.results?.filter(x => x.method !== 'get') || []
    expect(authSomeOtherMethods).toHaveLength(4)
    authSomeOtherMethods.forEach(x => expect(x.authentication).toStrictEqual(['admin']))

    const resultAuth = await transform(withAuth({ get: false, post: true, put: ['owner'], delete: ['admin'] }))
    expect(resultAuth.results?.find(x => x.method === 'get')?.authentication).toStrictEqual(false)
    expect(resultAuth.results?.find(x => x.method === 'post')?.authentication).toStrictEqual(true)
    expect(resultAuth.results?.find(x => x.method === 'put')?.authentication).toStrictEqual(['owner'])
    expect(resultAuth.results?.find(x => x.method === 'delete')?.authentication).toStrictEqual(['admin'])
  })

  it('does not required user to post when user auth is set globally', async () => {
    const auth = ['admin', { userId: 'ownerId' }]
    const withAuth: (auth? : AuthType | CrudAuthAll | CrudAuthSome) => CrudContract =
     (auth: AuthType | CrudAuthAll | CrudAuthSome = true) => ({
       name: 'test',
       authentication: auth,
       dataType: {
         id: 'string',
         notAnId: 'boolean'
       }
     })

    const stringAllRole = (await transform(withAuth(['aUserRole']))).results || []
    expect(stringAllRole).toHaveLength(5)
    stringAllRole.forEach(x => expect(x.authentication).toStrictEqual(['aUserRole']))

    const boolAll = (await transform(withAuth(true))).results || []
    expect(boolAll).toHaveLength(5)
    boolAll.forEach(x => expect(x.authentication).toStrictEqual(true))

    const resultAuth = await transform(withAuth(auth))
    expect(resultAuth.results?.find(x => x.method === 'get')?.authentication).toStrictEqual(auth)
    expect(resultAuth.results?.find(x => x.method === 'post')?.authentication).toStrictEqual(true)
    expect(resultAuth.results?.find(x => x.method === 'put')?.authentication).toStrictEqual(auth)
    expect(resultAuth.results?.find(x => x.method === 'delete')?.authentication).toStrictEqual(auth)
  })
})
