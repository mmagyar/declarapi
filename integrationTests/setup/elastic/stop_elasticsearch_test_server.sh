#!/usr/bin/env bash

if [ $ELASTIC_KEEP ]; then
    echo "ELASTIC_KEEP option is set, not stopping elasticsearch"
    exit 0
fi

if ! command -v docker &> /dev/null; then
    echo "Docker not installed, trying to stop elasticsearch with service"
    service elasticsearch stop
    exit 0
fi

if [ "$(docker ps -q -f name=elastic_test)" ]; then


    echo "Stopping and removing docker container named \"elastic_test\""
    docker stop "elastic_test" && docker rm -fv "elastic_test"
fi


exit 0
