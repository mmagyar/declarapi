import { Expressable, HandleType } from '../../../src/runtime/registerRestMethods'
import { AuthInput } from '../../../src'
import { postRecords } from './post'
import { expectGetToReturnRecords } from './get'

export const canDeleteOneOfMany = async (post:Expressable, del:Expressable, get: HandleType, authInput:AuthInput = {}) => {
  const record:any[] = await postRecords(post, authInput, 20)
  const firstRecord = record.shift()

  const delResult = await del.handle({ id: firstRecord.id })

  expect(delResult.code).toBe(200)
  expect(delResult.response).toStrictEqual([firstRecord])

  await expectGetToReturnRecords(record, {}, get, authInput)

  const secondRecord = record.shift()

  const delResult2 = await del.handle({ }, secondRecord.id)

  expect(delResult2.code).toBe(200)
  expect(delResult2.response).toStrictEqual(secondRecord)

  await expectGetToReturnRecords(record, {}, get, authInput)
}

export const canDeleteSomeOfMany = async (post:Expressable, del:Expressable, get: HandleType, authInput:AuthInput = {}) => {
  const recordCount = 20
  const record:any[] = await postRecords(post, authInput, recordCount)
  const toDelete = []
  const deleteCount = Math.floor(Math.random() * (recordCount - 3)) + 2
  expect(deleteCount).toBeGreaterThan(1)
  expect(deleteCount).toBeLessThan(recordCount)
  for (let i = 0; i < deleteCount; i++) {
    toDelete.push(Math.random() > 0.5 ? record.shift() : record.pop())
  }
  const delResult = await del.handle({ id: toDelete.map((x:any) => x.id) })
  expect(delResult.code).toBe(200)
  expect(delResult.response).toStrictEqual(toDelete)

  await expectGetToReturnRecords(record, {}, get, authInput)
}

export const canDeleteAll = async (post:Expressable, del:Expressable, get: HandleType, authInput:AuthInput = {}) => {
  const recordCount = 20
  const record:any[] = await postRecords(post, authInput, recordCount)

  const delResult = await del.handle({ id: record.map((x:any) => x.id) })
  expect(delResult.code).toBe(200)
  expect(delResult.response).toStrictEqual(record)

  await expectGetToReturnRecords([], {}, get, authInput)
}
