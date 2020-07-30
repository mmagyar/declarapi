module.exports = async () => {
  const result = require('child_process')
    .spawnSync('sh',
      ['./integrationTests/stop_elasticsearch_test_server.sh'],
      { timeout: 100000, stdio: 'inherit' })
  if (result.status !== 0) throw new Error(JSON.stringify(result))
}
