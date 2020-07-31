#!/usr/bin/env bash

if [ "$(docker ps -q -f name=elastic_test)" ]; then
    if [ $ELASTIC_KEEP ]; then
        echo "ELASTIC_KEEP option is set, not stopping elasticsearch"
        exit 0
    fi


    echo "Stopping and removing docker container named \"elastic_test\""
    docker stop "elastic_test" && docker rm -fv "elastic_test"
fi


exit 0
