import path from 'path'
import { addValidationToContract, registerRestMethods, elastic } from 'declarapi'
import { expectEmptyForNonMatchingInput, expectNotFound, expectEmptyWithTextSearch, expectEmptyWhenNoRecordsPresent } from './unauthenticated/get'
import { postRecords, postAndGetRecordsByIdParam, postAndGetRecordsByIdArray, postAndGetSomeRecordsByIdArray, postAndGetRecordsByEmptyGet, postAndGetByTextSearch, postAndRejectRePost, postAndGetAvailableIdsIgnoringWrong } from './unauthenticated/post'
import { Expressable } from '../../src/runtime/registerRestMethods'
import { generateContract } from './common'
describe('elasticsearch data connector test', () => {
  const schemaFilePath = path.join(__dirname, '../../example/elasticsearch_text_search_example.json')
  let indexName:string
  let contract:any
  let get:Expressable
  let post:Expressable
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
      index: indexName
      /* this is not needed for the local docker testing */
      // wait_for_active_shards: 'all'
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
      const inputs = await import('../temp/test-elastic-server')
      contract = registerRestMethods(addValidationToContract(inputs.contracts))
      get = contract.find((x:Expressable) => x.method === 'get')
      post = contract.find((x:Expressable) => x.method === 'post')
    })

    describe('get empty', () => {
      it('will return 404 when the element is requested by id', async () => {
        await expectNotFound(get.handle)
      })

      it('will get empty sets when there are no params or multiple ids requested', async () => {
        await expectEmptyForNonMatchingInput(get.handle)
        await expectEmptyWhenNoRecordsPresent(get.handle)
      })

      it('will get empty sets when searching for text', async () => {
        await expectEmptyWithTextSearch(get.handle)
      })
    })

    describe('post', () => {
      it('can post items and get all with empty arguments', async () => {
        await postAndGetRecordsByEmptyGet(post, get.handle, {})
      })

      it('can get all posted items by id, one by one', async () => {
        await postAndGetRecordsByIdParam(post, get.handle, {})
      })

      it('can get all posted items by id array', async () => {
        await postAndGetRecordsByIdArray(post, get.handle, {})
      })

      it('can get some of the posted items by id array', async () => {
        await postAndGetSomeRecordsByIdArray(post, get.handle, {})
      })

      it('Text search for the first generated, and it should be the first result returned', async () => {
        // So this should look for a string field that is not the id
      })

      it('will return 404 when the element is requested by id', async () => {
        await postRecords(post, {})
        await expectNotFound(get.handle)
      })

      it('will get empty sets when there are no params or multiple ids requested', async () => {
        await postRecords(post, {})
        await expectEmptyForNonMatchingInput(get.handle)
      })

      it('Gets available records, ignores non existent ones when an array of ids is supplied', async () => {
        await postAndGetAvailableIdsIgnoringWrong(post, get.handle, {})
      })
      it('can perform text search', async () => {
        await postAndGetByTextSearch(post, get.handle, {})
      })

      it('rejects re-post', async () => {
        await postAndRejectRePost(post, get.handle, {})
      })
    })
  })
})
