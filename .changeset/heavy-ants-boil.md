---
"@saeris/kuromoji": major
---

Refactor for modern best practices and sensible async developer experience

## BREAKING

Library exports have changed to the following:

```ts
import {
  DictionaryBuilder,
  tokenizerNode,
  tokenizerWeb
} from "@saeris/kuromoji";
```

Previously this library implemented a confusing class-based builder pattern for initializing the `Tokenizer` class utilizing antiquated callback patterns. This refactor is largely aimed at simplifying the overall developer experience. Included are some stylistic refactors to the internals to align with modern best practices while maintaining the existing functionality.

Because this is a separately maintained fork, these changes will not be contributed back to the upstream repository and will instead be published under a different name.
