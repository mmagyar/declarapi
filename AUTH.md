Authentication help
=====================

Source of authentication information
------------------------------------
The req object passed to the processed handler should be augmented with a `user` object.

To give flexibility to users of this library, this is not implemented by declarapi.
The recommended way handle authentication is to use JWT token authentication.

If the object is falsy, the requirest is considered unauthenticated.
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
If your endpoing needs the user to be authentcated (logged in),
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
This will use the `sub` field on the `user` object
The referred field can be either a single id or an array of ids.
```json
"authentication" : {
  "get": true,
  "modify": ["admin", { "userId": "userIdFieldNameOnRecord" }]
}
```
You can reference multiple fileds as well
```json
"authentication" : [{"userId" : "writtenBy"}, {"userId": "editedBy"}]
```

### This is checked in the data connectors, if you implement handle manually, you need to take care of this.

Non-goals
=========

Changing the data structure based on authentication status
----------------------------------------------------------
If a different data structure is needed,
for example, for an  admin and a regular user, a new endpoint
should be created for the admin functions.

It is however possible the omit **optional** fields based on authentication, by manually extending the handle function, to remove the contents of those fields. This requires caution, if the user that does not get all fields, can modify a record, since in that case the user will override hidden optional fields with undefined, so all data modify methods (put, patch) most be also extended to take care of this.
