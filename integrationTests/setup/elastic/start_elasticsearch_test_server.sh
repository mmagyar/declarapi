#!/usr/bin/env bash
set -e

DIR=$(dirname $(readlink -f $0))
$DIR/stop_elasticsearch_test_server.sh

if ! command -v docker &> /dev/null; then
    echo "Docker not installed, trying to start elasticsearch with service"
    service elasticsearch start
elif [ ! "$(docker ps -q -f name=elastic_test)" ]; then
  docker pull docker.elastic.co/elasticsearch/elasticsearch:7.8.0

  docker run -d -p 9200:9200 -p 9300:9300 -e "discovery.type=single-node" --name "elastic_test" docker.elastic.co/elasticsearch/elasticsearch:7.8.0
fi

echo "\nWaiting for elasticsearch to be responsive\c"
timeout 300 bash -c 'while [[ "$(curl -s -o /dev/null -w ''%{http_code}'' localhost:9200)" != "200" ]]; do sleep 1; echo -e ".\c"; done' || false
echo "\nElasticsearch is up!"

