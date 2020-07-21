import { Expressable, HandleType } from '../../../src/runtime/registerRestMethods'
import { postRecords } from './post'
import { AuthInput } from '../../../src'
import { generate } from 'yaschva'
import { expectEmptyWhenNoRecordsPresent, expectGetToReturnRecords } from './get'
import { generateForFirstTextField } from '../common'

export const canPut = async (post:Expressable, put:Expressable, get: HandleType, authInput:AuthInput) => {
  const posted = await postRecords(post, authInput)

  const postFirst:any = posted[0]
  const putting:any = generate(post.contract.returns)
  putting.id = postFirst.id
  const patchResult = await put.handle(putting, postFirst.id, authInput)
  expect(patchResult.code).toBe(200)
  expect(patchResult.response).toStrictEqual(putting)

  const toExpectAll = [...posted]
  toExpectAll[0] = putting
  await expectGetToReturnRecords(toExpectAll, {}, get, authInput)
}

export const cantPutNonExistent = async (post:Expressable, put:Expressable, get: HandleType, authInput:AuthInput) => {
  const bodyOnlyResult = await put.handle(generate(post.contract.returns), undefined, authInput)
  expect(bodyOnlyResult.code).toBe(404)
  expect(bodyOnlyResult.response).toHaveProperty('code', 404)

  const generated = generate(post.contract.returns)
  const withIdResult = await put.handle(generated, generated.id, authInput)
  expect(withIdResult.code).toBe(404)
  expect(withIdResult.response).toHaveProperty('code', 404)

  await expectEmptyWhenNoRecordsPresent(get)
}

export const putCantChangeId = async (post:Expressable, put:Expressable, get: HandleType, authInput:AuthInput) => {
  const posted = await postRecords(post, authInput)

  const postFirst:any = posted[0]
  const patching:any = { ...postFirst }
  const generated = generateForFirstTextField(postFirst, post.contract.returns)
  patching[generated.key] = generated.value
  patching.id = 'newId'
  const res = await put.handle(patching, postFirst.id, authInput)
  expect(res.code).toBe(400)
  expect(res.response).toHaveProperty('errorType', 'id mismatch')

  const res2 = await put.handle({ id: postFirst.id }, 'newId', authInput)
  expect(res2.code).toBe(400)
  expect(res2.response).toHaveProperty('errorType', 'id mismatch')

  patching.id = postFirst.id
  const res3 = await put.handle(patching, 'newId', authInput)
  expect(res3.code).toBe(400)
  expect(res3.response).toHaveProperty('errorType', 'id mismatch')

  return expectGetToReturnRecords(posted, {}, get, authInput)
}

export const putRejectsPartialModification = async (post:Expressable, put:Expressable, get: HandleType, authInput:AuthInput) => {
  const posted = await postRecords(post, authInput)
  const postFirst:any = posted[0]
  const generated = generateForFirstTextField(postFirst, post.contract.returns)

  const nonOptionalParameter = Object.entries(post.contract.returns)
    .find(x => x[0] !== 'id' && x[0] !== generated.key && (!Array.isArray(x[1]) || !x[1].find((y:any) => y === '?')))

  expect(nonOptionalParameter).toHaveLength(2)
  const lackingPut = { ...postFirst }
  lackingPut[generated.key] = generated.value
  delete lackingPut[nonOptionalParameter?.[0] || '']

  const putResult = await put.handle(lackingPut)
  expect(putResult.code).toBe(400)

  await expectGetToReturnRecords(posted, {}, get, authInput)
}

export const putCanRemoveOptionalParameters = async (post:Expressable, put:Expressable, get: HandleType, authInput:AuthInput) => {
  const posted = await postRecords(post, authInput)
  const generated = generateForFirstTextField(posted[0], post.contract.returns)

  const optionalParameter = Object.entries(post.contract.returns)
    .find(x => x[0] !== 'id' && x[0] !== generated.key && (Array.isArray(x[1]) && x[1].find((y:any) => y === '?')))

  const postWithOptional:any = posted.find((x:any) => x[optionalParameter?.[0] || ''])

  expect(optionalParameter).toHaveLength(2)
  const lackingPut = { ...postWithOptional }
  lackingPut[generated.key] = generated.value
  delete lackingPut[optionalParameter?.[0] || '']

  const putResult = await put.handle(lackingPut)
  // console.log(putResult)
  expect(putResult.code).toBe(200)
  expect(putResult.response).toStrictEqual(lackingPut)

  const newSet = [...posted]
  newSet[0] = lackingPut
  await expectGetToReturnRecords(newSet, {}, get, authInput)
}
