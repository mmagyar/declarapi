import { ValueType, ObjectType, StringType } from 'yaschva'
import { map } from 'microtil'
import { validate, isValidationError } from './jsonSchema'
import {
  CrudContract,

  CrudAuthAll,
  CrudAuthSome, OutputSuccess, Output, baseSchemaLocation, ManageableFields
} from './types'
import {
  HttpMethods,
  SearchTypes
} from 'declarapi-runtime'

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

const checkIdField = (contract:CrudContract) :Output | false => {
  if (contract.dataType.id === undefined) {
    return {
      type: 'error',
      errors: 'id field does not exist in the data declaration'
    }
  }

  const idType: any = contract.dataType.id
  if (!(idType === 'string' || idType.$string)) {
    return {
      type: 'error',
      errors: 'Type of id field must be string'
    }
  }

  return false
}
const checkManageFields = (contract: CrudContract): Output|false => {
  for (const [key, value] of Object.entries(contract.manageFields || {})) {
    if (value) {
      const fieldType: any = contract.dataType[key]
      if (fieldType === undefined) {
        return {
          type: 'error',
          errors: `managed field "${key}" is not present on data type`
        }
      }

      if (!(fieldType === 'string' || fieldType.$string)) {
        return {
          type: 'error',
          errors: `managed field "${key}" must be a string, current type :${fieldType}`
        }
      }
    }
  }

  return false
}

const removeManaged = (args: ObjectType, manageFields?: ManageableFields):ObjectType => {
  const result = { ...args }
  for (const [key, value] of Object.entries(manageFields || {})) {
    if (value) {
      delete result[key]
    }
  }

  return result
}
const isCrudAuth = (tbd: any): tbd is CrudAuthAll => tbd.post !== undefined
const isCrudAuthSome = (tbd: any): tbd is CrudAuthSome => tbd.modify !== undefined
const transformForPost = (tbd: any) => Array.isArray(tbd) && tbd.find(x => x.createdBy) ? true : tbd
export const transform = async (data:CrudContract | any): Promise<Output> => {
  const valid = await validate(require(`${baseSchemaLocation}crudContractSchema.json`), data)
  if (isValidationError(valid)) return valid

  const contractData: CrudContract = data

  const au = contractData.authentication

  const auth = {
    GET: isCrudAuth(au) ? au.get : (isCrudAuthSome(au) ? au.get : au),
    POST: isCrudAuth(au) ? au.post : transformForPost((isCrudAuthSome(au) ? au.modify : au)),
    PUT: isCrudAuth(au) ? au.put : (isCrudAuthSome(au) ? au.modify : au),
    PATCH: isCrudAuth(au) ? au.put : (isCrudAuthSome(au) ? au.modify : au),
    DELETE: isCrudAuth(au) ? au.delete : (isCrudAuthSome(au) ? au.delete || au.modify : au)
  }

  const createOutput = (method: HttpMethods, args: ObjectType,
    returns: ObjectType = contractData.dataType): OutputSuccess => ({
    method,
    name: contractData.name,
    authentication: auth[method],
    manageFields: contractData.manageFields || {},
    search: contractData.search,
    preferredImplementation: contractData.preferredImplementation,
    arguments: args,
    returns
  })

  const returnArray = { $array: contractData.dataType }
  const output: OutputSuccess[] = []

  const errorWithId = checkIdField(contractData)
  if (errorWithId) return errorWithId

  const errorWithManageFields = checkManageFields(contractData)
  if (errorWithManageFields) return errorWithManageFields

  const idType: any = contractData.dataType.id
  if (contractData.methods?.get !== false) {
    const search = contractData.search
    output.push(createOutput('GET',
      searchToType(idType, contractData.dataType, search), returnArray))
  }

  if (contractData.methods?.post !== false) {
    const post = { ...contractData.dataType, id: [idType, '?'] }
    output.push(createOutput('POST', removeManaged(post, contractData.manageFields)))
  }

  if (contractData.methods?.put !== false) {
    output.push(createOutput('PUT', removeManaged(contractData.dataType, contractData.manageFields)))
  }

  if (contractData.methods?.patch !== false) {
    const patch: {[s: string]: ValueType | ValueType[];} =
    { ...map(contractData.dataType, contractOptions), id: idType }
    output.push(createOutput('PATCH', removeManaged(patch, contractData.manageFields)))
  }

  if (contractData.methods?.delete !== false) {
    const deleteIds: {[s: string]: ValueType[];} = { id: [idType, { $array: idType }] }
    output.push(createOutput('DELETE', deleteIds, returnArray))
  }

  return { type: 'result', key: contractData.name, results: output }
}

export default transform
