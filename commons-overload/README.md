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
    [$undefined, () => console.log("call undefined")],
    val => console.log("fallback")
]);

show("helloworld"); 
// call string: helloworld

show(12345);
// call number: 12345

show([1,2,3,4,5])
// call array: [1,2,3,4,5]

show(notdefined)
// call undefined

show(function(){})
// fallback
```

As above, you should pass an array to `overload`, and each element is also an array except the last one. Each array element is called *definition*. A *definition* contains several *descriptor* ($string, $number, $array, $undefined etc.) and exact one function which is the function to be executed when overloading. The last function element is called fallback, and can be omitted.

The function returned by `overload` is a proxy. It dispatches your invoke to each function defined in definition at runtime, depending on the arguments you pass. Each definition will be check one by one, if a definition is found matching the arguments, then the function it provides will be called. Also, `this` refers the correct context. If no definition matches the arguments, fallback function will be called.

## Descriptor
Most descriptor begins with $.

### Type descriptor
#### $string
Argument should be a string.

#### $number
Argument should be a number.

#### $object
Argument should be an object.

#### $function
Argument should be a function.

#### $array
Argument should be an array-like object (Array, string, NodeList, jQuery etc.).

Equivalent to `$arrayof($any)`

#### $arrayof(*descriptor*)
Argument should be an array-like object, and each element should match *descriptor*.

```javascript
var show = overload([
    [$arrayof($string), () => "string array"],
    [$arrayof($number), () => "number array"]
])

show(['1', '2', '3'])
// "string array"

show([1, 2, 3])
// "number array"
```

#### $any
Argument can be anything. It matches any argument.

### Nullable descriptor
#### $null
Argument is null.

#### $nullor(*descriptor*)
Argument is null or match *descriptor*.

#### $undefined
Argument is undefined.

#### $undefinedor(*descriptor*)
Argument is undefined or match *descriptor*.

#### $nothing
Argument is null or undefined.

#### $nothingor(*descriptor*)
Argument is null or undefined or match *descriptor*.

### Object descriptor
#### *constructor*
Short for `$instanceof`.

#### $instanceof(*type*)
Argument should be instance of *type*.

```javascript
function MyObj1(){}
function MyObj2(){}
function MyObj3(){}
function MyObj4(){}
	
var show = overload([
    [$instanceof(MyObj1), () => "MyObj1"],
    [$instanceof(MyObj2), () => "MyObj2"],
    [MyObj3, () => "MyObj3"],
    [MyObj4, () => "MyObj4"]
])
show(new MyObj1()) // MyObj1
show(new MyObj2()) // MyObj2
show(new MyObj3()) // MyObj3
show(new MyObj4()) // MyObj4
```

#### $propertyof(*name1*, *name2*, ...)
Argument should have properties of *name1*, *name2*, ...

```javascript
var show = overload([
    [$propertyof("title", "name"), () => "match1"],
    [$propertyof("title"), () => "match2"]
])
show({title: "title", name: "name"}) // match1
show({title: "title"}) // match2
```

### Variable parameter descriptor
Variable parameter means there are zero or more specific arguments.

Variable parameter descriptor should appear only once, and be the last descriptor. 

#### $varargs
Variable parameter could be any.

```javascript
var show = overload([
    [$string, $varargs, () => "match"],
    () => "not match"
])

show("s1") //match
show("s1", "s2") // match
show("s1", 2) // match
show() //not match
```

#### $varargsof(*descriptor*)
Each variable parameter should match *descriptor*. Certainly, ommiting arguments is legal.

```javascript
var show = overload([
    [$string, $varargsof($string), () => "match"],
    () => "not match"
])

show("s1") //match
show("s1", "s2") // match
show("s1", 2) // not match
show() //not match
```

