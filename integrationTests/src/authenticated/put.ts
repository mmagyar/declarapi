import { HandleType, HttpWrapped } from 'declarapi-runtime/registerRestMethods'
import { AuthInput } from 'declarapi-runtime'
import { postRecords } from '../unauthenticated/post'
import { generate } from 'yaschva'
import { expectGetToReturnRecords } from '../unauthenticated/get'
import { removeManaged } from '../common'

export const cantPut = async (post:HttpWrapped<any, any>, put:HttpWrapped<any, any>, get: HandleType, authInput:AuthInput, unAuthorized:AuthInput) => {
  const posted = await postRecords(post, authInput)

  const postFirst:any = posted[0]
  const putting:any = removeManaged(generate(post.contract.returns), post.contract.manageFields)
  putting.id = postFirst.id
  const putResult = await put.handle(putting, postFirst.id, {})
  expect(putResult.status).toBe(401)
  expect(putResult.response).toHaveProperty('status', 401)
  expect(putResult.response).toHaveProperty('errorType', 'unauthorized')

  await expectGetToReturnRecords(posted, {}, get, authInput)

  const putResult2 = await put.handle(putting, postFirst.id, unAuthorized)
  expect(putResult2.status).toBe(403)
  expect(putResult2.response).toHaveProperty('status', 403)
  expect(putResult2.response).toHaveProperty('errorType')
  await expectGetToReturnRecords(posted, {}, get, authInput)
}

export const cantChangeCreatedBy = async (post:HttpWrapped<any, any>, put:HttpWrapped<any, any>, get: HandleType, authInput:AuthInput, adminAuth:AuthInput) => {
  const posted:any[] = await postRecords(post, authInput)

  const postFirst:any = { ...removeManaged(posted[0], post.contract.manageFields), createdBy: adminAuth.sub }

  const putResult = await put.handle(postFirst, postFirst.id, adminAuth)
  expect(putResult.status).toBe(400)
  expect(putResult.response).toHaveProperty('status', 400)
  expect(putResult.response).toHaveProperty('errorType')

  await expectGetToReturnRecords(posted, {}, get, authInput)
}
