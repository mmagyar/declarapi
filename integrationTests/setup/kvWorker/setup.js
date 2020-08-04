
const path = require('path')
const { kv, registerRestMethods, addValidationToContract } = require('../../../src/index')
const { generateContract, getMethods } = require('../../src/common')
require('util').inspect.defaultOptions = { depth: 15 }

const schemaFilePath = path.join(__dirname, '../../../example/test_example.json')
global.contract = {}

const preferredImplementation = (index) => ({ type: 'key-value', index, backend: 'worker' })
const allIdx = ({
  unauthenticated: preferredImplementation('test-unauth-' + Date.now()),
  authenticated: preferredImplementation('test-auth-' + Date.now()),
  userAuthenticated: preferredImplementation('test-userauth-' + Date.now())
})

const methodsFor = (fileName) => getMethods(
  registerRestMethods(
    addValidationToContract(
      require('../../temp/' + fileName).contracts)))
global.beforeAll(async () => {
  await generateContract(schemaFilePath, 'test-elastic', (input) =>
    ({ ...input, preferredImplementation: allIdx.unauthenticated }))
  global.contract.unauthenticated = methodsFor('test-elastic-server')

  await generateContract(schemaFilePath, 'test-elastic-auth', (input) =>
    ({ ...input, preferredImplementation: allIdx.authenticated, authentication: ['admin'] }))
  global.contract.authenticated = methodsFor('test-elastic-auth-server')

  await generateContract(schemaFilePath, 'test-elastic-user-auth', (input) =>
    ({
      ...input,
      dataType: { ...input.dataType, createdBy: 'string' },
      preferredImplementation: allIdx.userAuthenticated,
      manageFields: { createdBy: true },
      authentication: ['admin', { createdBy: true }]
    }))
  global.contract.userAuthenticated = methodsFor('test-elastic-user-auth-server')
})

global.beforeTestCategory = {
  unauthenticated: async () => {},
  authenticated: async () => {},
  userAuthenticated: async () => {}

}
const delay = async (time = 100) => new Promise((resolve) => setTimeout(() => resolve(), time))
global.afterTestCategory = {
  unauthenticated: async () => {
    await delay()
    await kv.client('worker').destroy((await kv.client('worker').list(undefined, undefined, allIdx.unauthenticated.index)).result.map(x => x.name))
    return delay()
  },
  authenticated: async () => {
    await delay()
    await kv.client('worker').destroy((await kv.client('worker').list(undefined, undefined, allIdx.authenticated.index)).result.map(x => x.name))
    return delay()
  },
  userAuthenticated: async () => {
    await delay()
    await kv.client('worker').destroy((await kv.client('worker').list(undefined, undefined, allIdx.userAuthenticated.index)).result.map(x => x.name))
    return delay()
  }
}
