
const path = require('path')
const { processContract } = require('declarapi-runtime')
const kv = require('declarapi-runtime/kv')
const { generateContract, getMethods } = require('../../src/common')
require('util').inspect.defaultOptions = { depth: 15 }

const schemaFilePath = path.join(__dirname, '../../../example/test_example.json')
global.contract = {}

const preferredImplementation = (index) => ({ type: 'key-value', index, backend: 'memory' })
const allIdx = ({
  unauthenticated: preferredImplementation('test-unauth-' + Date.now()),
  authenticated: preferredImplementation('test-auth-' + Date.now()),
  userAuthenticated: preferredImplementation('test-userauth-' + Date.now())
})

const methodsFor = (fileName) => {
  const contracts =  require('../../temp/' + fileName).contracts
  return getMethods(Object.values(contracts).map(x=> processContract(x)))
}

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

global.afterTestCategory = {
  unauthenticated: async () =>
    Promise.all((await kv.client('memory').list({prefix: allIdx.unauthenticated.index })).keys.map(x=> kv.client('memory').delete(x.name))),
  authenticated: async () =>
    Promise.all((await kv.client('memory').list({prefix: allIdx.authenticated.index })).keys.map(x=> kv.client('memory').delete(x.name))),
  userAuthenticated: async () =>
    Promise.all((await kv.client('memory').list({prefix: allIdx.userAuthenticated.index })).keys.map(x=> kv.client('memory').delete(x.name)))

}
