import { HandleType, HandleResponse } from '../../../src/runtime/registerRestMethods'
import { ArgumentVariations } from '../common'

const expectEmptyResponse = (response:HandleResponse) => {
  expect(response).toHaveProperty('code', 200)
  expect(response).toHaveProperty('response')
  expect(Array.isArray(response.response)).toBeTruthy()
  expect(response.response).toHaveLength(0)
}

const expect404 = (response:HandleResponse) => {
  expect(response).toHaveProperty('code', 404)
  expect(response).toHaveProperty('response')
}

export const argumentFor404:ArgumentVariations = {
  singleIdInBody: [{ id: 'abc' }],
  idInParam: [{}, 'abc']
}
export const argumentForEmpty:ArgumentVariations = {
  empty: [{}],
  singleIdInArrayInBody: [{ id: ['abc'] }],
  arrayOfTwoIdsInBody: [{ id: ['abc', 'xzy'] }],
  arrayOfFiveIdsInBody: [{ id: ['abc', 'xzy', '1', '2', 'fda'] }],
  emptyArrayOfIds: [{ id: [] }]
}

export const expectNotFound = async (get: HandleType) => {
  expect404(await get.apply(undefined, argumentFor404.singleIdInBody))
  expect404(await get.apply(undefined, argumentFor404.idInParam))
}

export const expectEmpty = async (get: HandleType) => {
  expectEmptyResponse(await get.apply(undefined, argumentForEmpty.empty))
  expectEmptyResponse(await get.apply(undefined, argumentForEmpty.singleIdInArrayInBody))
  expectEmptyResponse(await get.apply(undefined, argumentForEmpty.arrayOfTwoIdsInBody))
  expectEmptyResponse(await get.apply(undefined, argumentForEmpty.arrayOfFiveIdsInBody))
  expectEmptyResponse(await get.apply(undefined, argumentForEmpty.emptyArrayOfIds))
}

export const expectEmptyWithTextSearch = async (get: HandleType) => {
  expectEmptyResponse(await get({ search: '' }))
  expectEmptyResponse(await get({ search: 'random' }))
  expectEmptyResponse(await get({ search: '*' }))
}
