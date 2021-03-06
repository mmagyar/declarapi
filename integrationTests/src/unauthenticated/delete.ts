import { HandleType, HttpWrapped } from 'declarapi-runtime/registerRestMethods'
import { AuthInput } from 'declarapi-runtime'
import { postRecords } from './post'
import { expectGetToReturnRecords } from './get'

export const canDeleteOneOfMany = async (post:HttpWrapped<any, any>, del:HttpWrapped<any, any>, get: HandleType, authInput:AuthInput = {}) => {
  const record:any[] = await postRecords(post, authInput, 20)
  const firstRecord = record.shift()

  const delResult = await del.handle({ id: firstRecord.id }, undefined, authInput)

  expect(delResult.status).toBe(200)
  expect(delResult.response).toStrictEqual([firstRecord])

  await expectGetToReturnRecords(record, {}, get, authInput)

  const secondRecord = record.shift()

  const delResult2 = await del.handle({ }, secondRecord.id, authInput)

  expect(delResult2.status).toBe(200)
  expect(delResult2.response).toStrictEqual(secondRecord)

  await expectGetToReturnRecords(record, {}, get, authInput)
}

export const canDeleteSomeOfMany = async (post:HttpWrapped<any, any>, del:HttpWrapped<any, any>, get: HandleType, authInput:AuthInput = {}) => {
  const recordCount = 20
  const record:any[] = await postRecords(post, authInput, recordCount)
  const toDelete = []
  const deleteCount = Math.floor(Math.random() * (recordCount - 3)) + 2
  expect(deleteCount).toBeGreaterThan(1)
  expect(deleteCount).toBeLessThan(recordCount)
  for (let i = 0; i < deleteCount; i++) {
    toDelete.push(Math.random() > 0.5 ? record.shift() : record.pop())
  }
  const delResult = await del.handle({ id: toDelete.map((x:any) => x.id) }, undefined, authInput)
  expect(delResult.status).toBe(200)
  expect(delResult.response).toStrictEqual(toDelete)

  await expectGetToReturnRecords(record, {}, get, authInput)
}

export const canDeleteAll = async (post:HttpWrapped<any, any>, del:HttpWrapped<any, any>, get: HandleType, authInput:AuthInput = {}) => {
  const recordCount = 20
  const record:any[] = await postRecords(post, authInput, recordCount)

  const delResult = await del.handle({ id: record.map((x:any) => x.id) }, undefined, authInput)
  expect(delResult.status).toBe(200)
  expect(delResult.response).toStrictEqual(record)

  await expectGetToReturnRecords([], {}, get, authInput)
}
