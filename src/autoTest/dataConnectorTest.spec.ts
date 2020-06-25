import { cliProgram } from '../bin/generate'
import { generateRandomCall } from './generateRandomCall'
import { client } from '../dataConnector/elastic'

describe('data connector test', () => {
  const schemaFilePath = './example/elasticsearch_text_search_example.json'
  let index: string = ''
  let contract:any
  beforeAll(async () => {
    await cliProgram(schemaFilePath, './test', 'server')
    contract = await import('../../test/elasticsearch_text_search_example-server')

    const input = await import('../.' + schemaFilePath)
    index = input.preferredImplementation.index

    if (!process.env.ELASTIC_HOST ||
    !process.env.ELASTIC_USER_NAME ||
    !process.env.ELASTIC_PASSWORD) {
      throw new Error('elasticsearch credentials need to be set in ENV variables for this test to work')
    }
  })

  beforeEach(async () => {
  })

  afterEach(() => {
    return client().indices.delete({ index: index })
  })

  it('it can load contracts, use post and get', async () => {
    expect(Object.keys(contract.contracts)).toHaveLength(5)

    await generateRandomCall(contract.contracts.elasticsearchSearchExamplePost)
    await generateRandomCall(contract.contracts.elasticsearchSearchExamplePost)
    const result = await generateRandomCall<any, any>(contract.contracts.elasticsearchSearchExamplePost)
    const id = result.output.id
    expect(id).toBeTruthy()

    const getResult = await contract.contracts.elasticsearchSearchExampleGet.handle?.({})
    expect(getResult).toHaveLength(3)
    expect(getResult?.find((x:any) => x.id === id)).toBeTruthy()
  })

  it('it can use full text search', async () => {
    const contract = await import('../../test/elasticsearch_text_search_example-server')

    expect(Object.keys(contract.contracts)).toHaveLength(5)

    await contract.contracts.elasticsearchSearchExamplePost.handle?.({
      name: 'DONKYKONG',
      cats: [],
      dogs: [{ name: 'donky', breed: 'Bulldog', color: 'red', age: 4 }],
      rain: 'cats'
    })
    await contract.contracts.elasticsearchSearchExamplePost.handle?.({ name: 'KINGKONG', cats: [{ name: 'dingy', breed: 'Bengal', color: 'red', age: 4 }], dogs: [], rain: 'dogs' })
    await contract.contracts.elasticsearchSearchExamplePost.handle?.({ name: 'GODZILLA', cats: [], dogs: [], rain: 'dogs' })
    await contract.contracts.elasticsearchSearchExamplePost.handle?.({ name: 'ZILLANILLA', cats: [], dogs: [], rain: 'dogs' })
    await contract.contracts.elasticsearchSearchExamplePost.handle?.({ name: 'MOTHS', cats: [], dogs: [], rain: 'cats' })

    const dogResult = await contract.contracts.elasticsearchSearchExampleGet.handle?.({ search: 'dogs' })
    expect(dogResult).toHaveLength(3)

    const catResult = await contract.contracts.elasticsearchSearchExampleGet.handle?.({ search: 'cats' })

    expect(catResult).toHaveLength(2)

    expect(await contract.contracts.elasticsearchSearchExampleGet.handle?.({ search: 'red' })).toHaveLength(2)
  }, 15000)
})
