import { ValueType, ObjectType, StringType } from 'yaschva'
import { map } from 'microtil'
import { validate, isValidationError } from './jsonSchema'
import {
  CrudContract,

  CrudAuthAll,
  CrudAuthSome, OutputSuccess, Output, baseSchemaLocation
} from './types'
import {
  HttpMethods,
  SearchTypes
} from '../globalTypes'

const contractOptions = (input: ValueType | ValueType[]): ValueType[] => {
  if (Array.isArray(input)) {
    if (input.some(x => x === '?')) { return input }

    return input.concat(['?'])
  }
  return [input, '?']
}

const searchToType =
  (idType: 'string'| StringType, dataType: ObjectType, search?: SearchTypes): ObjectType => {
    if (search === 'idOnly') {
      return { id: [idType, { $array: idType }, '?'] }
    } else if (search === 'textSearch') {
      return { search: ['string', '?'], id: [idType, { $array: idType }, '?'] }
    } else if (search === 'full') {
      return map(dataType, value => contractOptions(value))
    } else if (!search) {
      return {}
    }

    return search
  }

const isCrudAuth = (tbd: any): tbd is CrudAuthAll => tbd.post !== undefined
const isCrudAuthSome = (tbd: any): tbd is CrudAuthSome => tbd.modify !== undefined

export const transform = async (data:CrudContract | any): Promise<Output> => {
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
    authentication: auth[method],
    search: contractData.search,
    preferredImplementation: contractData.preferredImplementation,
    arguments: args,
    returns
  })

  if (contractData.dataType.id === undefined) {
    return {
      type: 'error',
      errors: 'id field does not exist in the data declaration'
    }
  }

  const idType: any = contractData.dataType.id

  if (!(idType === 'string' || idType.$string)) {
    return {
      type: 'error',
      errors: 'Type of id field must be string'
    }
  }

  const returnArray = { $array: contractData.dataType }
  const output: OutputSuccess[] = []

  if (contractData.methods?.get !== false) {
    const search = contractData.search
    output.push(createOutput('get',
      searchToType(idType, contractData.dataType, search), returnArray))
  }

  if (contractData.methods?.post !== false) {
    const post = { ...contractData.dataType, id: [idType, '?'] }
    output.push(createOutput('post', post))
  }

  if (contractData.methods?.put !== false) {
    output.push(createOutput('put'))
  }

  if (contractData.methods?.patch !== false) {
    const patch: {[s: string]: ValueType | ValueType[];} =
    { ...map(contractData.dataType, contractOptions), id: idType }
    output.push(createOutput('patch', patch))
  }

  if (contractData.methods?.delete !== false) {
    const deleteIds: {[s: string]: ValueType[];} = { id: [idType, { $array: idType }] }
    output.push(createOutput('delete', deleteIds, returnArray))
  }

  return { type: 'result', key: contractData.name, results: output }
}

export default transform
