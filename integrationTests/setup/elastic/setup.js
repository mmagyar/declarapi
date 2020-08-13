
const path = require('path')
const { elastic, registerRestMethods, addValidationToContract } = require('declarapi-runtime')
const { generateContract, getMethods } = require('../../src/common')

const schemaFilePath = path.join(__dirname, '../../../example/test_example.json')
global.contract = {}

const preferredImplementation = (index) => ({ type: 'elasticsearch', index })
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
  unauthenticated: async () => (await elastic.client().indices.create({ index: allIdx.unauthenticated.index })) && '',
  authenticated: async () => (await elastic.client().indices.create({ index: allIdx.authenticated.index })) && '',
  userAuthenticated: async () => (await elastic.client().indices.create({ index: allIdx.userAuthenticated.index })) && ''

}

global.afterTestCategory = {
  unauthenticated: async () => (await elastic.client().indices.delete({ index: allIdx.unauthenticated.index })) && '',
  authenticated: async () => (await elastic.client().indices.delete({ index: allIdx.authenticated.index })) && '',
  userAuthenticated: async () => (await elastic.client().indices.delete({ index: allIdx.userAuthenticated.index })) && ''

}
