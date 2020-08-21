import { AuthInput } from 'declarapi-runtime'
import { generateRandomCall } from '../../cjs/autoTest/generateRandomCall'
import { HttpWrapped } from 'declarapi-runtime/registerRestMethods'
import { CrudContract, ManageableFields } from '../../cjs/transform/types'
import { promises as fs } from 'fs'
import { generate, writeFile } from '../../cjs/index'
import path from 'path'
import { Validation, generate as validationGenerate } from 'yaschva'

declare var contract: {
    unauthenticated: any,
    authenticated:any,
    userAuthenticated:any
  }

declare var beforeTestCategory: {
    unauthenticated: ()=> Promise<any>,
    authenticated: ()=> Promise<any>,
    userAuthenticated: ()=> Promise<any>
  }

declare var afterTestCategory: {
    unauthenticated: ()=> Promise<any>,
    authenticated: ()=> Promise<any>,
    userAuthenticated: ()=> Promise<any>
  }

export type CallArgument =[{ [key: string]: any}, string?, AuthInput?]
export type ArgumentVariations= { [key:string] :CallArgument}

export const addAuth = (callArgument: CallArgument, input:AuthInput) => {
  const result = [...callArgument]
  result[2] = input
  return input
}
export const generateContract = async (schemaFilePath:string, outputName:string, decorator : (input: CrudContract) => CrudContract = x => x) => {
  const json = await fs.readFile(schemaFilePath, { encoding: 'utf8' })
  const parsed = decorator(JSON.parse(json))
  const generated = await generate('server', parsed)
  const outPath = path.join(__dirname, '../temp')
  await writeFile(generated, outputName, outPath)
  return path.join(outPath, outputName)
}

export const checkMatchingGenerated = (generatorOut:{output: any, generatedInput:any}) => {
  if (generatorOut.output.errors) {
    throw new Error(generatorOut.output.errors)
  }
  expect(generatorOut.output.id).toBeTruthy()
  if (generatorOut.generatedInput.id) {
    expect(generatorOut.output.id).toBe(generatorOut.generatedInput.id)
  }

  const newOut = { ...generatorOut.output, id: undefined, createdBy: undefined }
  const newIn = { ...generatorOut.generatedInput, id: undefined, createdBy: undefined }
  expect(newOut).toStrictEqual(newIn)
  return generatorOut
}

export const checkedGenerate = async <Input, Output>(postContract: HttpWrapped<any, any>, authInput:AuthInput):
  Promise<{ output: Output; generatedInput: Input;}> => {
  return checkMatchingGenerated(await generateRandomCall(postContract.handle, postContract.contract, authInput))
}

export const getFirstStringFieldName = (validation:Validation) :string => {
  // Maybe check for userId field, make sure we don't touch that
  const entity = Object.entries(validation).find(x => x[0] !== 'id' && x[1] === 'string')
  if (!entity) throw new Error('This schema does not have a string field')
  return entity[0]
}

export const generateForFirstTextField = (record:any, validation:Validation) => {
  const stringFieldName = getFirstStringFieldName(validation)
  let generatedInput = record[stringFieldName]

  while (generatedInput === record[stringFieldName]) {
    generatedInput = validationGenerate('string')
  }

  return { key: stringFieldName, value: generatedInput }
}

export type Contracts = {get:HttpWrapped<any, any>, post:HttpWrapped<any, any>, patch:HttpWrapped<any, any>, put:HttpWrapped<any, any>, del:HttpWrapped<any, any>}
export const getMethods = (contract:any):Contracts => ({
  get: contract.find((x:HttpWrapped<any, any>) => x.method === 'GET'),
  post: contract.find((x:HttpWrapped<any, any>) => x.method === 'POST'),
  patch: contract.find((x:HttpWrapped<any, any>) => x.method === 'PATCH'),
  put: contract.find((x:HttpWrapped<any, any>) => x.method === 'PUT'),
  del: contract.find((x:HttpWrapped<any, any>) => x.method === 'DELETE')
})

export const removeManaged = <T extends object>(removeFrom:T, manageFields:ManageableFields):T => {
  const result:any = { ...removeFrom }
  for (const [key, value] of Object.entries(manageFields)) {
    if (value) delete result[key]
  }
  return result
}
