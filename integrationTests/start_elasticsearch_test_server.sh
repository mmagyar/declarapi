#!/usr/bin/env bash
set -e

DIR=$(dirname $(readlink -f $0))
$DIR/stop_elasticsearch_test_server.sh

docker pull docker.elastic.co/elasticsearch/elasticsearch:7.8.0

docker run -d -p 9200:9200 -p 9300:9300 -e "discovery.type=single-node" --name "elastic_test" docker.elastic.co/elasticsearch/elasticsearch:7.8.0

echo "Waiting for elasticsearch to be responsive"
timeout 300 bash -c 'while [[ "$(curl -s -o /dev/null -w ''%{http_code}'' localhost:9200)" != "200" ]]; do sleep 1; done' || false


