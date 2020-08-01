import { AuthInput } from '../../src/globalTypes'
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

describe('user authentication schema test', () => {
  const auth: AuthInput = { sub: 'user1', permissions: ['editor'] }
  const unAuthorized:AuthInput = { sub: 'user2', permissions: ['editor'] }
  const adminUser :AuthInput = { sub: 'adminUser', permissions: ['admin'] }
  beforeAll(async () => {
    m = (global as any).contract.userAuthenticated
  })

  beforeEach((global as any).beforeTestCategory.userAuthenticated)
  afterEach((global as any).afterTestCategory.userAuthenticated)

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

    describe('post', () => {
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
        // So this should look for a string field that is not the id
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
        await post.postAndGetByTextSearch(m.post, m.get.handle, auth)
      })

      it('rejects re-post', async () => {
        await post.postAndRejectRePost(m.post, m.get.handle, auth)
      })

      it('rejects post with same id', async () => {
        await post.postAndRejectPostWithSameId(m.post, m.get.handle, auth)
      })
    })

    describe('patch', () => {
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

    describe('put', () => {
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

    describe('delete', () => {
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
    })

    describe('post', () => {
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

      it('posted records cannot be read by another non admin user and unauthorized user gets 401', async () => {
        const posted:any[] = await post.postRecords(m.post, auth)
        await authGet.expect401ForUnauthenticatedUser(m.get.handle)
        await get.expectEmptyWhenNoRecordsPresent(m.get.handle, unAuthorized)
        await get.expectGetToReturnRecords([], {}, m.get.handle, unAuthorized)
        await get.expectGetToReturnRecords([], { id: posted.map(x => x.id) }, m.get.handle, unAuthorized)
        await get.expectGetToReturnRecords([], { id: posted[0].id }, m.get.handle, unAuthorized)
        await get.expectGetToReturnRecords([], {
          search: Object.entries(posted[0]).map(([key, value]) =>
            !(['createdBy', 'id'].includes(key)) && typeof value === 'string' ? value : undefined).find(x => x) || ''
        },
        m.get.handle, unAuthorized)
      })
    })

    describe('patch', () => {
      it('Authenticated but not authorized user gets 403', async () => {
        await authPatch.cantPatch(m.post, m.patch, m.get.handle, auth, unAuthorized)
      })
      it('Admin can not change createdBy user id', async () => {
        await authPatch.cantChangeCreatedBy(m.post, m.patch, m.get.handle, auth, adminUser)
      })
    })

    describe('put', () => {
      it('Authenticated but not authorized user gets 403', async () => {
        await authPut.cantPut(m.post, m.put, m.get.handle, auth, unAuthorized)
      })

      it('Admin can not change createdBy user id', async () => {
        await authPut.cantChangeCreatedBy(m.post, m.patch, m.get.handle, auth, adminUser)
      })
    })

    describe('delete', () => {
      it('can not delete other users records', async () => {
        await authDel.cantDeleteOneOfMany(m.post, m.del, m.get.handle, auth, unAuthorized)
      })
    })
  })

  describe('additional cases', () => {
    it('Authorized user with permission can get all records posted by other users', async () => {
      const posted1:any[] = await post.postRecords(m.post, auth)
      const posted2:any[] = await post.postRecords(m.post, unAuthorized)

      await get.expectGetToReturnRecords(posted1, {}, m.get.handle, auth)
      await get.expectGetToReturnRecords(posted2, {}, m.get.handle, unAuthorized)
      await get.expectGetToReturnRecords(posted1.concat(posted2), {}, m.get.handle, adminUser)
    })
    it('Admin user, can patch other users items, user can get item back', async () => {
      await patch.canPatch(m.post, m.patch, m.get.handle, auth, adminUser)
    })
  })
})
