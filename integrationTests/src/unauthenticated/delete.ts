import { Expressable, HandleType } from '../../../src/runtime/registerRestMethods'
import { AuthInput } from '../../../src'
import { postRecords } from './post'
import { expectGetToReturnRecords } from './get'

export const canDeleteOneOfMany = async (post:Expressable, del:Expressable, get: HandleType, authInput:AuthInput = {}) => {
  const record:any[] = await postRecords(post, authInput, 20)
  const firstRecord = record.shift()

  const delResult = await del.handle({ id: firstRecord.id })
  console.log(Array.isArray(delResult.response))

  expect(delResult.code).toBe(200)
  expect(delResult.response).toStrictEqual([firstRecord])

  await expectGetToReturnRecords(record, {}, get, authInput)

  const secondRecord = record.shift()

  /// There is something fishy here
  const delResult2 = await del.handle({ }, secondRecord.id)
  console.log(Array.isArray(delResult2.response))

  expect(delResult.code).toBe(200)
  expect(delResult.response).toStrictEqual(secondRecord)

  await expectGetToReturnRecords(record, {}, get, authInput)
}

export const canDeleteSomeOfMany = async (post:Expressable, del:Expressable, get: HandleType, authInput:AuthInput = {}) => {
  const record:any[] = await postRecords(post, authInput, 20)
  const firstRecord = record.shift()

  const delResult = await del.handle({}, firstRecord.id)
  expect(delResult.code).toBe(200)
  expect(delResult.response).toStrictEqual(firstRecord)

  await expectGetToReturnRecords(record, {}, get, authInput)
}
