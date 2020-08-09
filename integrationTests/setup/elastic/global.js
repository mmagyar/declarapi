module.exports = async () => {
  const result = require('child_process')
    .spawnSync('sh',
      ['./integrationTests/setup/elastic/start_elasticsearch_test_server.sh'],
      { timeout: 100000, stdio: 'inherit' })
  if (result.status !== 0) throw new Error(JSON.stringify(result))

  if (require('child_process').spawnSync('rm', ['-f', './integrationTests/temp/*.ts']).status !== 0) throw new Error(JSON.stringify(result))
}
