import { HandleType, HandleResponse } from '../../src/runtime/registerRestMethods'
import { mapToArray } from 'microtil'

const expectEmptyResponse = (response:HandleResponse) => {
  expect(response).toHaveProperty('code', 200)
  expect(response).toHaveProperty('result')
  expect(Array.isArray(response.response)).toBeTruthy()
  expect(response.response).toHaveLength(0)
}
export const argumentVariations = {
  empty: [{}],
  singleIdInBody: [{ id: 'abc' }],
  singleIdInArrayInBody: [{ id: ['abc'] }],
  arrayOfTwoIdsInBody: [{ id: ['abc', 'xzy'] }],
  arrayOfFiveIdsInBody: [{ id: ['abc', 'xzy', '1', '2', 'fda'] }],
  idInParam: [{}, 'abc'],
  emptyArrayOfIds: [{ id: [] }]
}
export const expectEmpty = async (get: HandleType) =>
  Promise.all(mapToArray(argumentVariations,
    async (arg) => expectEmptyResponse(await get.apply(undefined, arg))))

export const expectEmptyWithTextSearch = async (get: HandleType) => {
  expectEmptyResponse(await get({ search: '' }))
  expectEmptyResponse(await get({ search: 'random' }))
  expectEmptyResponse(await get({ search: '*' }))
}
