process.env.ELASTIC_UNAUTHENTICATED = 'true'
process.env.ELASTIC_HOST = 'http://localhost:9200'
process.env.ELASTIC_INDEX = 'test-' + Date.now()

require('util').inspect.defaultOptions = { depth: 15 }
