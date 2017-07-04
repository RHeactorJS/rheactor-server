# TODO

## Backend

### Add aggregated model cache

At some point it might be feasable to introduce a cache that stores snapshots of aggregated entities. Currently all aggregates are **always** constructed from all events that happened for them. The runtime for this can become a problem, when loading many entites at the same time.

## Json-LD

- The relations do not contain the information about the appropriate 
  method. Look into [Hydra](http://www.markus-lanthaler.com/hydra/).
