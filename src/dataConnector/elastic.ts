import { Client, ClientOptions } from '@elastic/elasticsearch'
import { v4 as uuid } from 'uuid'
import { HandlerAuth } from '../globalTypes'
import { RequestHandlingError } from '../RequestHandlingError'

let clientInstance: Client | undefined
export const client = () => clientInstance || init()
export const destroyClient = () => {
  clientInstance = undefined
}
export const init = () => {
  const node = process.env.ELASTIC_HOST
  const username = process.env.ELASTIC_USER_NAME
  const password = process.env.ELASTIC_PASSWORD
  const apiKey = process.env.ELASTIC_API_KEY
  const apiId = process.env.ELASTIC_API_ID
  const unauthenticated = process.env.ELASTIC_UNAUTHENTICATED

  const setup: ClientOptions = { node }

  if (username && password) {
    setup.auth = { username, password }
  } else if (apiKey) {
    setup.auth = apiId ? { apiKey: { id: apiId, api_key: apiKey } } : { apiKey }
  } else if (!unauthenticated) {
    console.warn('Elasticsearch api credentials are not set')
  }

  clientInstance = new Client(setup)
  return clientInstance
}

export const info = () => client().info()
type UserIdObject = {userId: string}
export const defaultSize = 1000
const authorizedByPermission = (auth:HandlerAuth) =>
  typeof auth.authentication === 'boolean' ||
  auth.authentication.some(x => (auth.permissions || []).some(y => x === y))

const getUserIdFields = (auth:HandlerAuth):string[] => (Array.isArray(auth.authentication) &&
  auth.authentication.filter((x:any):x is UserIdObject => x.userId).map(x => x.userId)) || []

const filterToAccess = (input:any[], auth:HandlerAuth):any[] => authorizedByPermission(auth) ? input : input.filter((x:any) => getUserIdFields(auth).some(y => x[y] === auth.sub))

export const get = async <T extends object>(
  indexName: string,
  auth:HandlerAuth,
  id?: string | string[] | null,
  search?: string | null
): Promise<T[]> => {
  const index = indexName.toLocaleLowerCase()

  const userIdFilter: any = {
    bool: {
      should: getUserIdFields(auth).map(userIdField => {
        const r:any = { term: { } }
        r[userIdField] = [auth.sub]
        return r
      })
    }
  }

  if (Array.isArray(id)) {
    const { body: { docs } } = await client().mget({ index, body: { ids: id } })
    return filterToAccess(docs.map((x: any) => x._source), auth)
  } else if (id) {
    const { body: { _source } } = await client().get({ index, id })
    return filterToAccess([_source], auth)
  } else if (search) {
    const queryString = {
      query: {
        bool: {
          must: [{ simple_query_string: { query: search } }]
        }
      }

    }
    if (!authorizedByPermission(auth)) queryString.query.bool.must.push(userIdFilter)
    const all = await client().search({ index, body: queryString, size: defaultSize })
    return new Array(all.body.hits.hits).flatMap((y: any) => y.map((x: any) => x._source))
  }

  const searchAll:any = { index, size: defaultSize }
  if (!authorizedByPermission(auth)) { searchAll.body = { query: userIdFilter } }
  const all = await client().search(searchAll)
  const result = new Array(all.body.hits.hits).flatMap((y: any) => y.map((x: any) => x._source))
  return result
}
export const post = async <T extends {[key: string]: any}>(index: string, auth:HandlerAuth, body: T):
Promise<T & any> => {
  if (!authorizedByPermission(auth)) throw new RequestHandlingError('User not authorized to POST', 403)
  const id = body.id || uuid()
  const newBody: any = { ...body }
  newBody.id = id
  getUserIdFields(auth).forEach(x => { newBody[x] = auth.sub })
  await client().create({
    id,
    index: index.toLocaleLowerCase(),
    refresh: 'wait_for',
    body: newBody
  })

  return newBody
}

export const del = async (index: string, auth:HandlerAuth, id: string|string[]): Promise<any> => {
  if (Array.isArray(id)) return Promise.all(id.map(x => del(index, auth, x)))
  const result = await get(index, auth, id)
  if (!result) {
    throw new RequestHandlingError('User has no right to delete this', 403)
  }
  await client().delete(
    { index: index.toLocaleLowerCase(), id, refresh: 'wait_for' })
  return result
}

export const patch = async <T extends object, K extends object>(index: string, auth:HandlerAuth, body: T, id: string
): Promise<K> => {
  const result = await get(index, auth, id)
  if (!result || result.length === 0) {
    throw new RequestHandlingError('User has no right to patch this', 403)
  }
  await client().update(
    {
      index: index.toLocaleLowerCase(),
      refresh: 'wait_for',
      id,
      body: { doc: body }
    })
  return (await get(index, auth, id) as any)[0]
}
