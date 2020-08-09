import { Output, CrudContract, Contract } from './types.js'
import { transform as crudTransform } from './crud.js'
import { transform as singleTransform } from './single.js'

export const transform = async (contract: CrudContract | Contract | object): Promise<Output> => {
  const data: any = contract
  if (!data.$schema) { return { type: 'error', errors: "Schema files must contain $schema that point to it's type" } }

  if (data.$schema.endsWith('singleContractSchema.json')) {
    return singleTransform(data)
  } else if (data.$schema.endsWith('crudContractSchema.json')) {
    return crudTransform(data)
  }
  return { type: 'error', errors: `Unsupported schema for declaration: ${data.$schema}` }
}

export default transform
