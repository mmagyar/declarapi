import { ContractType, AuthInput } from '../globalTypes'
import { generate } from 'yaschva'

export const generateRandomCall =
 async <Input, Output>(input: ContractType<Input, Output>, auth: AuthInput = {}):
  Promise<{output: Output, generatedInput:Input}> => {
   if (input.handle) {
     const generated = generate(input.arguments)
     return {
       output: await input.handle(generated, { ...auth, authentication: input.authentication }),
       generatedInput: generated
     }
   } else {
     throw new Error('handle must be defined to call it with randomly generated arguments')
   }
 }
