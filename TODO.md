# TODO

## Backend

### Add aggregated model cache

At some point it might be feasable to introduce a cache that stores snapshots of aggregated entities. Currently all aggregates are **always** constructed from all events that happened for them. The runtime for this can become a problem, when loading many entites at the same time.

### Process backend events asynchronously

The current implementation of e.g. [changing the users last name](https://github.com/RHeactorJS/server/blob/2f9145f2fd2c552a1ecfcfaa9d5892482b30f8f1/src/api/route/profile.js#L165) **expects** that the backend processes the update immediately, and returns only after ther user entity has been modified. This style of processing updates to entities can become a bottleneck in the future and is discouraged. This section should be refactord to immediately return an empty response:

```javascript
emitter.emit(cmd)
return res.status(202).send()
```

This forces clients to use optimistic updates, or fetch the resource they have tried to update again, to verify the update worked.

This change enables the backend to process events truly asynchronously, outside of the current process which is neccessary to scale to current implementation to multiple instances. Notification commands can be pushed to AWS SNS, which calls Lambda to send emails.

## Json-LD

- The relations do not contain the information about the appropriate 
  method. Look into [Hydra](http://www.markus-lanthaler.com/hydra/).
