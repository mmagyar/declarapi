import * as get from './unauthenticated/get'
import * as post from './unauthenticated/post'
import * as put from './unauthenticated/put'
import * as patch from './unauthenticated/patch'
import * as uaDel from './unauthenticated/delete'
import { Contracts } from './common'

let m:Contracts

describe('Unauthenticated schema test', () => {
  beforeAll(() => {
    m = (global as any).contract.unauthenticated
  })

  describe('get empty', () => {
    it('will return 404 when the element is requested by id', async () => {
      await get.expectNotFound(m.get.handle)
    })

    it('will get empty sets when there are no params or multiple ids requested', async () => {
      await get.expectEmptyForNonMatchingInput(m.get.handle)
      await get.expectEmptyWhenNoRecordsPresent(m.get.handle)
    })

    it('will get empty sets when searching for text', async () => {
      await get.expectEmptyWithTextSearch(m.get.handle)
    })
  })

  describe('post', () => {
    it('can post items and get all with empty arguments', async () => {
      await post.postAndGetRecordsByEmptyGet(m.post, m.get.handle, {})
    })

    it('can get all posted items by id, one by one', async () => {
      await post.postAndGetRecordsByIdParam(m.post, m.get.handle, {})
    })

    it('can get all posted items by id array', async () => {
      await post.postAndGetRecordsByIdArray(m.post, m.get.handle, {})
    })

    it('can get some of the posted items by id array', async () => {
      await post.postAndGetSomeRecordsByIdArray(m.post, m.get.handle, {})
    })

    it('Text search for the first generated, and it should be the first result returned', async () => {
      const posted :any[] = await post.postRecords(m.post, {})
      await get.expectFirstRecordToEqual(posted[0], {
        search: get.findFirstTextFieldContent(posted[0], m.get)
      }, m.get.handle, {})
    })

    it('will return 404 when the element is requested by id', async () => {
      await post.postRecords(m.post, {})
      await get.expectNotFound(m.get.handle)
    })

    it('will get empty sets when there are no params or multiple ids requested', async () => {
      await post.postRecords(m.post, {})
      await get.expectEmptyForNonMatchingInput(m.get.handle)
    })

    it('Gets available records, ignores non existent ones when an array of ids is supplied', async () => {
      await post.postAndGetAvailableIdsIgnoringWrong(m.post, m.get.handle, {})
    })
    it('can perform text search', async () => {
      await post.postAndGetByTextSearch(m.post, m.get.handle, {})
    })

    it('rejects re-post', async () => {
      await post.postAndRejectRePost(m.post, m.get.handle, {})
    })

    it('rejects post with same id', async () => {
      await post.postAndRejectPostWithSameId(m.post, m.get.handle, {})
    })
  })

  describe('patch', () => {
    it('can patch item and verify that only that one record changed', async () => {
      await patch.canPatch(m.post, m.patch, m.get.handle, {})
    })

    it('can not patch non existing record', async () => {
      await patch.cantPatchNonExistent(m.post, m.patch, m.get.handle, {})
    })

    it('can not change id', async () => {
      await patch.patchCantChangeId(m.post, m.patch, m.get.handle, {})
    })

    it('can not remove optional field', async () => {
      await patch.patchCanNotRemoveOptionalParameters(m.post, m.patch, m.get.handle, {})
    })
  })

  describe('put', () => {
    it('can put item and verify that only that one record changed', async () => {
      await put.canPut(m.post, m.put, m.get.handle, {})
    })

    it('can not put non existing record', async () => {
      await put.cantPutNonExistent(m.post, m.put, m.get.handle, {})
    })

    it('can not change id', async () => {
      await put.putCantChangeId(m.post, m.put, m.get.handle, {})
    })

    it('rejects put that is missing a non optional field', async () => {
      await put.putRejectsPartialModification(m.post, m.put, m.get.handle, {})
    })

    it('can remove optional field', async () => {
      await put.putCanRemoveOptionalParameters(m.post, m.put, m.get.handle, {})
    })
  })

  describe('delete', () => {
    it('can delete one of many', async () => {
      await uaDel.canDeleteOneOfMany(m.post, m.del, m.get.handle)
    })
    it('can delete some one of many', async () => {
      await uaDel.canDeleteSomeOfMany(m.post, m.del, m.get.handle)
    })

    it('can delete all of many', async () => {
      await uaDel.canDeleteAll(m.post, m.del, m.get.handle)
    })
  })
})
