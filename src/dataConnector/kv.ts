import { v4 as uuid } from 'uuid'
import { HandlerAuth } from '../globalTypes'
import { RequestHandlingError } from '../RequestHandlingError'
import { mapFilter } from 'microtil'
import { ManageableFields } from '../transform/types'
import { KV, memoryKV, KVList, MetaData } from './memoryKv'

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

export const get = async <T extends object>(
  indexName: string,
  manageFields: ManageableFields,
  auth:HandlerAuth,
  id?: string | string[] | null,
  search?: string | null
): Promise<T[]> => {
  const index = indexName.toLocaleLowerCase()

  if (Array.isArray(id)) {
    if (id.length === 0) return []
    const docs = await Promise.all(id.map(x => client().get(x)))
    return filterToAccess(mapFilter(docs, (x: any) => x._source), auth, manageFields)
  } else if (id) {
    return filterToAccess([await client().get(id)], auth, manageFields)
  } else if (search) {
    // TODO prolly get all and search in js
  }

  const accessAll = authorizedByPermission(auth)
  const listId : Promise<string>[] = []
  let cursor
  do {
    const result:KVList = await client().list(10, cursor, index)
    if (result.success) {
      result.result.forEach((x:MetaData) => {
        // Maybe prefix key with user id instead?
        if (accessAll || (x.metadata as any)?.createdBy === auth.sub) {
          listId.push(client().get(x.name))
        }
      })
    }
    cursor = result.result_info.cursor
  } while (cursor)

  return (await Promise.all(listId) as any)
}

export const post = async <T extends {[key: string]: any}>(index: string, manageFields: ManageableFields, auth:HandlerAuth, body: T):
Promise<T & any> => {
  if (!authorizedByPermission(auth)) throw new RequestHandlingError('User not authorized to POST', 403)
  const id = body.id || uuid()
  const newBody: any = { ...body }
  newBody.id = id

  const metadata:any = {}
  if (manageFields.createdBy === true) {
    newBody.createdBy = auth.sub
    metadata.createdBy = auth.sub
  }

  await client().put(index.toLocaleLowerCase() + ':' + id, { value: newBody, metadata })

  return newBody
}

export const del = async (index: string, manageFields: ManageableFields, auth:HandlerAuth, id: string|string[]): Promise<any> => {
  if (Array.isArray(id)) return (await Promise.all(id.map(x => del(index, manageFields, auth, x)))).map(x => x[0])
  const result = await get(index, manageFields, auth, id)
  if (!result || result.length === 0) {
    throw new RequestHandlingError('User has no right to delete this', 403)
  }

  await client().destroy(index.toLocaleLowerCase() + ':' + id)
  return result
}

export const patch = async <T extends object, K extends object>(index: string, manageFields: ManageableFields, auth:HandlerAuth, body: T, id: string
): Promise<K> => {
  const result = await get(index, manageFields, auth, id)
  if (!result || result.length === 0) {
    throw new RequestHandlingError('User has no right to patch this', 403)
  }

  const newBody:any = { ...result }
  for (const [key, value] of Object.entries(body)) {
    newBody[key] = value
  }

  const key = index.toLocaleLowerCase() + ':' + id
  const meta:KVList = await client().list(1, undefined, key)

  await client().put(key, { value: newBody, metadata: meta.result[0] })

  return (await get(index, manageFields, auth, id) as any)[0]
}

export const put = async <T extends object, K extends object>(index: string, manageFields: ManageableFields, auth:HandlerAuth, body: T, id: string
): Promise<K> => {
  const result: any[] = await get(index, manageFields, auth, id)
  if (!result || result.length === 0) {
    throw new RequestHandlingError('User has no right to patch this', 403)
  }
  const newBody :any = { ...body }
  if (manageFields.createdBy === true) {
    newBody.createdBy = result[0].createdBy
  }

  const key = index.toLocaleLowerCase() + ':' + id
  const meta:KVList = await client().list(1, undefined, key)

  await client().put(key, { value: newBody, metadata: meta.result[0] })

  return (await get(index, manageFields, auth, id) as any)[0]
}
