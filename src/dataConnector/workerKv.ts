import { KVList, ResponseMeta, KV, ValueType } from './abstractKv'
import FormData from 'form-data'

import fetch, { Response, RequestInfo, RequestInit } from 'node-fetch'
import { RequestHandlingError } from '../RequestHandlingError'
const minInterval = 100
const delay = async (time = 100) => new Promise((resolve) => setTimeout(() => resolve(), time))
let lastCall = Date.now()
const fetchLimited = async (
  url: RequestInfo,
  init?: RequestInit
): Promise<Response> => {
  const now = Date.now()
  if (lastCall + minInterval > now) {
    await delay(lastCall + minInterval - now)
  }
  lastCall = Date.now()
  return fetch(url, init)
}

const fetchWithThrow = async (
  url: RequestInfo,
  init?: RequestInit,
  throwOnKeyNotFound: boolean = true
): Promise<any> => {
  const fetched = fetchLimited(url, init)
  const [errorCode, result]:[number, ResponseMeta & {result:ValueType}] =
  await fetched.then(async x => [x.status, await x.json()])

  if (!result.success) {
    console.log(result.errors, result, errorCode, url, init)
    if (!throwOnKeyNotFound && errorCode === 404 && result.errors.find(x => x.code === 10009)) {
      return undefined
    }
    throw new RequestHandlingError(JSON.stringify(result?.errors?.length === 1 ? result.errors[0] : result.errors), errorCode)
  }
  return result
}

// const errorCodes = {
//   10001: 'service temporarily unavailable',
//   10002: 'missing CF-Ray header',
//   10003: 'missing account public ID',
//   10004: 'missing account tag',
//   10005: 'URL parameter account tag does not match JWT account tag',
//   10006: 'malformed account tag',
//   10007: 'malformed page argument',
//   10008: 'malformed per_page argument',
//   10009: 'key not found',
//   10010: 'malformed namespace',
//   10011: 'malformed namespace ID',
//   10012: 'malformed value',
//   10013: 'namespace not found',
//   10014: 'namespace already exists',
//   10015: 'missing account internal ID',
//   10016: 'malformed account internal ID',
//   10018: 'too many namespaces in this account',
//   10019: 'missing title',
//   10021: 'this namespace does not support the list-keys endpoint',
//   10022: 'too many requests',
//   10024: 'payload too large',
//   10025: 'endpoint does not exist',
//   10026: 'not entitled',
//   10028: 'invalid limit argument',
//   10029: 'invalid request',
//   10030: 'key too long',
//   10033: 'invalid expiration',
//   10034: 'invalid expiration ttl',
//   10035: 'this namespace does not support the bulk endpoint',
//   10037: 'the user lacks the permissions to perform this operation',
//   10038: 'this namespace does not support the list-keys prefix parameter',
//   10041: 'invalid "list keys" cursor',
//   10042: 'illegal key name',
//   10043: 'invalid order',
//   10044: 'invalid direction',
//   10045: 'deprecated endpoint',
//   10046: 'too many bulk requests',
//   10047: 'invalid metadata'
// }
export const workerKv = (): KV => {
  const accountIdentifier = '0de581be8fc7411dc7c3d016e152b47c'
  const namespaceIdentifier = 'bc9d1a4d70e1410f8d60a0393a39efd9'
  const headers = ({
    Authorization: 'Bearer UhwRdwQVOtfmf62UZE8R1cdSGDJpmPDrJOnK6l_r'
  })
  const baseUrl = 'https://api.cloudflare.com/client/v4'
  const namespaced = `${baseUrl}/accounts/${accountIdentifier}/storage/kv/namespaces/${namespaceIdentifier}`

  const list = async (limit?: number, cursor?: string, prefix?: string):Promise<KVList> => {
    const params = []
    if (limit)params.push(`limit=${limit}`)
    if (cursor)params.push(`cursor=${cursor}`)
    if (prefix)params.push(`prefix=${prefix}`)

    const url = `${namespaced}/keys${params.length ? '?' + params.join('&') : ''}`

    return fetchWithThrow(url, { headers })
  }

  const get = async (key:string) : Promise<ValueType | undefined> =>
    fetchWithThrow(`${namespaced}/values/${key}`, { headers }).then(x => x.result)

  const put = async (key:string, value:ValueType | {value:ValueType, metadata: any}, expiration?: number, expirationType: 'time' | 'ttl' = 'time'): Promise<ResponseMeta> => {
    const form = new FormData()

    if (typeof value === 'object') {
      form.append('metadata', JSON.stringify(value.metadata))
      form.append('value', value.value)
    } else {
      form.append('value', value)
    }

    const params = []
    if (expiration && expirationType === 'time')params.push(`expiration=${expiration}`)
    else if (expiration)params.push(`expiration_ttl=${expiration}`)

    const url = `${namespaced}/values/${key}${params.length ? '?' + params.join('&') : ''}`

    return fetchWithThrow(url, {
      headers: { ...headers, ...form.getHeaders() },
      method: 'PUT',
      body: form
    })
  }

  const destroy = async (key:string | string[]):Promise<ResponseMeta> => {
    if (Array.isArray(key)) {
      return fetchWithThrow(`${namespaced}/bulk/`, {
        headers: { ...headers, 'Content-Type': 'application/json' },
        method: 'DELETE',
        body: JSON.stringify(key)
      })
    }

    return fetchWithThrow(`${namespaced}/values/${key}`, { headers, method: 'DELETE' })
  }

  return { list, get, put, destroy }
}

export default workerKv
