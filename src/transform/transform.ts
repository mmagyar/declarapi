import { Output, CrudContract, Contract } from './types'
import { transform as crudTransform } from './crud'
import { transform as singleTransform } from './single'

export const transform = async (contract: CrudContract | Contract|string | object): Promise<Output> => {
  const data: any = typeof contract === 'string' ? require(contract) : contract
  if (!data.$schema) { return { type: 'error', errors: "Schema files must contain $schema that point to it's type" } }

  if (data.$schema.endsWith('singleContractSchema.json')) {
    return singleTransform(data)
  } else if (data.$schema.endsWith('crudContractSchema.json')) {
    return crudTransform(data)
  }
  return { type: 'error', errors: `Unsupported schema for declaration: ${data.$schema}` }
}

export default transform