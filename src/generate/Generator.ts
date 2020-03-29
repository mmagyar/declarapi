import { validate, isValidationError } from './jsonSchema'
import { Contract, Output } from './GenerateTypes'
import { generate } from './Crud'

export const generator = async (contract: string | object): Promise<Output> => {
  const baseSchemaLocation = `${__dirname}/../../src/schema/`

  const data: any = typeof contract === 'string' ? require(contract) : contract
  if (!data.$schema) { return { type: 'error', errors: "Schema files must contain $schema that point to it's type" } }

  if (data.$schema.endsWith('singleContractSchema.json')) {
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
  } else if (data.$schema.endsWith('crudContractSchema.json')) {
    return generate(data)
  }
  return { type: 'error', errors: `Unsupported schema for declaration: ${data.$schema}` }
}
