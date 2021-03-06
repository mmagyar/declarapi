import { HandleType, HttpWrapped } from 'declarapi-runtime/registerRestMethods'
import { AuthInput } from 'declarapi-runtime'
import { postRecords } from '../unauthenticated/post'
import { expectGetToReturnRecords } from '../unauthenticated/get'

export const cantDeleteOneOfMany = async (post:HttpWrapped<any, any>, del:HttpWrapped<any, any>, get: HandleType, authInput:AuthInput, unAuthorized:AuthInput) => {
  const recordOriginal:any[] = await postRecords(post, authInput, 20)
  const record = [...recordOriginal]
  const firstRecord = record.shift()

  const delResult = await del.handle({ id: firstRecord.id }, undefined, {})

  expect(delResult.status).toBe(401)
  expect(delResult.response).toHaveProperty('status', 401)

  await expectGetToReturnRecords(recordOriginal, {}, get, authInput)

  const secondRecord = record.shift()

  const delResult2 = await del.handle({ }, secondRecord.id, unAuthorized)

  expect(delResult2.status).toBe(403)
  expect(delResult2.response).toHaveProperty('status', 403)

  await expectGetToReturnRecords(recordOriginal, {}, get, authInput)
}
