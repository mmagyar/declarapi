The aim of these tests is work with any schema, so it can test all API endpoints, creating a full integration test for the finished app.

This is done with property based tests, with randomized data.

# Tests

## Unauthenticated:

### GET:
- *DONE* without parameters, returns empty set
- *DONE* non existent id in the body returns 404
- *DONE* non existent id in the params returns 404
- *DONE* with array of non existent ids it returns an empty set
- *DONE* empty set of ids returns empty set
- *DONE* text search returns empty set
<!-- - invalid regex returns validation error, if regex -->

### POST
- *DONE* Post random records and get all with empty arguments
- *DONE* Get all random posted, by id, one by one
- *DONE* Get all random posted, by id, with an array of IDs
- *DONE* Get half of the random posted, by id, with an array of IDs
- *DONE* Gets available records, ignores non existent ones when an array of ids is supplied
- *DONE* Text search for the first generated, in a text field, and it should be the first result returned
- *DONE* Perform the basic get test set, with records already posted, to make sure it does not return stuff it should not.
- *DONE* Can't re-post an existing record with post, throws error (409, conflict)
- *DONE* Can't override an existing record with post, throws error (409, conflict)

### PATCH
- *DONE* Can patch previously posted set. get before and after patching, and compare.
- *DONE* Get the full posted set to make sure only the patched record is different
- *DONE* Can't patch item that does not exist yet
- *DONE* Can't change record id
- *DONE* Optional parameters not can be removed with patch

### PUT
- *DONE* Putting all fields can completely replace a records data
- *DONE* Rejects partial modification
- *DONE* Can't put item that does not exist
- *DONE* Can't change record id
- *DONE* Optional parameters can be removed with put

### DELETE
- *DONE* Delete one by id, make sure only that one is removed
- *DONE* Delete many by id, make sure only the listed ones are removed
- *DONE* Delete all by id, make sure that no records remain


With Authentication (just permissions, no userID field)

### GET
- *DONE* Unauthenticated user can't access the get endpoint, error 401
- *DONE* User without necessary permission gets 403
- *DONE* Authenticated, Authorized users get an empty array returned

### POST
- *DONE* Unauthenticated gets 401, unauthorized gets 403
- *DONE* Authenticated, Authorized user can POST records
- *DONE* Authorized user can get all records, run full GET test suit with authorized user
- *DONE* Run GET test with unauthorized user to make sure no records leak
- *DONE* Run GET test with unauthenticated user to make sure no records leak

### PATCH
- *DONE* Authorized user can patch any record, check that only the desired record is changed
- *DONE* Authenticated but not authorized user gets 403, make sure records are not modified
- *DONE* Unauthenticated user gets 401, make sure records are not modified

### PUT
- *DONE* Authorized user can put any record, check that only the desired record is changed
- *DONE* Authenticated but not authorized user gets 403, make sure records are not modified
- *DONE* Unauthenticated user gets 401, make sure records are not modified

### DELETE
- *DONE* Authorized user can delete any record by id, check that only that one is removed, do this with both single id and array of ids
- *DONE* Authenticated but not authorized user gets 403, make sure no records where deleted
- *DONE* Unauthenticated user gets 401, make sure no records where deleted

## With Authentication (userID field is present on all but POST)

### GET
- *DONE* Same as Authentication without userID
- *DONE* Logged in user does not get 403 anymore, just returns empty if no owned resources found.

### POST
- Can't post with someone elses user id
- *DONE* Authenticated user, without permissions can get it's own posted items by id
- *DONE* Authenticated user, without permissions can get it's own posted items by id array
- *DONE* Authenticated user, without permissions can get it's own posted items by text search
- *DONE* Authenticated user, without permissions can't get records posted by another user, in either by id, by id array or text search
- *DONE* Authorized user with permission can get all records posted by other users
- Text search does not return records that the user should not access

### PATCH and PUT
 - *DONE* Same with plain authentication
 - *DONE* Authenticated user, without permissions, can patch own items
 - *DONE* Authenticated user, without permissions, can't patch other users items
 - *DONE* Admin user, can patch other users items, user can get item back
 - *DONE* Admin can not change createdBy user id
 - *DONE* createdBy ID stays the same if admin updates (done by admin user can patch)

### DELETE
 - *DONE* Same as plain authentication
 - *DONE* Authenticated user, without permissions, can delete own items
 - *DONE* Authenticated user, without permissions, can't delete other users items



## Schema types to test
 - Without authentication
 - With permission based authentication
 - With userId based permission

## TODO:
 - Test parametric search when it's implemented
 - Maybe define behavior for get when both and and search is specified
 - Create more realistic scenarios and workflows
