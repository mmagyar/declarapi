// @TODO run the input and output throught the validation decorator and the registerRestMethod functions to get full integration coverage
import { generateRandomCall } from 'declarapi'
import { generate, writeFile } from '../src/bin/generate'
import path from 'path'
import { promises as fs } from 'fs'
import { CrudContract } from '../src/transform/types'

import { AuthInput } from '../src/globalTypes'
import { Expressable } from '../src/runtime/registerRestMethods'

export type InputType = (Expressable)[]

export const generateContract = async (schemaFilePath:string, outputName:string, decorator : (input: CrudContract) => CrudContract = x => x) => {
  const json = await fs.readFile(schemaFilePath, { encoding: 'utf8' })
  const parsed = decorator(JSON.parse(json))
  const generated = await generate('server', parsed)
  await writeFile(generated, outputName, path.join(__dirname, '/../test'))
}
const getPostAndGet = (contracts:InputType): {post:Expressable, get:Expressable} => {
  const post = contracts.find(x => x.method === 'post')
  const get = contracts.find(x => x.method === 'get')

  expect(post).toBeTruthy()
  expect(get).toBeTruthy()

  if (!post || !get) throw new Error('Post or get was not found')

  return { post, get }
}

const getAllMethods = (contracts:InputType): ({
  post:Expressable
  get:Expressable,
  patch:Expressable,
  put:Expressable,
  del:Expressable}) => {
  const post = contracts.find(x => x.method === 'post')
  const get = contracts.find(x => x.method === 'get')
  const put = contracts.find(x => x.method === 'put')
  const patch = contracts.find(x => x.method === 'patch')
  const del = contracts.find(x => x.method === 'delete')

  expect(post).toBeTruthy()
  expect(get).toBeTruthy()
  expect(del).toBeTruthy()
  expect(put).toBeTruthy()
  expect(patch).toBeTruthy()

  if (!post || !get || !del || !patch || !put) throw new Error('All methods must exist')

  return { post, get, del, patch, put }
}

const checkMatchingGenerated = (generatorOut:any) => {
  if (generatorOut.output.errors) {
    throw new Error(generatorOut.output.errors)
  }
  expect(generatorOut.output.id).toBeTruthy()
  if (generatorOut.generatedInput.id) expect(generatorOut.output.id).toBe(generatorOut.generatedInput.id)

  const newOut = { ...generatorOut.output, id: undefined }
  const newIn = { ...generatorOut.output, id: undefined }
  expect(newOut).toStrictEqual(newIn)
  return generatorOut
}

const checkedGenerate = async <Input, Output>(postContract: Expressable, authInput:AuthInput):
  Promise<{ output: Output; generatedInput: Input;}> => {
  return checkMatchingGenerated(await generateRandomCall(postContract, authInput))
}
export const canPost = async (contracts:InputType, authInput:AuthInput = {}, howMany:number = 20):Promise<any[]> => {
  const { post } = getPostAndGet(contracts)
  const posting = []
  for (let i = 0; i < howMany; i++) {
    posting.push(checkedGenerate(post, authInput))
  }

  const posted = (await Promise.all(posting)).map(x => x.output)
  expect(posted).toHaveLength(howMany)
  return posted
}

export const canGetAll = async (contracts:InputType, authInput:AuthInput = {}, howManyToExpect:number = 20):Promise<any[]> => {
  const { get } = getPostAndGet(contracts)

  const getSome = await get.handle({}, undefined, authInput)
  expect(getSome.json).toHaveLength(howManyToExpect)
  return getSome.json
}

export const unauthorizedCanNotGetAll = async (contracts:InputType, authInput:AuthInput = {}):Promise<any[]> => {
  const { get } = getPostAndGet(contracts)

  const getSome = await get.handle({}, undefined, authInput)
  expect(getSome.json).toStrictEqual({
    code: 401,
    data: { id: undefined },
    errorType: 'unauthorized',
    errors: ['Only logged in users can do this']
  })
  return getSome.json
}

export const canPostAndGetAll = async (contracts:InputType, authInput:AuthInput = {}, howMany :number = 20) => {
  const posted = await canPost(contracts, authInput, howMany)
  expect(new Set(await canGetAll(contracts, authInput, howMany)))
    .toStrictEqual(new Set(posted))
}

export const canPostAndGetSome = async (contracts:InputType, authInput:AuthInput = {}, howMany:number = 20) => {
  const { post, get } = getPostAndGet(contracts)

  const halfLength = Math.floor(howMany / 2)
  const posting = []
  for (let i = 0; i < howMany; i++) {
    posting.push(checkedGenerate(post, authInput))
  }

  const posted:any = (await Promise.all(posting)).map(x => x.output)

  const toGet:any = posted.slice(0, halfLength)
  const toGetIds :any = toGet.map((x:any) => x.id)
  const getResult = await get.handle?.({}, undefined, authInput)
  expect(getResult.json).toHaveLength(howMany)
  expect(new Set(getResult.json)).toStrictEqual(new Set(posted))

  const getSome = await get.handle?.({ id: toGetIds }, undefined, authInput)
  expect(getSome.json).toHaveLength(halfLength)
  expect(new Set(getSome.json)).toStrictEqual(new Set(toGet))
}

