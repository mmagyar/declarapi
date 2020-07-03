import { canPostAndGetAll, generateContract, canTextSearchObjects, canPatchItems, canPutItems, canDeleteItems, canDeleteSingleItem, canPostAndGetSome, canPost, canGetAll } from './dataConnectorTest.spec'
import path from 'path'
import { addValidationToContract, registerRestMethods, elastic } from 'declarapi'
import { RequestHandlingError } from '../src/RequestHandlingError'
describe('data connector test', () => {
  const schemaFilePath = path.join(__dirname, '../example/elasticsearch_text_search_example.json')
  let indexName:string
  let contract:any
  beforeAll(async () => {
    indexName = 'test-' + Date.now()

    if (!process.env.ELASTIC_HOST ||
      !process.env.ELASTIC_USER_NAME ||
      !process.env.ELASTIC_PASSWORD) {
      throw new Error('elasticsearch credentials need to be set in ENV variables for this test to work')
    }
  })

  beforeEach(async () => {
    await elastic.client().indices.create({
      index: indexName,
      wait_for_active_shards: 'all'
    })
    return ''
  })

  afterEach(async () => {
    await elastic.client().indices.delete({ index: 'test*' })
    return ''
  })

  describe('without any authentication', () => {
    beforeAll(async () => {
      await generateContract(schemaFilePath, 'test-elastic', (input) => {
        input.preferredImplementation = {
          type: 'elasticsearch',
          index: indexName
        }
        return input
      })
      // @ts-ignore
      const inputs = await import('../test/test-elastic-server')
      contract = registerRestMethods(addValidationToContract(inputs.contracts))
    })

    it('it can load contracts, use post and get all', async () => {
      expect(Object.keys(contract)).toHaveLength(5)
      await canPostAndGetAll(contract)
    })

    it('it can load contracts, use post and get multiple', async () => {
      expect(Object.keys(contract)).toHaveLength(5)
      await canPostAndGetSome(contract)
    })

    it('it can do fulltext search', async () => {
      expect(Object.keys(contract)).toHaveLength(5)
      await canTextSearchObjects(contract)
    }, 15000)

    it('it can patch items', async () => {
      expect(Object.keys(contract)).toHaveLength(5)
      await canPatchItems(contract)
    }, 15000)

    it('it can put items', async () => {
      expect(Object.keys(contract)).toHaveLength(5)
      await canPutItems(contract)
    }, 15000)

    it('it can delete single item', async () => {
      expect(Object.keys(contract)).toHaveLength(5)
      await canDeleteSingleItem(contract)
    }, 15000)
    it('it can delete items', async () => {
      expect(Object.keys(contract)).toHaveLength(5)
      await canDeleteItems(contract)
    }, 15000)
  })

  describe('with  authentication', () => {
    beforeAll(async () => {
      await generateContract(schemaFilePath, 'test-elastic2', (input) => {
        return {
          ...input,
          authentication: {
            get: true,
            modify: ['admin', { userId: 'ownerId' }]
          },
          preferredImplementation: {
            type: 'elasticsearch',
            index: indexName
          }
        }
      })
      // @ts-ignore
      const inputs = await import('../test/test-elastic2-server')
      contract = registerRestMethods(addValidationToContract(inputs.contracts))
    })

    it('it will throw an exception if you try to post without user object', async () => {
      expect(Object.keys(contract)).toHaveLength(5)
      await expect(canPost(contract))
        .rejects.toThrow(new RequestHandlingError('User not authorized to POST', 403))
    })

    it('it will return 0 if the user is not authorized', async () => {
      expect(Object.keys(contract)).toHaveLength(5)
      canGetAll(contract, {}, 0)
    })

    it('it can load contracts, use post and get all', async () => {
      expect(Object.keys(contract)).toHaveLength(5)
      await canPostAndGetAll(contract)
    })

    it('it can load contracts, use post and get multiple', async () => {
      expect(Object.keys(contract)).toHaveLength(5)
      await canPostAndGetSome(contract)
    })

    it('it can do fulltext search', async () => {
      expect(Object.keys(contract)).toHaveLength(5)
      await canTextSearchObjects(contract)
    }, 15000)

    it('it can patch items', async () => {
      expect(Object.keys(contract)).toHaveLength(5)
      await canPatchItems(contract)
    }, 15000)

    it('it can put items', async () => {
      expect(Object.keys(contract)).toHaveLength(5)
      await canPutItems(contract)
    }, 15000)

    it('it can delete single item', async () => {
      expect(Object.keys(contract)).toHaveLength(5)
      await canDeleteSingleItem(contract)
    }, 15000)
    it('it can delete items', async () => {
      expect(Object.keys(contract)).toHaveLength(5)
      await canDeleteItems(contract)
    }, 15000)
  })
})
