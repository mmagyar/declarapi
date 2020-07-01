[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
![Latest version published](https://github.com/mmagyar/declarapi/workflows/Automatic%20package%20publish/badge.svg?branch=master)
![Build](https://github.com/mmagyar/declarapi/workflows/Automatic%20test%20run/badge.svg?branch=master)
![Code coverage](https://img.shields.io/codecov/c/github/mmagyar/declarapi)

# declarapi
Declarative API generation.

#### Create your CRUD API without writing a single line of code.


## Features
- Generate full CRUD REST API based on a single schema definitions
- Automatically validate all requests
- Automatically generate code to communicate with the database
- - Elasticsearch (basic usage, full text search is done, more advanced search in-progress)
- Generate fetch functions and type definitions for the client
- [Permission based authentication / authorization support](AUTH.md).

## Example project

[declarapi-example](https://github.com/mmagyar/declarapi-example)

## Goals / TODO
- Use user's credentials and authorize based on data field (such as userId, so a user can edit records created by them.)
- Generate a describe method to let the client know the schema dynamically
- Generate the source in a way that allows to create a summary file, so in case of multiple api methods / endpoints, the user only needs to import a single file.
- Generate automatic functional tests for the APIs
- Generate automatic load / performance tests for the APIs
- Additional Data connectors
- - Cloudflare Workers KV
- - Redis
- - SQL
- - Other data storage solutions
- Add opaque types to validation, to better encode schema in typescript type
- Add option to automatically add optional ordering to get requests
- Example for serverless deployment
