import { Expressable, HandleType } from '../../../src/runtime/registerRestMethods.js'
import { AuthInput } from '../../../src.js'
import { postRecords } from './post.js'
import { getFirstStringFieldName, generateForFirstTextField, removeManaged } from '../common.js'
import { generate } from 'yaschva'
import { expectGetToReturnRecords, expectEmptyWhenNoRecordsPresent } from './get.js'

export const canPatch = async (post:Expressable, patch:Expressable, get: HandleType, postAuth:AuthInput, patchAuth?:AuthInput) => {
  const posted = await postRecords(post, postAuth)

  const postFirst:any = posted[0]
  const patching:any = {}
  const stringFieldName = getFirstStringFieldName(post.contract.returns)
  let generatedInput = postFirst[stringFieldName]

  while (generatedInput === postFirst[stringFieldName]) {
    generatedInput = generate('string')
  }
  patching[stringFieldName] = generatedInput
  const patchResult = await patch.handle(patching, postFirst.id, patchAuth || postAuth)
  expect(patchResult.code).toBe(200)
  const toExpectPatchReturn = { ...postFirst }
  toExpectPatchReturn[stringFieldName] = generatedInput
  expect(patchResult.response).toStrictEqual(toExpectPatchReturn)

  const toExpectAll = [...posted]
  toExpectAll[0] = toExpectPatchReturn
  await expectGetToReturnRecords(toExpectAll, {}, get, postAuth)
}

export const cantPatchNonExistent = async (post:Expressable, patch:Expressable, get: HandleType, authInput:AuthInput) => {
  const bodyOnlyResult = await patch.handle(
    removeManaged(generate(post.contract.returns), post.contract.manageFields), undefined, authInput)
  expect(bodyOnlyResult.code).toBe(404)
  expect(bodyOnlyResult.response).toHaveProperty('code', 404)

  const generated = removeManaged(generate(post.contract.returns), post.contract.manageFields)
  const withIdResult = await patch.handle(generated, generated.id, authInput)
  expect(withIdResult.code).toBe(404)
  expect(withIdResult.response).toHaveProperty('code', 404)

  await expectEmptyWhenNoRecordsPresent(get, authInput)
}

export const patchCantChangeId = async (post:Expressable, patch:Expressable, get: HandleType, authInput:AuthInput) => {
  const posted = await postRecords(post, authInput)

  const postFirst:any = posted[0]
  const patching:any = {}
  const generated = generateForFirstTextField(postFirst, post.contract.returns)
  patching[generated.key] = generated.value
  patching.id = 'newId'
  const res = await patch.handle(patching, postFirst.id, authInput)
  expect(res.code).toBe(400)
  expect(res.response).toHaveProperty('errorType', 'id mismatch')

  const res2 = await patch.handle({ id: postFirst.id }, 'newId', authInput)
  expect(res2.code).toBe(400)
  expect(res2.response).toHaveProperty('errorType', 'id mismatch')

  patching.id = postFirst.id
  const res3 = await patch.handle(patching, 'newId', authInput)
  expect(res3.code).toBe(400)
  expect(res3.response).toHaveProperty('errorType', 'id mismatch')

  return expectGetToReturnRecords(posted, {}, get, authInput)
}

export const patchCanNotRemoveOptionalParameters = async (post:Expressable, patch:Expressable, get: HandleType, authInput:AuthInput) => {
  const posted = await postRecords(post, authInput)

  const optionalParameter = Object.entries(post.contract.returns)
    .find(x => x[0] !== 'id' && (Array.isArray(x[1]) && x[1].find((y:any) => y === '?')))

  expect(optionalParameter).toHaveLength(2)
  const postWithOptional:any = posted.find((x:any) => x[optionalParameter?.[0] || ''])

  const lackingPatch = removeManaged(postWithOptional, post.contract.manageFields)
  delete lackingPatch[optionalParameter?.[0] || '']

  const patchResult = await patch.handle(lackingPatch, undefined, authInput)
  expect(patchResult.code).toBe(200)
  expect(patchResult.response).toStrictEqual(postWithOptional)

  await expectGetToReturnRecords(posted, {}, get, authInput)
}
