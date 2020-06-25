import { ContractType } from '../globalTypes'
import { generateRandomCall } from './generateRandomCall'

export const testPosting =
async (input : {get:ContractType<any, any>, post: ContractType<any, any> }) => {
  const generated = await generateRandomCall(input.post)

  const result = await input.get.handle?.(generated.generatedInput)

  if (result.length !== 1) {
    throw new Error(JSON.stringify(
      { error: 'More results where returned than expected', data: result }))
  }
}
