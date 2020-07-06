import { AuthInput, ContractType } from '../globalTypes'
import { generate } from 'yaschva'
import { HandleType } from '../runtime/registerRestMethods'

export const generateRandomCall =
 async <Input, Output>(handle:HandleType, contract:ContractType<any, any>, auth: AuthInput = {}):
  Promise<{output: Output, generatedInput:Input}> => {
   const generated = generate(contract.arguments)
   return {
     output: (await handle(generated, undefined, auth)).response,
     generatedInput: generated
   }
 }
