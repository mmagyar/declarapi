import { AuthInput } from 'declarapi-runtime'
import { Contracts } from './common'

import * as get from './unauthenticated/get'
import * as post from './unauthenticated/post'
import * as put from './unauthenticated/put'
import * as patch from './unauthenticated/patch'
import * as uaDel from './unauthenticated/delete'

import * as authGet from './authenticated/get'
import * as authPatch from './authenticated/patch'
import * as authPut from './authenticated/put'
import * as authDel from './authenticated/delete'

let m:Contracts

describe('authenticated schema test', () => {
  const auth: AuthInput = { sub: 'user1', permissions: ['admin'] }
  const unAuthorized:AuthInput = { sub: 'user2', permissions: ['editor'] }
  beforeAll(async () => {
    m = (global as any).contract.authenticated
  })

  beforeEach((global as any).beforeTestCategory.authenticated)
  afterEach((global as any).afterTestCategory.authenticated)

  describe('basic workflow test with authorized user', () => {
    describe('get empty', () => {
      it('will return 404 when the element is requested by id', async () => {
        await get.expectNotFound(m.get.handle, auth)
      })

      it('will get empty sets when there are no params or multiple ids requested', async () => {
        await get.expectEmptyForNonMatchingInput(m.get.handle, auth)
        await get.expectEmptyWhenNoRecordsPresent(m.get.handle, auth)
      })

      it('will get empty sets when searching for text', async () => {
        await get.expectEmptyWithTextSearch(m.get.handle, auth)
      })
    })

    describe('POST', () => {
      it('can post items and get all with empty arguments', async () => {
        await post.postAndGetRecordsByEmptyGet(m.post, m.get.handle, auth)
      })

      it('can get all posted items by id, one by one', async () => {
        await post.postAndGetRecordsByIdParam(m.post, m.get.handle, auth)
      })

      it('can get all posted items by id array', async () => {
        await post.postAndGetRecordsByIdArray(m.post, m.get.handle, auth)
      })

      it('can get some of the posted items by id array', async () => {
        await post.postAndGetSomeRecordsByIdArray(m.post, m.get.handle, auth)
      })

      it('Text search for the first generated, and it should be the first result returned', async () => {
        const posted :any[] = await post.postRecords(m.post, auth)
        await get.expectFirstRecordToEqual(posted[0], {
          search: get.findFirstTextFieldContent(posted[0], m.get)
        }, m.get.handle, auth)
      })

      it('will return 404 when the element is requested by id', async () => {
        await post.postRecords(m.post, auth)
        await get.expectNotFound(m.get.handle, auth)
      })

      it('will get empty sets when there are no params or multiple ids requested', async () => {
        await post.postRecords(m.post, auth)
        await get.expectEmptyForNonMatchingInput(m.get.handle, auth)
      })

      it('Gets available records, ignores non existent ones when an array of ids is supplied', async () => {
        await post.postAndGetAvailableIdsIgnoringWrong(m.post, m.get.handle, auth)
      })
      it('can perform text search', async () => {
        await post.postAndGetByTextSearch(m.post, m.get, auth)
      })

      it('rejects re-post', async () => {
        await post.postAndRejectRePost(m.post, m.get.handle, auth)
      })

      it('rejects post with same id', async () => {
        await post.postAndRejectPostWithSameId(m.post, m.get.handle, auth)
      })
    })

    describe('PATCH', () => {
      it('can patch item and verify that only that one record changed', async () => {
        await patch.canPatch(m.post, m.patch, m.get.handle, auth)
      })

      it('can not patch non existing record', async () => {
        await patch.cantPatchNonExistent(m.post, m.patch, m.get.handle, auth)
      })

      it('can not change id', async () => {
        await patch.patchCantChangeId(m.post, m.patch, m.get.handle, auth)
      })

      it('can not remove optional field', async () => {
        await patch.patchCanNotRemoveOptionalParameters(m.post, m.patch, m.get.handle, auth)
      })
    })

    describe('PUT', () => {
      it('can put item and verify that only that one record changed', async () => {
        await put.canPut(m.post, m.put, m.get.handle, auth)
      })

      it('can not put non existing record', async () => {
        await put.cantPutNonExistent(m.post, m.put, m.get.handle, auth)
      })

      it('can not change id', async () => {
        await put.putCantChangeId(m.post, m.put, m.get.handle, auth)
      })

      it('rejects put that is missing a non optional field', async () => {
        await put.putRejectsPartialModification(m.post, m.put, m.get.handle, auth)
      })

      it('can remove optional field', async () => {
        await put.putCanRemoveOptionalParameters(m.post, m.put, m.get.handle, auth)
      })
    })

    describe('DELETE', () => {
      it('can delete one of many', async () => {
        await uaDel.canDeleteOneOfMany(m.post, m.del, m.get.handle, auth)
      })
      it('can delete some one of many', async () => {
        await uaDel.canDeleteSomeOfMany(m.post, m.del, m.get.handle, auth)
      })

      it('can delete all of many', async () => {
        await uaDel.canDeleteAll(m.post, m.del, m.get.handle, auth)
      })
    })
  })

  describe('Auth reject tests', () => {
    describe('get empty', () => {
      it('Unauthenticated user can\'t access the get endpoint, error 401', async () => {
        await authGet.expect401ForUnauthenticatedUser(m.get.handle)
      })

      it('Unauthorized user can\'t access the get endpoint, error 403', async () => {
        await authGet.expect403ForUnauthorizedUser(m.get.handle, unAuthorized)
      })
    })

    describe('POST', () => {
      it('Unauthenticated user can\'t access the post endpoint, error 401', async () => {
        let err:any
        try { await post.postRecords(m.post, {}) } catch (e) {
          err = e
        }
        expect(err).toHaveProperty('code', 401)
        expect(err.response).toEqual({
          code: 401,
          data: { id: undefined },
          errorType: 'unauthorized',
          errors: ['Only logged in users can do this']
        })
        await get.expectEmptyWhenNoRecordsPresent(m.get.handle, auth)
      })

      it('Unauthorized user can\'t access the post endpoint, error 403', async () => {
        let err:any
        try { await post.postRecords(m.post, unAuthorized) } catch (e) {
          err = e
        }
        expect(err).toHaveProperty('code', 403)
        expect(err.response).toEqual({
          code: 403,
          data: { id: undefined },
          errorType: 'unauthorized',
          errors: ['You don\'t have permission to do this']
        })
        await get.expectEmptyWhenNoRecordsPresent(m.get.handle, auth)
      })

      it('posted records cannot be read by unauthenticated user', async () => {
        await post.postRecords(m.post, auth)
        await authGet.expect401ForUnauthenticatedUser(m.get.handle)
        await authGet.expect403ForUnauthorizedUser(m.get.handle, unAuthorized)
      })
    })

    describe('PATCH', () => {
      it('Authenticated but not authorized user gets 403', async () => {
        await authPatch.cantPatch(m.post, m.patch, m.get.handle, auth, unAuthorized)
      })
    })

    describe('PUT', () => {
      it('Authenticated but not authorized user gets 403', async () => {
        await authPut.cantPut(m.post, m.put, m.get.handle, auth, unAuthorized)
      })
    })

    describe('DELETE', () => {
      it('can not delete one of many', async () => {
        await authDel.cantDeleteOneOfMany(m.post, m.del, m.get.handle, auth, unAuthorized)
      })
    })
  })
})
