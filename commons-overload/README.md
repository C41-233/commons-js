# commons-overload.js

## Overview
Add function overloading in javascript with a simple grammar.

## Usage
All you need is to define a function with `overload`.

```javascript
var show = overload([
    [$string, val => console.log("call string: " + val)],
    [$number, val => console.log("call number: " + val)],
    [$array, val => console.log("call array: " + val)],
    [$undefined, val => console.log("call undefined: " + val)],
    val => console.log("fallback")
]);

show("helloworld"); // call string: helloworld
show(12345);
show
```
