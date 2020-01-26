# Qreal: control your data 😎

qreal is small middleware to restructure data ( Array Objects )

## Installation

Use the [npm](https://www.npmjs.com) to install qreal.

```bash
npm install qreal --save
```

or you can use  [yarn](https://yarnpkg.com/) to install qreal.

```bash
yarn add qreal
```

you can use qreal in browser by add url of [unpkg](https://unpkg.com) in ```<script>``` tag

```html
<script src='https://unpkg.com/qreal'></script>
```

## Usage

you can restructure data by write the name of the property.

```javascript
const qreal = require('qreal')
var OBJECTS = [
 {
  name : 'ahmed',
  age : 23,
  address : {
   first : 'helwan',
   second : 'cairo'
  }
 },
 {
  name : 'mona',
  age : 54,
  address : {
   first : 'giza',
   second : 'egypt'
  }
 },
 {
  name : 'said',
  age : 30,
  address : {
   first : 'newyork',
   second : 'usa'
  }
 },
 {
  name : 'zaki',
  address : {
   first : 'brazil',
   second : 'brazil'
  },
  age : 27
 }
]

qreal(OBJECTS, {
 name : ''
})

// Result
[
 {
  name : 'ahmed',
 },
 {
  name : 'mona',
 },
 {
  name : 'said',
 },
 {
  name : 'zaki',
 }
]
```

### $take

TYPE : Number

------------------------------------

You can specify the number of items what do you want

```javascript
qreal(OBJECTS, {
 $take: 2,
 name : ''
})

// Result
[
 {
  name : 'ahmed',
 },
 {
  name : 'mona',
 }
]
```

### $ignore

TYPE : Array

-------------------------------

You can select the items you don't want

```javascript
qreal(OBJECTS, {
 $take : 2,
 $ignore : [ 'address', 'age' ]
})

// Result
[
 {
  name : 'ahmed',
 },
 {
  name : 'mona',
 }
]
```

### $include

TYPE : Function

ARGS : [ object ]

-----------------------------

You can include items if you want 😜.

```javascript
qreal(OBJECTS, {
 $take : 2,
 $ignore : [ 'address', 'age' ],
 $include : (obj) => { adult: obj.age > 18 }
})

// Result
[
 {
  name : 'ahmed',
  adult: true
 },
 {
  name : 'mona',
  adult: true
 }
]
```

### $keyName

TYPE: String | Function

ARGS : [ object, key ]

-----------------------

You can set key of object 😎.

NOTE: the function of $keyName should return string

NOTE: name must 🤬 start with '@' if you select name from object

```javascript
qreal(OBJECTS, {
 $length : 2,
 address : '',
 age : '',
 $keyName : '@name'
})

// Result
{
 'ahmed' : {
     age : 23,
     address : {
         first : 'helwan',
         second : 'cairo'
     }
 },
 'mona' : {
    age : 54,
    address : {
        first : 'giza',
        second : 'egypt'
    }
 },
}
```

### $value

TYPE: String | Function

ARGS : [ object, key ]

-----------------------

You can set value of object 😎.

NOTE: name must 🤬 start with '@' if you select value from object

```javascript
qreal(OBJECTS, {
 $length : 2,
 $ignore : [ 'address', 'age' ],
 $include : (obj) => { adult: obj.age > 18 },
 $keyName: '@name',
 $value: '@age',
})

// Result
{
 'ahmed' : 23,
 'mona' : 54
}
```

## Tips 😎 & Tricks ✨

### Tip 1 😎 :

You can do deep selecting in ```$keyName``` and ```$value``` methods

```javascript
qreal(OBJECTS, {
    name : '',
    address : '',
    $normalFeild : true,
    $keyName : () => '@name.0', // 😜 WOW !
    $value : '@address.first'
})

// Result
{
 a: "helwan",
 m: "giza",
 s: "newyork",
 z: "brazil",
}
```

### Tip 2 😎 :

You can make deep restructure data

```javascript
qreal(OBJECTS, {
    address: {
        first : ''
    }
})

// Result
{
 address : {
  first : 'helwan',
 }
},
{
 address : {
  first : 'giza',
 }
},
{
 address : {
  first : 'newyork',
 }
},
{
 address : {
  first : 'brazil',
 }
}
```

## License

[MIT](https://github.com/AbrahemAlhofe/qrealjs/blob/master/LICENSE)
