import { Expressable, HandleType } from '../../../src/runtime/registerRestMethods'
import { AuthInput } from 'declarapi'
import { checkedGenerate } from '../common'

export const postRecords = async (post:Expressable, authInput:AuthInput, howMany:number = 20) => {
  const posted = (await Promise.all(
    [...Array(howMany).keys()].map(() => checkedGenerate(post, authInput))
  )).map(x => x.output)
  expect(posted).toHaveLength(howMany)
  return posted
}

export const postAndGetRecordsByIdParam = async (post:Expressable, get: HandleType, authInput:AuthInput) => {
  const posted = await postRecords(post, authInput)
  const result = await (Promise.all(posted.map((x:any) => get({}, x.id, authInput))))
  expect(result.find(x => x.code !== 200)).toBeFalsy()
  expect(result.map(x => x.response)).toStrictEqual(posted)
}

export const postAndGetRecordsByIdArray = async (post:Expressable, get: HandleType, authInput:AuthInput) => {
  const posted = await postRecords(post, authInput)
  const result = await get({ id: posted.map((x:any) => x.id) }, undefined, {})

  expect(result.code).toBe(200)
  expect(result.response).toStrictEqual(posted)
}

export const postAndGetSomeRecordsByIdArray = async (post:Expressable, get: HandleType, authInput:AuthInput) => {
  const posted = await postRecords(post, authInput)
  const half = Math.ceil(posted.length / 2)

  const id = posted.map((x:any) => x.id).slice(0, half)
  const result = await get({ id }, undefined, {})

  expect(result.code).toBe(200)
  expect(result.response).toHaveLength(half)
  result.response.forEach((x:any) => expect(x).toStrictEqual(posted.find((y:any) => x.id === y.id)))
}
