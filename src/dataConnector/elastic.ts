import { Client, ClientOptions } from '@elastic/elasticsearch'
import { v4 as uuid } from 'uuid'

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

  const setup: ClientOptions = { node }

  if (username && password) {
    setup.auth = { username, password }
  } else if (apiKey) {
    setup.auth = apiId ? { apiKey: { id: apiId, api_key: apiKey } } : { apiKey }
  } else {
    console.warn('Elasticsearch api credentials are not set')
  }

  clientInstance = new Client(setup)
  return clientInstance
}

export const info = () => client().info()

export const defaultSize = 1000
export const elasticGet = async <T extends object>(
  indexName: string, id?: string | string[] | null, search?: string | null
): Promise<T[]> => {
  const index = indexName.toLocaleLowerCase()
  if (Array.isArray(id)) {
    const { body: { docs } } = await client().mget({ index, body: { size: defaultSize, ids: id } })
    return docs.map((x: any) => x._source)
  } else if (id) {
    const { body: { _source } } = await client().get({ index, id })
    return [_source]
  } else if (search) {
    const all = await client().search({ index, q: search, size: defaultSize })
    return new Array(all.body.hits.hits).flatMap((y: any) => y.map((x: any) => x._source))
  }
  const all = await client().search({ index, size: defaultSize })
  return new Array(all.body.hits.hits).flatMap((y: any) => y.map((x: any) => x._source))
}
export const elasticPost = async <T extends {[key: string]: any}>(index: string, body: T, idFieldName: string):
Promise<T & any> => {
  const id = (body)[idFieldName] || uuid()
  const newBody: any = { ...body }
  newBody[idFieldName] = id
  await client().create({
    id,
    index: index.toLocaleLowerCase(),
    refresh: 'wait_for',
    body: newBody
  })

  return newBody
}

export const elasticDel = async (index: string, id: string|string[]): Promise<any> => {
  if (Array.isArray(id)) return Promise.all(id.map(x => elasticDel(index, x)))
  const result = await elasticGet(index, id)
  await client().delete(
    { index: index.toLocaleLowerCase(), id, refresh: 'wait_for' })
  return result
}

export const elasticPatch = async <T extends object, K extends object>(index: string, body: T, id: string
): Promise<K> => {
  await client().update(
    {
      index: index.toLocaleLowerCase(),
      refresh: 'wait_for',
      id,
      body: { doc: body }
    })
  return body as any
}
