import { validate, isValidationError } from './jsonSchema'
import { Contract, Output, baseSchemaLocation } from './types'

export const transform = async (data:Contract | any): Promise<Output> => {
  const valid = await validate(require(`${baseSchemaLocation}singleContractSchema.json`), data)
  if (isValidationError(valid)) return valid
  const contractData: Contract = data
  return {
    type: 'result',
    key: contractData.name,
    results: [
      {
        name: contractData.name,
        idFieldName: contractData.idFieldName || 'id',
        authentication: contractData.authentication,
        method: contractData.type || 'get',
        arguments: data.arguments,
        returns: data.returns
      }
    ]
  }
}
