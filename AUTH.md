Authentication help
=====================

Source of authentication information
------------------------------------
The req object passed to the processed handler should be augmented with a `user` object.

To give flexibility to users of this library, this is not implemented by declarapi.
The recommended way handle authentication is to use JWT token authentication.

If the object is falsy, the request is considered unauthenticated.
If the user value is truthy it is considered authenticated.
The user object may contain two properties:
- `permissions` array of the permissions that the user has.
- `sub` string - subject of the authentication ie userId.

### Example
```json
{user: {
  permissions: ["admin", "editor"]
  sub: "95489e58-fc22-4533-a29c-539b505ae6b5"
}}
```

Basic usage
-----------
If your endpoing needs the user to be authenticated (logged in),
you simply need to set:
```json
"authentication" : true
```

Per-method setting
------------------
You can set a different setting for each crud method.
```json
"authentication" : {
  "get": false,
  "modify": true
}
```
The above example will let logged in users to modify records (through __post__, __put__, __patch__, __delete__) but let unauthenticated users to use the get method.

Use permissions claims
----------------------
The user object in req is checked for a permissions array.
If the user has matching permissions, they will be allowed to use the endpont / method.
```json
"authentication" : {
  "get": false,
  "modify": ["content-manager", "admin"],
  "delete": ["admin"]
}
```
The array members are matched with an "OR" operator, so the user needs to be either a `content-manager` or an `admin` to modify in the example above.


Use a field to check against userId
-----------------------------------
This allows users to modify their own records.
This is a relaxation on the security rules.
This will use the `sub` field on the `user` object
The referred field can be either a single id or an array of ids.
```json
"authentication" : {
  "get": true,
  "modify": ["admin", { "createdBy": true }]
}
```
In the example above, either the user who has their id in `createdBy` OR they have `admin` permissions.


### This is checked in the data connectors, if you implement handle manually, you need to take care of this.

This feature is not available for `POST` method because it makes no sense there. We can't check the owner of an object that does not exist yet

Features considered for future implementation
---------------------------------------------

These ideas need more consideration to be fully specified in the

### Allow to add 'AND' to access control
Right now, giving multiple access control parameters (groups or user id) will treat them with an OR operator.
The user needs to comply with only one of them.
This makes it hard to restrict users from posting when short form is used,
and it's not possible to restrict a users access to their own records.

To restrict users from posting, but enabling them to edit their own records,
you need to specify access control for each method independently,
and add a separate group to post
(which most likely needs to different from the one use in put, patch and delete,
 because adding a group there allows unrestricted access to all the resources to the users in that group).

#### Syntax idea 1
Keep the syntax simple, just add an object notation for AND.
```json
"authentication" : {
  "get": true,
  "post":true,
  "delete": ["admin", {"and" :["editor", { "createdBy": true }]}],
  "put": ["admin", { "createdBy": true }],
  "patch": ["admin", { "createdBy": true }],
}
```

#### Syntax idea 2
Make it explicitly require to declare OR / AND.
This makes the implementation a bit more complex,
since it needs to support recursive resolution
```json
"authentication" : {
  "get": true,
  "post":true,
  "delete": {"or": ["admin", {"and" :["editor", { "createdBy": true }]}]},
  "put": {"or": ["admin", { "createdBy": true }]},
  "patch": {"or" : ["admin", { "createdBy": true }]},
}
```

The schema above would mean that
 - An admin can modify all the records.
 - The owner of the record can modify the record
 - An admin can delete any records
 - A regular user cannot delete their own records.
 - A user can only delete their own records if they have 'editor' permission

Non-goals
=========

Changing the data structure based on authentication status
----------------------------------------------------------
If a different data structure is needed,
for example, for an  admin and a regular user, a new endpoint
should be created for the admin functions.

It is however possible the omit **optional** fields based on authentication, by manually extending the handle function, to remove the contents of those fields. This requires caution, if the user that does not get all fields, can modify a record, since in that case the user will override hidden optional fields with undefined, so all data modify methods (put, patch) most be also extended to take care of this.
