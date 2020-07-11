import { Expressable, HandleType } from '../../../src/runtime/registerRestMethods'
import { AuthInput } from 'declarapi'
import { checkedGenerate, getFirstStringFieldName } from '../common'
import { generate } from 'yaschva'

export const postRecords = async (post:Expressable, authInput:AuthInput, howMany:number = 20) => {
  const posted = (await Promise.all(
    [...Array(howMany).keys()].map(() => checkedGenerate(post, authInput))
  )).map(x => x.output)
  expect(posted).toHaveLength(howMany)
  return posted
}

export const postAndGetRecordsByEmptyGet = async (post:Expressable, get: HandleType, authInput:AuthInput) => {
  const posted = await postRecords(post, authInput)
  const result = await get({ }, undefined, {})

  expect(result.code).toBe(200)
  // Use set because the order does not matter.
  expect(result.response).toHaveLength(posted.length)
  expect(new Set(result.response)).toStrictEqual(new Set(posted))

  return result.response
}

export const postAndGetRecordsByIdParam = async (post:Expressable, get: HandleType, authInput:AuthInput) => {
  const posted = await postRecords(post, authInput)
  const result = await (Promise.all(posted.map((x:any) => get({}, x.id, authInput))))
  expect(result.find(x => x.code !== 200)).toBeFalsy()
  // Use strict equal because the order also needs to match
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
export const postAndGetAvailableIdsIgnoringWrong = async (post:Expressable, get: HandleType, authInput:AuthInput) => {
  const posted = await postRecords(post, authInput)
  const getBack = posted.filter((_, i) => i % 2 === 0)
  const id = getBack.map((x:any) => x.id).concat(['invalidId1', 'invalidId2', 'invalidId3'])
  const result = await get({ id }, undefined, {})

  expect(result.code).toBe(200)
  // Use set because the order does not matter.
  expect(result.response).toHaveLength(getBack.length)
  expect(new Set(result.response)).toStrictEqual(new Set(getBack))

  return result.response
}

export const postAndGetByTextSearch = async (post:Expressable, get: HandleType, authInput:AuthInput) => {
  const posted = await postRecords(post, authInput)
  const first:any = posted[0]
  const textToSearch = first[getFirstStringFieldName(post.contract.returns)]

  const result = await get({ search: textToSearch })
  expect(result.code).toBe(200)
  expect(result.response[0]).toStrictEqual(first)
}

export const postAndRejectRePost = async (post:Expressable, get: HandleType, authInput:AuthInput) => {
  const posted = await postAndGetRecordsByEmptyGet(post, get, authInput)
  const handled:any = await post.handle(posted[0], undefined, authInput)
  expect(handled).toHaveProperty('code', 409)
  expect(handled.response).toHaveProperty('code', 409)
  expect(handled.response).toHaveProperty('data')

  const result = await get({ }, undefined, {})

  expect(result.code).toBe(200)
  // Use set because the order does not matter.
  expect(result.response).toHaveLength(posted.length)
  expect(new Set(result.response)).toStrictEqual(new Set(posted))
}

export const postAndRejectPostWithSameId = async (post:Expressable, get: HandleType, authInput:AuthInput) => {
  const posted = await postAndGetRecordsByEmptyGet(post, get, authInput)
  const newPost = generate(post.contract.arguments)
  newPost.id = posted[0].id
  const handled:any = await post.handle(newPost, undefined, authInput)
  expect(handled).toHaveProperty('code', 409)
  expect(handled.response).toHaveProperty('code', 409)
  expect(handled.response).toHaveProperty('data')

  const result = await get({ }, undefined, {})

  expect(result.code).toBe(200)
  // Use set because the order does not matter.
  expect(result.response).toHaveLength(posted.length)
  expect(new Set(result.response)).toStrictEqual(new Set(posted))
}
