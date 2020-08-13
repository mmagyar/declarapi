import { AuthInput, ContractType } from 'declarapi-runtime'
import { generate } from 'yaschva'
import { HandleType } from 'declarapi-runtime/registerRestMethods.js'

export const generateRandomCall =
 async <Input, Output>(handle:HandleType, contract:ContractType<any, any>, auth: AuthInput):
  Promise<{output: Output, generatedInput:Input}> => {
   const generated = generate(contract.arguments)
   const handled = await handle(generated, undefined, auth)
   if (!handled || handled.code > 299) {
     const error:any = new Error(`Random data generation returned with error: ${handled?.code}, ${JSON.stringify(handled?.response)}`)
     error.code = handled?.code
     error.response = handled?.response
     throw error
   }
   return {
     output: handled.response,
     generatedInput: generated
   }
 }
