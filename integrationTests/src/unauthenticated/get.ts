import { HandleType, HandleResponse, Expressable } from 'declarapi-runtime/registerRestMethods'
import { ArgumentVariations } from '../common'
import { AuthInput } from 'declarapi-runtime'

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

export const argumentFor404: (auth: AuthInput)=> ArgumentVariations = (authInput:AuthInput) => ({
  singleIdInBody: [{ id: 'abc' }, undefined, authInput],
  idInParam: [{}, 'abc', authInput]
})

export const argumentForEmpty: (auth: AuthInput)=> ArgumentVariations = (authInput:AuthInput) => ({
  empty: [{}, undefined, authInput],
  singleIdInArrayInBody: [{ id: ['abc'] }, undefined, authInput],
  arrayOfTwoIdsInBody: [{ id: ['abc', 'xzy'] }, undefined, authInput],
  arrayOfFiveIdsInBody: [{ id: ['abc', 'xzy', '1', '2', 'fda'] }, undefined, authInput],
  emptyArrayOfIds: [{ id: [] }, undefined, authInput]
})

export const expectNotFound = async (get: HandleType, authInput:AuthInput = {}) => {
  const inputs = argumentFor404(authInput)
  expect404(await get.apply(undefined, inputs.singleIdInBody))
  expect404(await get.apply(undefined, inputs.idInParam))
}
export const expectEmptyWhenNoRecordsPresent = async (get: HandleType, authInput:AuthInput = {}) => {
  expectEmptyResponse(await get.apply(undefined, argumentForEmpty(authInput).empty))
}
export const expectEmptyForNonMatchingInput = async (get: HandleType, authInput:AuthInput = {}) => {
  const inputs = argumentForEmpty(authInput)
  expectEmptyResponse(await get.apply(undefined, inputs.singleIdInArrayInBody))
  expectEmptyResponse(await get.apply(undefined, inputs.arrayOfTwoIdsInBody))
  expectEmptyResponse(await get.apply(undefined, inputs.arrayOfFiveIdsInBody))
  expectEmptyResponse(await get.apply(undefined, inputs.emptyArrayOfIds))
}

export const expectEmptyWithTextSearch = async (get: HandleType, authInput:AuthInput = {}) => {
  expectEmptyResponse(await get({ search: '' }, undefined, authInput))
  expectEmptyResponse(await get({ search: 'random' }, undefined, authInput))
  expectEmptyResponse(await get({ search: '*' }, undefined, authInput))
}

export const expectGetToReturnRecords = async (records:any[], getArguments: any = {}, get:HandleType, authInput:AuthInput = {}) => {
  const getResult = await get(getArguments, undefined, authInput)
  expect(getResult.code).toBe(200)

  // Order does not matter, use set, and check length to make sure they are the same
  expect(getResult.response).toHaveLength(records.length)
  expect(new Set(getResult.response)).toStrictEqual(new Set(records))

  return getResult.response
}

export const expectFirstRecordToEqual = async (record:any, getArguments: any = {}, get:HandleType, authInput:AuthInput = {}) => {
  const getResult = await get(getArguments, undefined, authInput)
  expect(getResult.code).toBe(200)

  // Order does not matter, use set, and check length to make sure they are the same
  expect(getResult.response.length).toBeGreaterThan(0)
  expect(getResult.response[0]).toStrictEqual(record)

  return getResult.response
}

export const findFirstTextFieldContent = (record:any, get:Expressable) => {
  const managedField = Object.keys(get.contract.manageFields)
  return Object.entries(record).map(([key, value]) =>
    !([...managedField, 'id'].includes(key)) && typeof value === 'string'
      ? value : undefined).find(x => x) || ''
}
