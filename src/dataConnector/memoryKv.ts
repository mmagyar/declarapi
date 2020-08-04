import { KVList, ResponseMeta, SuperMetaData, KV, ValueType } from './abstractKv'

export const memoryKV = (): KV => {
  const db = new Map<string, string>()
  const dbMeta = new Map<string, SuperMetaData>()

  const list = async (limit?: number, cursor?: string, prefix?: string):Promise<KVList> => {
    let currentCursor = ''
    let cursorFound = false
    const result = []
    for (const value of dbMeta.values()) {
      if (cursor && !cursorFound) {
        if (value.name === cursor) {
          cursorFound = true
        } else {
          continue
        }
      }
      if (limit && result.length === limit) {
        currentCursor = value.name
        break
      }

      if (!prefix || value.name.startsWith(prefix)) {
        result.push(value)
      }
    }
    return {
      success: true,
      errors: [],
      messages: [],
      result,
      result_info: {
        count: dbMeta.size,
        cursor: currentCursor
      }
    }
  }
  const get = async (key:string) : Promise<ValueType | undefined> => {
    return db.get(key)
  }
  const put = async (key:string, value:ValueType | {value:ValueType, metadata: any}, expiration?: number, expirationType: 'time' | 'ttl' = 'time'): Promise<ResponseMeta> => {
    let exp
    if (expiration) {
      exp = expirationType === 'time' ? expiration : (Math.round(Date.now() / 1000) + expiration)
    }

    if (typeof value === 'object') {
      db.set(key, value.value)
      dbMeta.set(key, { name: key, metadata: value.metadata, expiration: exp })
    } else {
      db.set(key, value)
      dbMeta.set(key, { name: key, metadata: {}, expiration: exp })
    }

    return {
      success: true,
      errors: [],
      messages: []
    }
  }
  const destroy = async (key:string | string[]):Promise<ResponseMeta> => {
    if (Array.isArray(key)) key.forEach(destroy)
    else {
      db.delete(key)
      dbMeta.delete(key)
    }
    return {
      success: true,
      errors: [],
      messages: []
    }
  }

  return { list, get, put, destroy }
}

export default memoryKV
