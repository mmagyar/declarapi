import { Expressable, HandleType } from '../../../src/runtime/registerRestMethods'
import { AuthInput } from '../../../src'
import { getFirstStringFieldName, removeManaged } from '../common'
import { postRecords } from '../unauthenticated/post'
import { generate } from 'yaschva'
import { expectGetToReturnRecords } from '../unauthenticated/get'

export const cantPatch = async (post:Expressable, patch:Expressable, get: HandleType, authInput:AuthInput, unAuthorized:AuthInput) => {
  const posted = await postRecords(post, authInput)

  const postFirst:any = posted[0]
  const patching:any = {}
  const stringFieldName = getFirstStringFieldName(post.contract.returns)
  let generatedInput = postFirst[stringFieldName]

  while (generatedInput === postFirst[stringFieldName]) {
    generatedInput = generate('string')
  }
  patching[stringFieldName] = generatedInput
  const patchResult = await patch.handle(patching, postFirst.id, {})
  expect(patchResult.code).toBe(401)
  expect(patchResult.response).toHaveProperty('code', 401)
  expect(patchResult.response).toHaveProperty('errorType', 'unauthorized')

  await expectGetToReturnRecords(posted, {}, get, authInput)

  const patchResult2 = await patch.handle(patching, postFirst.id, unAuthorized)
  expect(patchResult2.code).toBe(403)
  expect(patchResult2.response).toHaveProperty('code', 403)
  expect(patchResult2.response).toHaveProperty('errorType')
  await expectGetToReturnRecords(posted, {}, get, authInput)
}

export const cantChangeCreatedBy = async (post:Expressable, patch:Expressable, get: HandleType, authInput:AuthInput, adminUser:AuthInput) => {
  const posted :any[] = await postRecords(post, authInput)

  const patching:any = { ...removeManaged(posted[0], post.contract.manageFields), createdBy: adminUser.sub }

  const patchResult2 = await patch.handle(patching, patching.id, adminUser)
  expect(patchResult2.code).toBe(400)
  expect(patchResult2.response).toHaveProperty('code', 400)
  expect(patchResult2.response).toHaveProperty('errorType')
  await expectGetToReturnRecords(posted, {}, get, authInput)
}
