# qreal v1.0.0

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
and you can add it by ```<script/>``` tag

```html
<script src='/path/to/qreal.js' ></script>
```

## Usage

you can restructure data by write the name of the property.

NOTE: if objects what you pass had one item qreal will work with it without any problems

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
  }
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

### $length
TYPE : Number

You can specify the number of items what do you want

```javascript
qreal(OBJECTS, {
 $length : 2,
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

You can select the items you don't want

```javascript
qreal(OBJECTS, {
 $length : 2,
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

You can include items if you want

```javascript
qreal(OBJECTS, {
 $length : 2,
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
### $return
TYPE : Number

You can make qreal return one item by write index of it

```javascript
qreal(OBJECTS, {
 $length : 2,
 $ignore : [ 'address', 'age' ],
 $include : (obj) => { adult: obj.age > 18 },
 $return : 1
})

// Result
{
 name : 'mona',
 adult: true
}
```

## License
[MIT](https://github.com/AbrahemAlhofe/qrealjs/blob/master/LICENSE)
