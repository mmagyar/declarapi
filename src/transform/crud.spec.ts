import { transform } from './crud'
import { CrudContract, CrudAuthAll, CrudAuthSome } from './types'
describe('transform crud', () => {
  it('id must be present on input', async () => {
    const resultErr = await transform({ name: 'test', authentication: false, dataType: { notId: 'string' } })
    expect(resultErr).toStrictEqual({
      type: 'error',
      errors: 'Field with the name set for idFieldName: id does not exist in the data declaration'
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

  it('generates a full search option', async () => {
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

  it('returns an object with an error message on invalid id name', async () => {
    const input:CrudContract = {
      name: 'test',
      idFieldName: 'notAnId',
      authentication: false,
      dataType: {
        id: 'string',
        notAnId: 'boolean'
      },
      search: { customSearchField: 'string' }
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
    expect(result.errors).toStrictEqual([{ dataPath: '', keyword: 'additionalProperties', message: 'should NOT have additional properties', params: { additionalProperty: 'authenticationz' }, schemaPath: '#/additionalProperties' }])
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
})
