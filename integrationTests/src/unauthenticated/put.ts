import { Expressable, HandleType } from 'declarapi-runtime/registerRestMethods.js'
import { postRecords } from './post.js'
import { AuthInput } from 'declarapi-runtime'
import { generate } from 'yaschva'
import { expectEmptyWhenNoRecordsPresent, expectGetToReturnRecords } from './get.js'
import { generateForFirstTextField, removeManaged } from '../common.js'

export const canPut = async (post:Expressable, put:Expressable, get: HandleType, authInput:AuthInput) => {
  const posted = await postRecords(post, authInput)

  const postFirst:any = posted[0]
  const putting:any = removeManaged(generate(post.contract.returns), post.contract.manageFields)
  putting.id = postFirst.id
  const putResult = await put.handle(putting, postFirst.id, authInput)
  expect(putResult.code).toBe(200)
  if (post.contract.manageFields.createdBy) {
    putting.createdBy = authInput.sub
  }
  expect(putResult.response).toStrictEqual(putting)

  const toExpectAll:any = [...posted]
  toExpectAll[0] = { ...putting }
  if (post.contract.manageFields.createdBy) {
    toExpectAll[0].createdBy = authInput.sub
  }
  await expectGetToReturnRecords(toExpectAll, {}, get, authInput)
}

export const cantPutNonExistent = async (post:Expressable, put:Expressable, get: HandleType, authInput:AuthInput) => {
  const bodyOnlyResult = await put.handle(removeManaged(generate(post.contract.returns), post.contract.manageFields), undefined, authInput)
  expect(bodyOnlyResult.code).toBe(404)
  expect(bodyOnlyResult.response).toHaveProperty('code', 404)

  const generated = removeManaged(generate(post.contract.returns), post.contract.manageFields)
  const withIdResult = await put.handle(generated, generated.id, authInput)
  expect(withIdResult.code).toBe(404)
  expect(withIdResult.response).toHaveProperty('code', 404)

  await expectEmptyWhenNoRecordsPresent(get, authInput)
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

  const putResult = await put.handle(lackingPut, undefined, authInput)
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
  const lackingPut = removeManaged(postWithOptional, post.contract.manageFields)
  lackingPut[generated.key] = generated.value
  delete lackingPut[optionalParameter?.[0] || '']

  const putResult = await put.handle(lackingPut, undefined, authInput)
  expect(putResult.code).toBe(200)
  const toExpect = { ...lackingPut }
  if (post.contract.manageFields.createdBy) {
    toExpect.createdBy = authInput.sub
  }
  expect(putResult.response).toStrictEqual(toExpect)

  const newSet = posted.map((x:any) => x.id === lackingPut.id ? toExpect : x)
  await expectGetToReturnRecords(newSet, {}, get, authInput)
}
