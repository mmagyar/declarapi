import { Expressable, HandleType } from '../../../src/runtime/registerRestMethods'
import { AuthInput } from '../../../src'
import { postRecords } from '../unauthenticated/post'
import { generate } from 'yaschva'
import { expectGetToReturnRecords } from '../unauthenticated/get'
import { removeManaged } from '../common'

export const cantPut = async (post:Expressable, put:Expressable, get: HandleType, authInput:AuthInput, unAuthorized:AuthInput) => {
  const posted = await postRecords(post, authInput)

  const postFirst:any = posted[0]
  const putting:any = removeManaged(generate(post.contract.returns), post.contract.manageFields)
  putting.id = postFirst.id
  const putResult = await put.handle(putting, postFirst.id, {})
  expect(putResult.code).toBe(401)
  expect(putResult.response).toHaveProperty('code', 401)
  expect(putResult.response).toHaveProperty('errorType', 'unauthorized')

  await expectGetToReturnRecords(posted, {}, get, authInput)

  const putResult2 = await put.handle(putting, postFirst.id, unAuthorized)
  expect(putResult2.code).toBe(403)
  expect(putResult2.response).toHaveProperty('code', 403)
  expect(putResult2.response).toHaveProperty('errorType')
  await expectGetToReturnRecords(posted, {}, get, authInput)
}
