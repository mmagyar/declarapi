import { canPostAndGetAll, generateContract, canTextSearchObjects, canPatchItems, canPutItems, canDeleteItems, canDeleteSingleItem, canPostAndGetSome } from './dataConnectorTest.spec'
import path from 'path'
import { elastic } from 'declarapi'

describe('data connector test', () => {
  const schemaFilePath = path.join(__dirname, '../example/elasticsearch_text_search_example.json')
  let contract:any
  beforeAll(async () => {
    if (!process.env.ELASTIC_HOST ||
      !process.env.ELASTIC_USER_NAME ||
      !process.env.ELASTIC_PASSWORD) {
      throw new Error('elasticsearch credentials need to be set in ENV variables for this test to work')
    }

    await generateContract(schemaFilePath, 'test-elastic', (input) => {
      input.preferredImplementation = {
        type: 'elasticsearch',
        index: 'test-' + Date.now()
      }
      return input
    })
    // @ts-ignore
    contract = await import('../test/test-elastic-server')
  })

  afterEach(async () => {
    await elastic.client().indices.delete({ index: 'test*' })
    return ''
  })

  it('can generate the contract', () => {
    expect('OK').toBe('OK')
  })

  it('it can load contracts, use post and get all', async () => {
    expect(Object.keys(contract.contracts)).toHaveLength(5)
    await canPostAndGetAll(contract.contracts)
  })

  it('it can load contracts, use post and get multiple', async () => {
    expect(Object.keys(contract.contracts)).toHaveLength(5)
    await canPostAndGetSome(contract.contracts)
  })

  it('it can do fulltext search', async () => {
    expect(Object.keys(contract.contracts)).toHaveLength(5)
    await canTextSearchObjects(contract.contracts)
  }, 15000)

  it('it can patch items', async () => {
    expect(Object.keys(contract.contracts)).toHaveLength(5)
    await canPatchItems(contract.contracts)
  }, 15000)

  it('it can put items', async () => {
    expect(Object.keys(contract.contracts)).toHaveLength(5)
    await canPutItems(contract.contracts)
  }, 15000)

  it('it can delete single item', async () => {
    expect(Object.keys(contract.contracts)).toHaveLength(5)
    await canDeleteSingleItem(contract.contracts)
  }, 15000)
  it('it can delete items', async () => {
    expect(Object.keys(contract.contracts)).toHaveLength(5)
    await canDeleteItems(contract.contracts)
  }, 15000)
})
