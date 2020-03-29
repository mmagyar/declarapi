import { ValueType, ObjectType } from 'yaschva'
import { map } from 'microtil'
import { validate, isValidationError } from './JsonSchema'
import {
  CrudContract,
  HttpMethods,
  SearchTypes,
  CrudAuthAll,
  CrudAuthSome, OutputSuccess, Output
} from './Types'
const baseSchemaLocation = `${__dirname}/../../src/schema/`

const contractOptions = (input: ValueType | ValueType[]): ValueType[] => {
  if (Array.isArray(input)) {
    if (input.some(x => x === '?')) { return input }

    return input.concat(['?'])
  }
  return [input, '?']
}

const searchToType =
  (idFieldName: string, search: SearchTypes, dataType: ObjectType): ObjectType => {
    if (search === 'idOnly') {
      const ret: {[s: string]: any;} = {}
      ret[idFieldName] = ['string', { $array: 'string' }, '?']
      return ret
    } else if (search === 'textSearch') {
      const ret: {[s: string]: any;} = { search: ['string', '?'] }
      ret[idFieldName] = ['string', { $array: 'string' }, '?']
      return ret
    } else if (search === 'full') { return map(dataType, value => contractOptions(value)) }

    return search
  }

const isCrudAuth = (tbd: any): tbd is CrudAuthAll => tbd.post !== undefined
const isCrudAuthSome = (tbd: any): tbd is CrudAuthSome => tbd.modify !== undefined

export const generate = async (data:any): Promise<Output> => {
  const valid = await validate(require(`${baseSchemaLocation}crudContractSchema.json`), data)
  if (isValidationError(valid)) return valid

  const contractData: CrudContract = data

  const au = contractData.authentication
  const auth = {
    get: isCrudAuth(au) ? au.get : isCrudAuthSome(au) ? au.get : au,
    post: isCrudAuth(au) ? au.post : isCrudAuthSome(au) ? au.modify : au,
    put: isCrudAuth(au) ? au.put : isCrudAuthSome(au) ? au.modify : au,
    patch: isCrudAuth(au) ? au.put : isCrudAuthSome(au) ? au.modify : au,
    delete: isCrudAuth(au) ? au.delete : isCrudAuthSome(au) ? au.delete || au.modify : au
  }

  const createOutput = (method: HttpMethods, args: ObjectType = contractData.dataType,
    returns: ObjectType = contractData.dataType): OutputSuccess => ({
    method,
    name: contractData.name,
    idFieldName: contractData.idFieldName || 'id',
    authentication: auth[method],
    search: contractData.search,
    preferredImplementation: contractData.preferredImplementation,
    arguments: args,
    returns
  })
  const idName = contractData.idFieldName || 'id'

  if (contractData.dataType[idName] === undefined) {
    throw new Error(`Field with the name set for idFieldName:
      ${idName} does not exist in the data declaration`)
  }

  if (contractData.dataType[idName] !== 'string') { throw new Error('Type of id field must be string') }

  const search = contractData.search || 'textSearch'
  const returnArray = { $array: contractData.dataType }
  const post = { ...contractData.dataType }
  post[idName] = ['string', '?']
  const patch: {[s: string]: ValueType | ValueType[];} =
      { ...map(contractData.dataType, contractOptions) }
  patch[idName] = 'string'
  const deleteIds: {[s: string]: ValueType[];} = {}
  deleteIds[idName] = ['string', { $array: 'string' }]
  const output: OutputSuccess[] = [
    createOutput('get',
      searchToType(idName, search, contractData.dataType), returnArray),
    createOutput('post', post),
    createOutput('put'),
    createOutput('patch', patch),
    createOutput('delete', deleteIds, returnArray)
  ]
  return { type: 'result', key: contractData.name, results: output }
}
