# KSSU Split Timer

Spent an hour or two whipping something up for [KSSU Splits Timer GUI
Challenge](https://gist.github.com/lexi-lambda/701f1f1282401059f13a4220e8178ba4).
I have no idea if this is how you're supposed to React or not.

I believe this demonstrates most of the _Technial Requirements_ from the
challenge. The exceptions are a result of laziness and an arbitrary timebox
rather than fundamental to the architecture. Commentary on these points are in
the code.

### Open Questions

* What's the best way to handle navigation states? I'm using an enum but feels
  a little weird. Not sure about the `if` clauses in sub-components.
* Currently just uses integer time values. Parsing/formatting are extracted so
  should be trivial to sub in real implementations.
* UI is designed to be operable one-handed from the numpad. Any new parsing
  logic should take this into account. Specifically, don't require `:`
  character for time input.
* Need to implement the "first 6 random" boss logic.
* My CSS is terrible. `#dealwithit`
* The reset button spacing is wrong but am not sure why.

## Development

[Standard React](https://github.com/facebookincubator/create-react-app/blob/master/packages/react-scripts/template/README.md#available-scripts) (`npm start` etc).
