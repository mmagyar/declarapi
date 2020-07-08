#!/usr/bin/env bash
echo "Stopping and removing docker container named \"elastic_test\""
docker ps -q --filter "name=elastic_test" | grep -q . && docker stop "elastic_test" && docker rm -fv "elastic_test"

exit 0
