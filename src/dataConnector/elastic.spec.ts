import { init, post, del, client, patch, get, defaultSize, destroyClient, info } from './elastic'
import { Client } from '@elastic/elasticsearch'
import { ContractType } from '../globalTypes'
jest.mock('@elastic/elasticsearch', () => {
  class ClientMock {
    update = jest.fn()
    create = jest.fn()
    delete= jest.fn()
    info = jest.fn(() => 'info')
    search = jest.fn(() => {
      return {
        body: {
          hits: {
            hits: [
              { _source: { value: 'searchResult', id: '3' } },
              { _source: { value: 'searchResultX', id: '4' } }
            ]
          }
        }
      }
    })

    mget=jest.fn(() => (
      {
        body: {
          docs: [{ _source: { value: 'mget4', id: '4' } },
            { _source: { value: 'mget5', id: '5' } }]
        }
      }))

    get=jest.fn(() => (
      { body: { _source: { value: 'getmock', id: '2' } } }))
  }
  return { Client: ClientMock }
})

const isValidUUID = (input:string) => input.match(/^[0-9A-F]{8}-[0-9A-F]{4}-[4][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i
)
describe('elasticsearch data connector', () => {
  const oldEnv = process.env
  const oldConsoleWarn = console.warn
  const input: ()=> ContractType<{id?:string, value:string}, {b:string}> = () => ({
    arguments: { id: ['?', 'string'], value: 'string' },
    manageFields: {},
    name: 'test',
    returns: { b: 'string' },
    handle: async (obj) => ({ b: obj.value }),
    type: 'get',
    authentication: false
  })

  afterEach(() => {
    jest.clearAllMocks()
    console.warn = oldConsoleWarn
    process.env = oldEnv
    destroyClient()
  })

  beforeEach(() => {
    process.env = { ...oldEnv }
    delete process.env.ELASTIC_API_KEY
    delete process.env.ELASTIC_USER_NAME
    delete process.env.ELASTIC_PASSWORD
    console.warn = jest.fn()
  })

  describe('init', () => {
    it('warns if auth not set', () => {
      const result:Client = init()
      expect(result).toBeTruthy()
      expect(console.warn).toBeCalledTimes(1)
      expect(console.warn).toBeCalledWith('Elasticsearch api credentials are not set')
    })
    it('uses password if set', () => {
      process.env.ELASTIC_USER_NAME = 'elastic'
      process.env.ELASTIC_PASSWORD = 'elastic'
      const result:Client = init()

      expect(result).toBeTruthy()
      expect(console.warn).toBeCalledTimes(0)
    })

    it('uses api key if set, but no password', () => {
      process.env.ELASTIC_API_KEY = 'elastic'
      const result:Client = init()
      expect(result).toBeTruthy()
      expect(console.warn).toBeCalledTimes(0)
    })

    it('uses api key id if set, but no password', () => {
      process.env.ELASTIC_API_KEY = 'elastic'
      process.env.ELASTIC_API_ID = 'elastic'
      const result:Client = init()
      expect(result).toBeTruthy()
      expect(console.warn).toBeCalledTimes(0)
    })

    it('init runs', () => {
      const result:Client = init()
      expect(result).toBeTruthy()
      expect(client()).toBeTruthy()
    })
  })

  it('returns info', async () => {
    const result = await info()
    expect(result).toBe('info')
    expect(client().info).toBeCalled()
  })

  describe('get', () => {
    it('gets all when no id or search is provided', async () => {
      expect(await get('test', input(), { authentication: false })).toStrictEqual([{ id: '3', value: 'searchResult' }, { id: '4', value: 'searchResultX' }])
      expect(client().search).toHaveBeenCalledTimes(1)
      expect(client().search).toBeCalledWith({ index: 'test', size: defaultSize })
      expect(client().get).toHaveBeenCalledTimes(0)
    })

    it('gets by query when no id, but search is provided', async () => {
      expect(await get('test', input(), { authentication: false }, undefined, 'searchResult'))
        .toStrictEqual([{ id: '3', value: 'searchResult' }, { id: '4', value: 'searchResultX' }])
      expect(client().search).toHaveBeenCalledTimes(1)
      expect(client().search)
        .toBeCalledWith({
          index: 'test',
          body: { query: { bool: { must: [{ simple_query_string: { query: 'searchResult' } }] } } },
          size: 1000
        })

      expect(client().get).toHaveBeenCalledTimes(0)
    })

    it('gets by id when id is provided', async () => {
      expect(await get('test', input(), { authentication: false }, '2'))
        .toStrictEqual([{ id: '2', value: 'getmock' }])
      expect(client().get).toBeCalledWith({ index: 'test', id: '2' })
      expect(client().get).toHaveBeenCalledTimes(1)
      expect(client().search).toHaveBeenCalledTimes(0)
    })

    it('gets by array of ids ', async () => {
      expect(await get('test', input(), { authentication: false }, ['4', '5']))
        .toStrictEqual([{ id: '4', value: 'mget4' }, { id: '5', value: 'mget5' }])
      expect(client().mget).toBeCalledWith({ body: { ids: ['4', '5'] }, index: 'test' })
      expect(client().mget).toHaveBeenCalledTimes(1)
      expect(client().get).toHaveBeenCalledTimes(0)
      expect(client().search).toHaveBeenCalledTimes(0)
    })
  })

  describe('post', () => {
    it('post returns the saved value', async () => {
      expect(await post('test', input(), { authentication: false }, { id: '1', value: 'abc' }))
        .toStrictEqual({ id: '1', value: 'abc' })
      expect(client().create).toHaveBeenCalledTimes(1)
      expect(client().update).toHaveBeenCalledTimes(0)
    })

    it('post generated uuid, if id not given', async () => {
      const posted = await post('test', input(), { authentication: false }, { value: 'abc' })
      expect(posted.value).toBe('abc')
      expect(isValidUUID(posted.id)).toBeTruthy()
      expect(client().create).toHaveBeenCalledTimes(1)
    })
  })

  describe('del', () => {
    it('returns the deleted value', async () => {
      expect(await del('test', input(), { authentication: false }, '2'))
        .toStrictEqual([{ id: '2', value: 'getmock' }])
      expect(client().get).toHaveBeenCalledTimes(1)
      expect(client().delete).toHaveBeenCalledTimes(1)
    })

    it('returns the deleted values when multiple ids are deleted', async () => {
      expect(await del('test', input(), { authentication: false }, ['2', '3']))
        .toStrictEqual([{ id: '2', value: 'getmock' }, { id: '2', value: 'getmock' }])
      expect(client().get).toHaveBeenCalledTimes(2)
      expect(client().delete).toHaveBeenCalledTimes(2)
    })
  })

  it('can update / patch existing items, returns value read by get', async () => {
    expect(await patch('test', input(), { authentication: false }, { id: '1', value: 'testValue' }, '1'))
      .toStrictEqual({ id: '2', value: 'getmock' })
    expect(client().update).toHaveBeenCalledTimes(1)
    expect(client().create).toHaveBeenCalledTimes(0)
  })
})
