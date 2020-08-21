import { argumentForEmpty, argumentFor404 } from '../unauthenticated/get'
import { HandleResponse, HandleType } from 'declarapi-runtime/registerRestMethods'
import { AuthInput } from 'declarapi-runtime'

const expect401 = (response:HandleResponse) => {
  expect(response).toHaveProperty('status', 401)
  expect(response).toHaveProperty('response')
  expect(response.response).toHaveProperty('status', 401)
  expect(response.response).toHaveProperty('data')
  expect(typeof response.response.data).toBe('object')
  expect(response.response).toHaveProperty('errorType', 'unauthorized')
  expect(response.response).toHaveProperty('errors', ['Only logged in users can do this'])
}

const expect403 = (response:HandleResponse) => {
  expect(response).toHaveProperty('status', 403)
  expect(response).toHaveProperty('response')
  expect(response.response).toHaveProperty('status', 403)

  expect(response.response).toHaveProperty('data')
  expect(typeof response.response.data).toBe('object')
  expect(response.response).toHaveProperty('errorType', 'forbidden')
  expect(response.response).toHaveProperty('errors', ['You don\'t have permission to do this'])
}

export const expect401ForUnauthenticatedUser = (get: HandleType) => {
  const empty = [...Object.values(argumentForEmpty({})), ...Object.values(argumentFor404({}))]
  return Promise.all(empty.map(x => get.apply(undefined, x).then(y => expect401(y))))
}

export const expect403ForUnauthorizedUser = (get: HandleType, authInput:AuthInput) => {
  const empty = [...Object.values(argumentForEmpty(authInput)), ...Object.values(argumentFor404(authInput))]
  return Promise.all(empty.map(x => get.apply(undefined, x).then(y => expect403(y))))
}
