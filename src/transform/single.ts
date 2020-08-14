import { validate, isValidationError } from './jsonSchema.js'
import { Contract, Output } from './types.js'
import { loadJSON, baseSchemaLocation } from '../util.js'

export const transform = async (data:Contract | any): Promise<Output> => {
  const valid = await validate(await loadJSON(`${await baseSchemaLocation()}singleContractSchema.json`), data)

  if (isValidationError(valid)) return valid
  const contractData: Contract = data
  return {
    type: 'result',
    key: contractData.name,
    results: [
      {
        name: contractData.name,
        authentication: contractData.authentication,
        manageFields: {},
        method: contractData.type || 'GET',
        arguments: data.arguments,
        returns: data.returns
      }
    ]
  }
}

export default transform
