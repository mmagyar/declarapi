import { canPostAndGetAll, generateContract, canTextSearchObjects, canPatchOwnItems, canPutItems, canDeleteItems, canDeleteSingleItem, canPostAndGetSome, unauthorizedCanNotGetAll } from './dataConnectorTest.spec'
import path from 'path'
import { addValidationToContract, registerRestMethods, elastic } from 'declarapi'
import { postRecords } from './unauthenticated/post'
describe('data connector test', () => {
  const schemaFilePath = path.join(__dirname, '../example/elasticsearch_text_search_example.json')
  let indexName:string
  let contract:any
  beforeAll(async () => {
    indexName = 'test-' + Date.now()

    if (!process.env.ELASTIC_HOST ||
      ((!process.env.ELASTIC_USER_NAME ||
      !process.env.ELASTIC_PASSWORD) &&
      !process.env.ELASTIC_UNAUTHENTICATED)) {
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
      await canPatchOwnItems(contract)
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
            post: true,
            put: ['admin', { userId: 'ownerId' }],
            delete: ['admin', { userId: 'ownerId' }]
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
      await expect(postRecords((contract.find((x:any) => x.method === 'post')as any), {}, 20))
        .rejects.toThrowError('Only logged in users can do this')
    })

    it('it return 403 if the user is not logged in', async () => {
      unauthorizedCanNotGetAll(contract)
    })

    it('logged in user can load contracts, use post and get all', async () => {
      await canPostAndGetAll(contract, { sub: 'a123' })
    })

    it('it can load contracts, use post and get multiple', async () => {
      await canPostAndGetSome(contract, { sub: 'a123' })
    })

    it('can do fulltext search', async () => {
      await canTextSearchObjects(contract, { sub: 'a123' })
    }, 15000)

    it('allows admin to patch items', async () => {
      await canPatchOwnItems(contract, { sub: 'a123', permissions: ['admin'] })
    }, 15000)

    it('non-admin can patch own items', async () => {
      await canPatchOwnItems(contract, { sub: 'a123' })
    }, 15000)

    it.only('deny non-admin patching other users items', async () => {
      await canPatchOwnItems(contract, { sub: 'a123' }, { sub: 'b223' })
    }, 15000)

    it('allows admin to put items', async () => {
      await canPutItems(contract, { sub: 'a123', permissions: ['admin'] })
    }, 15000)

    it('allows admin to delete a single item', async () => {
      expect(Object.keys(contract)).toHaveLength(5)
      await canDeleteSingleItem(contract, { sub: 'a123', permissions: ['admin'] })
    }, 15000)
    it('allows admin to delete items', async () => {
      expect(Object.keys(contract)).toHaveLength(5)
      await canDeleteItems(contract, { sub: 'a123', permissions: ['admin'] })
    }, 15000)
  })
})
