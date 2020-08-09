import { Expressable, HandleType } from '../../../src/runtime/registerRestMethods.js'
import { AuthInput } from '../../../src.js'
import { postRecords } from '../unauthenticated/post.js'
import { expectGetToReturnRecords } from '../unauthenticated/get.js'

export const cantDeleteOneOfMany = async (post:Expressable, del:Expressable, get: HandleType, authInput:AuthInput, unAuthorized:AuthInput) => {
  const recordOriginal:any[] = await postRecords(post, authInput, 20)
  const record = [...recordOriginal]
  const firstRecord = record.shift()

  const delResult = await del.handle({ id: firstRecord.id }, undefined, {})

  expect(delResult.code).toBe(401)
  expect(delResult.response).toHaveProperty('code', 401)

  await expectGetToReturnRecords(recordOriginal, {}, get, authInput)

  const secondRecord = record.shift()

  const delResult2 = await del.handle({ }, secondRecord.id, unAuthorized)

  expect(delResult2.code).toBe(403)
  expect(delResult2.response).toHaveProperty('code', 403)

  await expectGetToReturnRecords(recordOriginal, {}, get, authInput)
}
