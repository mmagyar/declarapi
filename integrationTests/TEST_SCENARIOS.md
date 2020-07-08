The aim of these tests is work with any schema, so it can test all API endpoints, creating a full integration test for the finished app.

Unauthenticated:

 GET:
- without parameters, returns empty set
- non existent id in the body returns 404
- non existent id in the params returns 404
- with array of non existent ids it returns an empty set
- empty set of ids returns empty set
- text search returns empty set
<!-- - invalid regex returns validation error -->

POST
- Post random records
- Get all random posted, by id, one by one
- Get all random posted, by id, with an array of IDs
- Get half of the random posted, by id, with an array of IDs
- Text search for the first generated, and it should be the first result returned
- Perform the basic get test set, with records already posted, to make sure it does not return stuff it should not.
- Can't override an existing record with post, throws error (409, conflict)

PATCH
- Can patch previously posted set. get before and after patching, and compare.
- Get the full posted set to make sure only the patched record is different
- Can't patch item that does not exist yet
- Can't change record id

PUT
- Putting all fields can completely replace a records data
- Can't put item that does not exist
- Can't change record id

DELETE
- Delete one by id, make sure only that one is removed
- Delete many by id, make sure only the listed ones are removed
- Delete all by id, make sure that no records remain


With Authentication (just permissions, no userID field)

GET
- Unauthenticated user can't access the get endpoint, error 401
- User without necessary permission gets 403
- Authenticated, Authorized users get an empty array returned

POST
- Unauthenticated gets 401, unauthorized gets 403
- Authenticated, Authorized user can POST records
- Authorized user can get all records, run full GET test suit with authorized user
- Run full GET test suit with unauthorized user to make sure no records leak
- Run full GET test suit with unauthenticated user to make sure no records leak

PATCH
- Authorized user can patch any record, check that only the desired record is changed
- Authenticated but not authorized user gets 403, make sure records are not modified
- Unauthenticated user gets 401, make sure records are not modified

DELETE
- Authorized user can delete any record by id, check that only that one is removed, to this with both single id and array of ids
- Authenticated but not authorized user gets 403, make sure no records where deleted
- Unauthenticated user gets 401, make sure no records where deleted

With Authentication (userID field is present on all but POST)

GET
- Same as Authentication without userID

POST
- Post does not have userID options, same as above should work
- Authenticated user, without permissions can get it's own posted items by id
- Authenticated user, without permissions can get it's own posted items by id array
- Authenticated user, without permissions can get it's own posted items by text search
- Authenticated user, without permissions can't get records posted by another user, in either by id, by id array or text search
- Authorized user with permission can get all records posted by other users


PATCH and PUT
 - Same with plain authentication
 - Authenticated user, without permissions, can patch own items
 - Authenticated user, without permissions, can't patch other users items
 - Can't change userID

DELETE
 - Same as plain authentication
 - Authenticated user, without permissions, can delete own items
 - Authenticated user, without permissions, can't delete other users items



Schema types to test
 - Without authentication
 - With permission based authentication
 - With userId based permission
 - With multiple userId based permission