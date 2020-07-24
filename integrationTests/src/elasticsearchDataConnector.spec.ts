import path from 'path'
import { AuthInput } from '../../src/globalTypes'
import { addValidationToContract, registerRestMethods, elastic } from '../../src'
import { expectEmptyForNonMatchingInput, expectNotFound, expectEmptyWithTextSearch, expectEmptyWhenNoRecordsPresent } from './unauthenticated/get'
import { postRecords, postAndGetRecordsByIdParam, postAndGetRecordsByIdArray, postAndGetSomeRecordsByIdArray, postAndGetRecordsByEmptyGet, postAndGetByTextSearch, postAndRejectRePost, postAndGetAvailableIdsIgnoringWrong, postAndRejectPostWithSameId } from './unauthenticated/post'
import { Expressable } from '../../src/runtime/registerRestMethods'
import { generateContract } from './common'
import { putRejectsPartialModification, putCantChangeId, cantPutNonExistent, canPut, putCanRemoveOptionalParameters } from './unauthenticated/put'
import { canPatch, cantPatchNonExistent, patchCantChangeId, patchCanNotRemoveOptionalParameters } from './unauthenticated/patch'
import * as uaDel from './unauthenticated/delete'

import * as authGet from './authenticated/get'

describe('elasticsearch data connector test', () => {
  const schemaFilePath = path.join(__dirname, '../../example/elasticsearch_text_search_example.json')
  let indexName:string
  let contract:any
  let get:Expressable
  let post:Expressable
  let patch:Expressable
  let put:Expressable
  let del:Expressable

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
      patch = contract.find((x:Expressable) => x.method === 'patch')
      put = contract.find((x:Expressable) => x.method === 'put')
      del = contract.find((x:Expressable) => x.method === 'delete')
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

      it('rejects post with same id', async () => {
        await postAndRejectPostWithSameId(post, get.handle, {})
      })
    })

    describe('patch', () => {
      it('can patch item and verify that only that one record changed', async () => {
        await canPatch(post, patch, get.handle, {})
      })

      it('can not patch non existing record', async () => {
        await cantPatchNonExistent(post, patch, get.handle, {})
      })

      it('can not change id', async () => {
        await patchCantChangeId(post, patch, get.handle, {})
      })

      it('can not remove optional field', async () => {
        await patchCanNotRemoveOptionalParameters(post, patch, get.handle, {})
      })
    })

    describe('put', () => {
      it('can put item and verify that only that one record changed', async () => {
        await canPut(post, put, get.handle, {})
      })

      it('can not put non existing record', async () => {
        await cantPutNonExistent(post, put, get.handle, {})
      })

      it('can not change id', async () => {
        await putCantChangeId(post, put, get.handle, {})
      })

      it('rejects put that is missing a non optional field', async () => {
        await putRejectsPartialModification(post, put, get.handle, {})
      })

      it('can remove optional field', async () => {
        await putCanRemoveOptionalParameters(post, put, get.handle, {})
      })
    })

    describe('delete', () => {
      it('can delete one of many', async () => {
        await uaDel.canDeleteOneOfMany(post, del, get.handle)
      })
      it('can delete some one of many', async () => {
        await uaDel.canDeleteSomeOfMany(post, del, get.handle)
      })

      it('can delete all of many', async () => {
        await uaDel.canDeleteAll(post, del, get.handle)
      })
    })
  })

  describe('with basic authentication', () => {
    const auth: AuthInput = { sub: 'user1', permissions: ['admin'] }
    const unAuthorized:AuthInput = { sub: 'user2', permissions: ['editor'] }
    beforeAll(async () => {
      await generateContract(schemaFilePath, 'test-elastic-auth', (input) => {
        input.preferredImplementation = {
          type: 'elasticsearch',
          index: indexName
        }
        input.authentication = ['admin']
        return input
      })
      // @ts-ignore
      const inputs = await import('../temp/test-elastic-auth-server')
      contract = registerRestMethods(addValidationToContract(inputs.contracts))
      get = contract.find((x:Expressable) => x.method === 'get')
      post = contract.find((x:Expressable) => x.method === 'post')
      patch = contract.find((x:Expressable) => x.method === 'patch')
      put = contract.find((x:Expressable) => x.method === 'put')
      del = contract.find((x:Expressable) => x.method === 'delete')
    })

    describe('basic workflow test with authorized user', () => {
      describe('get empty', () => {
        it('will return 404 when the element is requested by id', async () => {
          await expectNotFound(get.handle, auth)
        })

        it('will get empty sets when there are no params or multiple ids requested', async () => {
          await expectEmptyForNonMatchingInput(get.handle, auth)
          await expectEmptyWhenNoRecordsPresent(get.handle, auth)
        })

        it('will get empty sets when searching for text', async () => {
          await expectEmptyWithTextSearch(get.handle, auth)
        })
      })

      describe('post', () => {
        it('can post items and get all with empty arguments', async () => {
          await postAndGetRecordsByEmptyGet(post, get.handle, auth)
        })

        it('can get all posted items by id, one by one', async () => {
          await postAndGetRecordsByIdParam(post, get.handle, auth)
        })

        it('can get all posted items by id array', async () => {
          await postAndGetRecordsByIdArray(post, get.handle, auth)
        })

        it('can get some of the posted items by id array', async () => {
          await postAndGetSomeRecordsByIdArray(post, get.handle, auth)
        })

        it('Text search for the first generated, and it should be the first result returned', async () => {
        // So this should look for a string field that is not the id
        })

        it('will return 404 when the element is requested by id', async () => {
          await postRecords(post, auth)
          await expectNotFound(get.handle, auth)
        })

        it('will get empty sets when there are no params or multiple ids requested', async () => {
          await postRecords(post, auth)
          await expectEmptyForNonMatchingInput(get.handle, auth)
        })

        it('Gets available records, ignores non existent ones when an array of ids is supplied', async () => {
          await postAndGetAvailableIdsIgnoringWrong(post, get.handle, auth)
        })
        it('can perform text search', async () => {
          await postAndGetByTextSearch(post, get.handle, auth)
        })

        it('rejects re-post', async () => {
          await postAndRejectRePost(post, get.handle, auth)
        })

        it('rejects post with same id', async () => {
          await postAndRejectPostWithSameId(post, get.handle, auth)
        })
      })

      describe('patch', () => {
        it('can patch item and verify that only that one record changed', async () => {
          await canPatch(post, patch, get.handle, auth)
        })

        it('can not patch non existing record', async () => {
          await cantPatchNonExistent(post, patch, get.handle, auth)
        })

        it('can not change id', async () => {
          await patchCantChangeId(post, patch, get.handle, auth)
        })

        it('can not remove optional field', async () => {
          await patchCanNotRemoveOptionalParameters(post, patch, get.handle, auth)
        })
      })

      describe('put', () => {
        it('can put item and verify that only that one record changed', async () => {
          await canPut(post, put, get.handle, auth)
        })

        it('can not put non existing record', async () => {
          await cantPutNonExistent(post, put, get.handle, auth)
        })

        it('can not change id', async () => {
          await putCantChangeId(post, put, get.handle, auth)
        })

        it('rejects put that is missing a non optional field', async () => {
          await putRejectsPartialModification(post, put, get.handle, auth)
        })

        it('can remove optional field', async () => {
          await putCanRemoveOptionalParameters(post, put, get.handle, auth)
        })
      })

      describe('delete', () => {
        it('can delete one of many', async () => {
          await uaDel.canDeleteOneOfMany(post, del, get.handle, auth)
        })
        it('can delete some one of many', async () => {
          await uaDel.canDeleteSomeOfMany(post, del, get.handle, auth)
        })

        it('can delete all of many', async () => {
          await uaDel.canDeleteAll(post, del, get.handle, auth)
        })
      })
    })

    describe('Auth reject tests', () => {
      describe('get empty', () => {
        it('Unauthenticated user can\'t access the get endpoint, error 401', async () => {
          await authGet.expect401ForUnauthenticatedUser(get.handle)
        })

        it('Unauthorized user can\'t access the get endpoint, error 403', async () => {
          await authGet.expect403ForUnauthorizedUser(get.handle, unAuthorized)
        })
      })

      describe('post', () => {
        it('Unauthenticated user can\'t access the post endpoint, error 401', async () => {
          let err:Error = new Error()
          try { await postRecords(post, {}) } catch (e) {
            err = e
          }
          expect(err).toHaveProperty('code', 401)
        })

        it('Unauthorized user can\'t access the post endpoint, error 403', async () => {
          let err:Error = new Error()
          try { await postRecords(post, unAuthorized) } catch (e) {
            err = e
          }
          expect(err).toHaveProperty('code', 403)
        })
      })

      describe('patch', () => {

      })

      describe('put', () => {

      })

      describe('delete', () => {

      })
    })
  })
})
