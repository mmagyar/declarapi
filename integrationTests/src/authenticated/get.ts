import { argumentForEmpty, argumentFor404 } from '../unauthenticated/get'
import { HandleResponse, HandleType } from '../../../src/runtime/registerRestMethods'
import { AuthInput } from '../../../src'

const expect401 = (response:HandleResponse) => {
  expect(response).toHaveProperty('code', 401)
  expect(response).toHaveProperty('response')
}

const expect403 = (response:HandleResponse) => {
  expect(response).toHaveProperty('code', 403)
  expect(response).toHaveProperty('response')
}

export const expect401ForUnauthenticatedUser = (get: HandleType) => {
  const empty = [...Object.values(argumentForEmpty({})), ...Object.values(argumentFor404({}))]
  return Promise.all(empty.map(x => get.apply(undefined, x).then(x => expect401(x))))
}

export const expect403ForUnauthorizedUser = (get: HandleType, authInput:AuthInput) => {
  const empty = [...Object.values(argumentForEmpty(authInput)), ...Object.values(argumentFor404(authInput))]
  return Promise.all(empty.map(x => get.apply(undefined, x).then(x => expect403(x))))
}