export const seedStandardDataset = async (post: Expressable, authInput:AuthInput = {}) => {
  const dataSets:any[] = [{
    name: 'DONKYKONG',
    cats: [],
    dogs: [{ name: 'donky', breed: 'Bulldog', color: 'red', age: 4 }],
    rain: 'cats'
  },
  { name: 'KINGKONG', cats: [{ name: 'dingy', breed: 'Bengal', color: 'red', age: 4 }], dogs: [], rain: 'dogs' },
  { name: 'GODZILLA', cats: [], dogs: [], rain: 'dogs' },
  { name: 'ZILLANILLA', cats: [], dogs: [], rain: 'dogs' },
  { name: 'MOTHS', cats: [], dogs: [], rain: 'cats' }
  ]
  const all = await Promise.all(dataSets.map(x => post.handle({ ...x, ownerId: Math.random() + 'abc' }, undefined, authInput)))

  return all.map(x => {
    if (x.code > 299) throw new Error(JSON.stringify(x, null, 2))
    return x.json
  })
}
export const canTextSearchObjects = async (contracts:InputType, authInput:AuthInput = {}) => {
  const { post, get } = getPostAndGet(contracts)
  await seedStandardDataset(post, authInput)
  const getResult = await get.handle({ search: 'dogs' }, undefined, authInput)
  const dogResult = (getResult).json
  expect(dogResult).toHaveLength(3)

  const catResult = (await get.handle({ search: 'cats' }, undefined, authInput)).json

  expect(catResult).toHaveLength(2)

  expect((await get.handle({ search: 'red' }, undefined, authInput)).json).toHaveLength(2)
}

export const canPatchItems = async (contracts:InputType, authInput:AuthInput = {}) => {
  const { post, get, patch } = getAllMethods(contracts)

  const dataSet = await seedStandardDataset(post, authInput)

  const id = dataSet[0].id
  const byIdResult = (await get.handle({ id }, undefined, authInput)).json
  expect(byIdResult).toHaveLength(1)
  expect(byIdResult[0].cats).toHaveLength(0)
  const patchCat = { name: 'Cirmi', breed: 'Maine Coon', color: 'grey', age: 3 }
  await patch.handle?.({ id, cats: [patchCat] }, undefined, authInput)

  const byIdResultAfterPatch = (await get.handle({ id }, undefined, authInput)).json
  expect(byIdResultAfterPatch).toHaveLength(1)

  expect(byIdResultAfterPatch[0].cats).toHaveLength(1)
  expect(byIdResultAfterPatch[0].cats[0]).toStrictEqual(patchCat)
}

export const canPutItems = async (contracts:InputType, authInput:AuthInput = {}) => {
  const { post, get, put } = getAllMethods(contracts)

  const dataSet = await seedStandardDataset(post, authInput)

  const id = dataSet[0].id
  const secondId = dataSet[1].id
  const byIdResult = (await get.handle({ id }, undefined, authInput)).json
  expect(byIdResult).toHaveLength(1)
  expect(byIdResult[0].cats).toHaveLength(0)
  const putData:any = { ...dataSet[1], id }
  await put.handle?.(putData, undefined, authInput)

  const byIdResultAfterPut = (await get.handle?.({ id }, undefined, authInput)).json
  expect(byIdResultAfterPut).toHaveLength(1)

  expect(byIdResultAfterPut[0]).toStrictEqual(putData)
  expect(byIdResultAfterPut[0]).not.toStrictEqual(dataSet[0])

  const copiedObject = (await get.handle?.({ id: secondId }, undefined, authInput)).json
  expect(copiedObject).toHaveLength(1)
  expect(copiedObject[0]).toStrictEqual(dataSet[1])
}

export const canDeleteSingleItem = async (contracts:InputType, authInput:AuthInput = {}) => {
  const { post, get, del } = getAllMethods(contracts)
  const dataSet = await seedStandardDataset(post, authInput)
  const fullResult = await get.handle?.({}, undefined, authInput)
  // Compare sets, we don't care about order
  expect(new Set(fullResult.json)).toStrictEqual(new Set(dataSet))
  // Sets remove duplicate so check lenghth as well
  expect(fullResult.json).toHaveLength(5)

  const removeFirst = [...dataSet]
  const first = removeFirst.shift()
  await del.handle?.({ id: first.id }, undefined, authInput)

  const minusOne = await get.handle?.({}, undefined, authInput)

  expect(minusOne.json).toHaveLength(4)
  expect(new Set(minusOne.json)).toStrictEqual(new Set(removeFirst))
}

export const canDeleteItems = async (contracts:InputType, authInput: AuthInput = {}) => {
  const { post, get, del } = getAllMethods(contracts)
  const dataSet = await seedStandardDataset(post, authInput)
  const fullResult = await get.handle?.({}, undefined, authInput)
  expect(fullResult.json).toHaveLength(5)
  expect(new Set(fullResult.json)).toStrictEqual(new Set(dataSet))

  const remove123 = [...dataSet]
  const first = remove123.shift()
  const second = remove123.shift()
  const third = remove123.shift()
  await del.handle?.({ id: [first.id, second.id, third.id] }, undefined, authInput)

  const minus3 = await get.handle?.({}, undefined, authInput)
  expect(minus3.json).toHaveLength(2)
  expect(new Set(minus3.json)).toStrictEqual(new Set(remove123))
}

describe('This is just a placeholder for these test function', () => {
  it('holds space', () => {
    expect('OK').toBeTruthy()
  })
})
