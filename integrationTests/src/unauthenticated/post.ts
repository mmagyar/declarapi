import { Expressable, HandleType } from 'declarapi-runtime/registerRestMethods.js'
import { AuthInput } from 'declarapi-runtime'
import { checkedGenerate, removeManaged } from '../common.js'
import { generate } from 'yaschva'
import { expectGetToReturnRecords, expectFirstRecordToEqual, findFirstTextFieldContent } from './get.js'

export const postRecords = async (post:Expressable, authInput:AuthInput, howMany:number = 20) => {
  const posted = (await Promise.all(
    [...Array(howMany).keys()].map(() => checkedGenerate(post, authInput))
  )).map(x => x.output)
  expect(posted).toHaveLength(howMany)
  return posted
}

export const postAndGetRecordsByEmptyGet = async (post:Expressable, get: HandleType, authInput:AuthInput) => {
  const posted = await postRecords(post, authInput, 1)
  return expectGetToReturnRecords(posted, {}, get, authInput)
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
  return expectGetToReturnRecords(posted, { id: posted.map((x:any) => x.id) }, get, authInput)
}

export const postAndGetSomeRecordsByIdArray = async (post:Expressable, get: HandleType, authInput:AuthInput) => {
  const posted = await postRecords(post, authInput)
  const half = posted.slice(0, Math.ceil(posted.length / 2))

  const id = half.map((x:any) => x.id)
  return expectGetToReturnRecords(half, { id }, get, authInput)
}

export const postAndGetAvailableIdsIgnoringWrong = async (post:Expressable, get: HandleType, authInput:AuthInput) => {
  const posted = await postRecords(post, authInput)
  const getBack = posted.filter((_, i) => i % 2 === 0)
  const id = getBack.map((x:any) => x.id).concat(['invalidId1', 'invalidId2', 'invalidId3'])

  return expectGetToReturnRecords(getBack, { id }, get, authInput)
}

export const postAndGetByTextSearch = async (post:Expressable, get: Expressable, authInput:AuthInput) => {
  // NOTE: This may be a bit flakey,
  // since it's theoretically possible to have another text field with the same content,
  // because it's randomly generated.
  const posted :any[] = await postRecords(post, authInput)
  await expectFirstRecordToEqual(posted[1], {
    search: findFirstTextFieldContent(posted[1], get)
  }, get.handle, authInput)

  await expectFirstRecordToEqual(posted[3], {
    search: findFirstTextFieldContent(posted[3], get)
  }, get.handle, authInput)
}

export const postAndRejectRePost = async (post:Expressable, get: HandleType, authInput:AuthInput) => {
  const posted = await postAndGetRecordsByEmptyGet(post, get, authInput)
  const handled:any = await post.handle(removeManaged(posted[0], post.contract.manageFields), undefined, authInput)
  expect(handled).toHaveProperty('code', 409)
  expect(handled.response).toHaveProperty('code', 409)
  expect(handled.response).toHaveProperty('data')

  return expectGetToReturnRecords(posted, {}, get, authInput)
}

export const postAndRejectPostWithSameId = async (post:Expressable, get: HandleType, authInput:AuthInput) => {
  const posted = await postAndGetRecordsByEmptyGet(post, get, authInput)
  const newPost = generate(post.contract.arguments)
  newPost.id = posted[0].id
  const handled:any = await post.handle(newPost, undefined, authInput)
  expect(handled).toHaveProperty('code', 409)
  expect(handled.response).toHaveProperty('code', 409)
  expect(handled.response).toHaveProperty('data')

  return expectGetToReturnRecords(posted, {}, get, authInput)
}
