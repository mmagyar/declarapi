import path from 'path'
import { addValidationToContract, registerRestMethods, elastic } from 'declarapi'
import { postRecords } from './unauthenticated/post'
import { expectEmpty } from './unauthenticated/get'
import { Expressable } from '../../src/runtime/registerRestMethods'
import { generateContract } from './common'
describe('elasticsearch data connector test', () => {
  const schemaFilePath = path.join(__dirname, '../../example/elasticsearch_text_search_example.json')
  let indexName:string
  let contract:any
  let get:Expressable
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
      await generateContract(schemaFilePath, 'test-elastic', (input:any) => {
        input.preferredImplementation = {
          type: 'elasticsearch',
          index: indexName
        }
        return input
      })
      // @ts-ignore
      const inputs = await import('../temp/test-elastic-server')
      contract = registerRestMethods(addValidationToContract(inputs.contracts))
      get = contract.find((x:Expressable) => x.method === 'get')
    })

    it('can get empty sets from server when no data is posted', async () => {
      await expectEmpty(get.handle)
    })

    // it('it can do fulltext search', async () => {
    //   expect(Object.keys(contract)).toHaveLength(5)
    //   await canTextSearchObjects(contract)
    // }, 15000)

    // it('it can patch items', async () => {
    //   expect(Object.keys(contract)).toHaveLength(5)
    //   await canPatchOwnItems(contract)
    // }, 15000)

    // it('it can put items', async () => {
    //   expect(Object.keys(contract)).toHaveLength(5)
    //   await canPutItems(contract)
    // }, 15000)

    // it('it can delete single item', async () => {
    //   expect(Object.keys(contract)).toHaveLength(5)
    //   await canDeleteSingleItem(contract)
    // }, 15000)
    // it.skip('it can delete items', async () => {
    //   expect(Object.keys(contract)).toHaveLength(5)
    //   await canDeleteItems(contract)
    // }, 15000)
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
      const inputs = await import('../temp/test-elastic2-server')
      contract = registerRestMethods(addValidationToContract(inputs.contracts))
      get = contract.find((x:Expressable) => x.method === 'get')
    })

    it.skip('it will throw an exception if you try to post without user object', async () => {
      expect(Object.keys(contract)).toHaveLength(5)
      await expect(postRecords((contract.find((x:any) => x.method === 'post')as any), {}, 20))
        .rejects.toThrowError('Only logged in users can do this')
    })
  })
})
