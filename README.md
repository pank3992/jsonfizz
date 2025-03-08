## JSONFizz

Able to serialize and deserialize JSON data
- Separators and Delimiters used here are different from those of Native JSON Library
- However, they can be easily modified by simply updating the separator and brackets properties

### Idea behind the choice of syntax used:
I tried to write code in a very generic manner, where the things can be tweaked very easily,
so this helped me try out different combinations of separators and brackets.

Below mentioned are the ones which I found to be the least confusing after getting habitual with
native JSON format, also the character like %, &, =, + etc. which are used in query string
parameters are ignored

**Separators:**
- **Keys** `{underscore} '_'`
- **Values** {Semicolon} ';'`
- **Preferred** `_ or -` since it can be confusing if a position number follows it

**Brackets:**
- **String**: open {back-tick} '\`', close: {back-tick} '\`'
- **Array**: open {Less-than} '<', close: {Greater-than} '>'
- **Object**: open {open round bracket} '(', close: {close round bracket} ')'


### Guide to use JSONFizz:
```JS
json = new JSONFizz()

// It takes a JS object as a parameter and returns the serialized data
json.stringify

// It takesa  serialized string as a parameter and returns JS object
json.parse
```

### Encoders and Decoders:

#### **addHook**
- It takes a  function as a parameter
- Function receives key and value and returns updated value
- Multiple hooks can be added by calling it again (Each function will be in the same order in which they have been added)

#### removeHook
- It takes a function parameter and removes that particular function from the hooks

#### resetHooks
- Removes all the hooks
