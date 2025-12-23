# Invalid Markdown Document

This document contains various linting errors for testing.

### Heading Skip (MD001)

This heading skips from level 1 to level 3.

##  Multiple Spaces After Hash (MD019)

There are two spaces after the hash.

#No Space After Hash (MD018)

Missing space after the hash.

## Trailing Spaces

This line has trailing spaces at the end.

## Multiple Blank Lines


There are multiple blank lines above this paragraph.


And here too.

## Hard Tabs

	This line starts with a hard tab character.

## Long Line

This is a very long line that exceeds the default line length limit of 80 characters and should trigger the MD013 rule if it is enabled.

## Inconsistent List Style

- Item with dash
* Item with asterisk
+ Item with plus

## Code Block With Dollar Sign

```bash
$ echo "This starts with dollar sign"
```

## Closed ATX Style

## Missing Space Before Closing Hash##

##  Multiple Spaces Both Sides  ##

End of invalid document.
