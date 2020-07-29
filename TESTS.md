Unit tests
==============================
The unit test coverage is 100%.
To avoid writing nonsense tests,
some files are omitted from the unit test coverage reports.
These files are covered by integration tests, these are:

- `src/dataConnector/*` These files connect the database implementation, and may depend on the databases' behavior, thus unit testing these does not gain us much.
- `src/index.ts` this file has no functioning code, just exports to be used, when this package is used.

100% coverage is important, because that ensures that there is no dead code left in the system that has no real use.

Integration tests
==============================
These aim to test arbitrary schemas via property based testing.

The goal with these is to enable users to input their schema and have it automatically tested.

