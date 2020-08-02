import { v4 as uuid } from 'uuid'
import { HandlerAuth, ContractType } from '../globalTypes'
import { RequestHandlingError } from '../RequestHandlingError'
import { ManageableFields } from '../transform/types'
import { KV, memoryKV, KVList, SuperMetaData } from './memoryKv'
import Fuse from 'fuse.js'
let clientInstance: KV | undefined
export const client = () => clientInstance || init()
export const destroyClient = () => {
  clientInstance = undefined
}
export const init = () => {
  clientInstance = memoryKV()
  return clientInstance
}

const authorizedByPermission = (auth:HandlerAuth) =>
  typeof auth.authentication === 'boolean' ||
  auth.authentication.some(x => (auth.permissions || []).some(y => x === y))

const getUserIdFields = (fields:ManageableFields):string[] => Object.entries(fields).filter(x => x[1]).map(x => x[0])

const filterToAccess = (input:any[], auth:HandlerAuth, fields:ManageableFields):any[] =>
  authorizedByPermission(auth) ? input : input.filter((x:any) => getUserIdFields(fields).some(y => x[y] === auth.sub))
const keyId = (index:string, id:string):string => `${index}:records:${id}`
export const get = async (
  index: string,
  contract: ContractType<any, any>,
  auth:HandlerAuth,
  id?: string | string[] | null,
  search?: string | null
): Promise<any> => {
  if (Array.isArray(id)) {
    if (id.length === 0) return []
    const docs = (await Promise.all(id.map(x => client().get(keyId(index, x)))))
      .filter(x => x !== undefined)
    return filterToAccess(docs, auth, contract.manageFields)
  } else if (id) {
    const result = await client().get(keyId(index, id))
    if (!result) throw new RequestHandlingError('Key not found', 404)
    return filterToAccess([result], auth, contract.manageFields)
  } else if (search) {
    const cacheId = `${index}:$Al'kesh:${auth.sub}`
    let cached: object[]| string| undefined = await client().get(cacheId)
    if (!cached) {
      cached = await get(index, contract, auth)
      const value = JSON.stringify(cached)
      await client().put(cacheId, { value, metadata: { type: 'cache' } }, 120, 'ttl')
    } else {
      cached = JSON.parse(cached)
    }
    if (!cached || cached.length === 0) return []
    // TODO we may need to pass the contract here, to make sure we don't miss any fields
    const opts :Fuse.IFuseOptions<object> = { keys: Object.keys((cached as any)[0]) }
    const fuse = new Fuse((cached as any), opts)
    const searched = fuse.search(search)
    return (searched.map(x => x.item) as any)
  }

  const accessAll = authorizedByPermission(auth)
  const listId : Promise<string|undefined>[] = []
  let cursor
  do {
    const result:KVList = await client().list(10, cursor, `${index}:records`)
    if (result.success) {
      result.result.forEach(async (x:SuperMetaData) => {
        // Maybe prefix key with user id instead?
        if (accessAll || (x.metadata as any)?.createdBy === auth.sub) {
          listId.push(client().get(x.name))
        }
      })
    }
    cursor = result.result_info.cursor
  } while (cursor)

  return (await Promise.all(listId) as any).filter((x:any) => x !== undefined)
}

export const post = async <T extends {[key: string]: any}>(index: string, contract: ContractType<T, any>,
  auth:HandlerAuth, body: T):
Promise<T & any> => {
  if (!authorizedByPermission(auth)) throw new RequestHandlingError('User not authorized to POST', 403)
  const id = body.id || uuid()
  const newBody: any = { ...body }
  newBody.id = id

  const metadata:any = {}
  if (contract.manageFields.createdBy === true) {
    newBody.createdBy = auth.sub
    metadata.createdBy = auth.sub
  }
  if (await client().get(keyId(index, id))) throw new RequestHandlingError('Resource already exists', 409)
  // TODO returned without the full id, that contains the index, or maybe always remove the index when returning?
  await client().put(keyId(index, id), { value: newBody, metadata })

  return newBody
}

export const del = async (index: string, contract: ContractType<any, any>, auth:HandlerAuth, id: string|string[]): Promise<any> => {
  if (Array.isArray(id)) return (await Promise.all(id.map(x => del(index, contract, auth, x)))).map(x => x[0])
  const result = await get(index, contract, auth, id)
  if (!result || result.length === 0) {
    throw new RequestHandlingError('User has no right to delete this', 403)
  }

  await client().destroy(keyId(index, id))
  return result
}

export const patch = async <T extends object, K extends object>(index: string, contract: ContractType<T, K>, auth:HandlerAuth, body: T, id: string
): Promise<K> => {
  const result = await get(index, contract, auth, id)
  if (!result || result.length === 0) {
    throw new RequestHandlingError('User has no right to patch this', 403)
  }

  const newBody:any = { ...result[0] }
  for (const [key, value] of Object.entries(body)) {
    newBody[key] = value
  }

  const key = keyId(index, id)
  const meta:KVList = await client().list(1, undefined, key)

  await client().put(key, { value: newBody, metadata: meta.result[0].metadata })

  return (await get(index, contract, auth, id) as any)[0]
}

export const put = async <T extends object, K extends object>(index: string, contract: ContractType<T, K>, auth:HandlerAuth, body: T, id: string
): Promise<K> => {
  const result: any[] = await get(index, contract, auth, id)
  if (!result || result.length === 0) {
    throw new RequestHandlingError('User has no right to patch this', 403)
  }
  const newBody :any = { ...body }
  if (contract.manageFields.createdBy === true) {
    newBody.createdBy = result[0].createdBy
  }

  const key = keyId(index, id)
  const meta:KVList = await client().list(1, undefined, key)

  await client().put(key, { value: newBody, metadata: meta.result[0]?.metadata })

  return (await get(index, contract, auth, id) as any)[0]
}
