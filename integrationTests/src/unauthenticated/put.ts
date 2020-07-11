import { Expressable, HandleType } from '../../../src/runtime/registerRestMethods'
import { postRecords } from './post'
import { AuthInput } from '../../../src'
import { getFirstStringFieldName } from '../common'
import { generate } from 'yaschva'
import { expectEmptyWhenNoRecordsPresent } from './get'

export const canPatch = async (post:Expressable, patch:Expressable, get: HandleType, authInput:AuthInput) => {
  const posted = await postRecords(post, authInput)

  const postFirst:any = posted[0]
  const patching:any = {}
  const stringFieldName = getFirstStringFieldName(post.contract.returns)
  let generatedInput = postFirst[stringFieldName]

  while (generatedInput === postFirst[stringFieldName]) {
    generatedInput = generate('string')
  }
  patching[stringFieldName] = generatedInput
  const res = await patch.handle(patching, postFirst.id, authInput)
  expect(res.code).toBe(200)
  const toExpectPatchReturn = { ...postFirst }
  toExpectPatchReturn[stringFieldName] = generatedInput
  expect(res.response).toStrictEqual(toExpectPatchReturn)

  const toExpectAll = [...posted]
  toExpectAll[0] = toExpectPatchReturn
  const getResult = await get({}, undefined, authInput)
  expect(getResult.code).toBe(200)
  expect(getResult.response).toHaveLength(toExpectAll.length)

  expect(new Set(getResult.response)).toStrictEqual(new Set(toExpectAll))
}

export const cantPatchNonExistent = async (post:Expressable, patch:Expressable, get: HandleType, authInput:AuthInput) => {
  const res = await patch.handle(generate(post.contract.returns), undefined, authInput)
  expect(res.code).toBe(404)

  expect(res.response).toHaveProperty('code', 404)
  await expectEmptyWhenNoRecordsPresent(get)
}

export const cantChangeId = async (post:Expressable, patch:Expressable, get: HandleType, authInput:AuthInput) => {
  const posted = await postRecords(post, authInput)

  const postFirst:any = posted[0]
  const patching:any = {}
  const stringFieldName = getFirstStringFieldName(post.contract.returns)
  let generatedInput = postFirst[stringFieldName]

  while (generatedInput === postFirst[stringFieldName]) {
    generatedInput = generate('string')
  }
  patching[stringFieldName] = generatedInput
  patching.id = 'newId'
  const res = await patch.handle(patching, postFirst.id, authInput)
  expect(res.code).toBe(400)

  const res2 = await patch.handle({ id: postFirst.id }, 'newId', authInput)
  expect(res2.code).toBe(400)

  patching.id = postFirst.id
  const res3 = await patch.handle(patching, 'newId', authInput)
  expect(res3.code).toBe(400)
}
