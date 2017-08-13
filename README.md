# server

[![npm version](https://img.shields.io/npm/v/@rheactorjs/server.svg)](https://www.npmjs.com/package/@rheactorjs/server)
[![Build Status](https://travis-ci.org/RHeactorJS/server.svg?branch=master)](https://travis-ci.org/RHeactorJS/server)
[![Greenkeeper badge](https://badges.greenkeeper.io/RHeactorJS/server.svg)](https://greenkeeper.io/) 
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)
[![semantic-release](https://img.shields.io/badge/semver-semantic%20release-e10079.svg)](https://github.com/semantic-release/semantic-release)[![Test Coverage](https://codeclimate.com/github/RHeactorJS/server/badges/coverage.svg)](https://codeclimate.com/github/RHeactorJS/server/coverage)
[![Code Climate](https://codeclimate.com/github/RHeactorJS/server/badges/gpa.svg)](https://codeclimate.com/github/RHeactorJS/server)

Core server components for [RHeactorJS applications](https://github.com/RHeactorJS).

The server provides typical business capabilities of a web application:

 - User registration flow
 - Login (Sessions are implemented stateless with [JSONWebTokens](https://jwt.io)  
 - Managing of user details like email address, name, avatar, preferences
 - SuperUser role

## RESTful API

 All features are available via a RESTful, [JSON-LD](http://json-ld.org/) inspired API and via a command line interface. API errors will always be represented as a [`HttpProblem`](https://github.com/RHeactorJS/models/blob/master/src/http-problem.js).
 
 See the [BDD tests](https://github.com/RHeactorJS/server/tree/master/features) for a complete description of the API features.
 
 The available CLI commands are defined in [`src/console-command/`](https://github.com/RHeactorJS/server/tree/master/src/console-command),
 
 Besides using an EventSource connection for streaming events from the backend to the frontend, a *traditional* REST and JSON based implementation for reading and writing application data.

The syntax is inspired by [JSON-ld](http://json-ld.org/) which supports the discovery of API endpoints through links and adds type information to the represented data.

A client only needs to know the index for the respective API and every subsequent URL can be inferred from links in the response. The client just needs to look up the link it is interested to use. 

Transferred data always contains a `$context` which basically gives every object a namespace. Code that is in charge of parsing responses can therefore easily validate that the data they are receiving is of the expected type.

Authorization is done stateless using [JSON Web Token](https://jwt.io/). It is used in HTTP request through the `Authorization: Bearer …` header but also through sending users links containing tokens, e.g. [to reset their passwords](https://github.com/RHeactorJS/server/blob/937c60942727d2eba95c06787e735eb9281f6717/features/PasswordChange.feature#L27).

The [RHeactorJS DeepDive](./DeepDive) explains how this works in detail.

### REST HTTP Verbs

JSON-ld does not offer a solution for describing intents in links and thus *some* knowledge about how to work with endpoints is not dynamically inferred but used dogmatical.

For instance, one could image the router `api/user/:id/vacation` which could be used with the verb `PUT` to set the users vacation reminder, and with the verb `DELETE` to disable it.

In general routes follow these rules:

 - `GET`: for reading entites, the server should send appropriate cache headers
 - `POST`: for adding entries to collections, querying search endpoints
 - `PUT`: for updating properties
 - `DELETE`: for deleting entities, deleting entity properties

### API Versioning

Versioning is achieved through a custom content-type which contains a simple version number: `application/vnd.acme.product.v1+json`. This content type is used to [configure express](https://github.com/RHeactorJS/server/blob/cbc0fe5aae0b8fc3fedfd8a4e3cfcfcaa442f531/src/config/express/base.js#L20) which essentially makes it not parse a request, if it has the wrong content-type header. 

> :warning: Once the version number is increased, all client request will fail, if they are running outdated code. Use this sparsely.

### No batch updating of properties

The way the API endpoints are implemented serves the concept of *many small updates* where instead of the client being able to modify multiple properties at once, like this

```
PUT /api/model/10

{
  "property1": "newvalue1",
  "property2", "newvalue2"
}
```

it must update properties individually, like this

```
PUT /api/model/10/property1

{
  "value": "newvalue1"
}
```

```
PUT /api/model/10/property2

{
  "value": "newvalue2"
}
```
This enables all clients, and especially UI clients, to offer on-thy-fly saving of changes once the user has completed entering a new value. This greatly reduces the risk of losing changes due to connection problems or because the user forgot to click *save*.

UIs still may chose to offer a *save* feature, they can simply create all neccessary update request once the user clicks the *save* button.

## Handling of conflicts

> :information_source: Clients need to resolve conflicts

[Aggregate versions](https://github.com/RHeactorJS/event-store#versioning) play an important part in the way state changes are implemented. The server will reject any update to an entity if the a wrong version number is [provided via the `If-Match` header](https://github.com/RHeactorJS/wiki/wiki/DeepDive#3-update-the-name). 

Clients therefore need get hold of the latest version number in the server's data store. Usually this is done by *reading* the entity. All entites are instances of `AggregateRoots` or `ImmutableAggregateRoots` from the [`event-store`](https://github.com/RHeactorJS/event-store) package and provide the version number (an Integer > 0).

If an update request provides the current server version, the request will be accepted and eventually the update event persisted.

This aproach offers these advantags:

1. Conflict handling is simple (form the servers perspective), either a change is applied fully or not, merging of changes is not supported.
2. It's up to the UI to decide *per use case* if after sending a change request it should reload the whole entity, or just increment its version number for *that specific entity*. So that consecutive updates can be send to the server without need to re-read data. This is especially handy in situations where concurrent editing of *the same entity* by *different users* is not possible.

That means for a client (and especially for UIs), that in 99% of user updates, everything will work fine, in the rare case of a conflict, it's far easier to ask the user to "reload the page" and have the user re-apply their changes, then merging changes from different updates.

Nevertheless, for RHeactorJS applications, having real-time updates in the UI is a central feature, for which utilities have been implemented in [`web-app`](https://github.com/RHeactorJS/web-app#readme).
