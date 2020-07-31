
const path = require('path')
const { elastic, registerRestMethods, addValidationToContract } = require('../../../src/index')
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

global.beforeEach(async () => {
  await Promise.all(Object.values(allIdx).map(idx =>
    elastic.client().indices.create({ index: idx.index })))
  return ''
})

global.afterEach(async () => {
  await elastic.client().indices.delete({ index: 'test*' })
  return ''
})
