# Qreal: control your data 😎

qreal is small function to restructure data ( Array Objects ) and now you can use [qlink](https://www.npmjs.com/package/qlink-server) to make resturcture data very easy

## Installation

Use the [npm](https://www.npmjs.com) to install qreal.

```bash
npm install qreal --save
```

or you can use [yarn](https://yarnpkg.com/) to install it

```bash
yarn add qreal
```

you can use qreal in browser by add url of [unpkg](https://unpkg.com) in ```<script>```

```html
<script src='https://unpkg.com/qreal.web.js'></script>
```

## Usage

restructure data by write the name of the property.

> Info : qreal return promise

```javascript
const Qreal = require('qreal')
const qreal = new Qreal()
var data = [
   {
       name : 'jack',
       // OR
       name : (style) => {
           if ( style == 'UpperCase' ) {
               return 'jack'.toUpperCase()
           } else {
               return 'jack'
           }
       },
       age : 13,
       address : {
           first : 'london',
           second : 'bridge'
       },
   },
   {
       name : 'john',
       age : 23,
       address : {
           first : 'berlin',
           second : 'germane'
       }
   }
]

qreal.run(data, {
 name : '',
 // OR pass data to name as function
 name : 'UpperCase',
 // you can make an deep restructre to data
 address : {
   first : ''
 }
})

// Result
[
     {
         name : 'jack',
         address : {
             first : 'london',
         },
     },
     {
         name : 'john',
         address : {
             first : 'berlin',
         }
     }
]
```

### $take

TYPE :  $Number$  or  $Array$

------------------------------------

$take provide you to specify count of items what do you want to take

```javascript
qreal.run(data, {
 $take: 1,
 name : ''
})

// Result
[
 {
  name : 'jack',
 }
]
```

##### examples :

```javascript
{
  // take first 3 items
  $take : 3

  // skip first 3 items
  $take : -3

  // take all items expect last 3 items
  $take : [ -3 ]

  // take item in index 3 in addition to 4 itmes after it
  $take : [ 3, 4 ]

  // take item had { name : "lorem" } in addition to 4 items after it
  $take : [ { name : "lorem" }, 4 ]
}
```

## $ignore

TYPE : $Array$

-------------------------------

You can select items you don't want

```javascript
qreal.run(data, {
 $ignore : [ 'address', 'age' ]
})

// Result
[
 {
  name : 'jack',
 },
 {
  name : 'john',
 }
]
```

### $include

TYPE : $Function$

-----------------------------

You can include items if you want 😜.

```javascript
qreal.run(data, {
     $include : (obj, key) => ({ adult : obj.age > 18 }),
     name : ''
})

// Result
[
 {
  name : 'jack',
  adult: false
 },
 {
  name : 'john',
  adult: true
 }
]
```

### $keyName

TYPE: $String$ or $Function$

ARGS : [ Object , Key ]

-----------------------

$keyName provide you to change key name of object 😎.

> name must 🤬 start with '@' if you select name from object

```javascript
qreal.run(OBJECTS, {
     age : '',
     $keyName : '@name',
     // OR
     $keyName : (obj, key) => '@name'
})

// Result
{
 'jack' : {
    age : 13,
 },
 'john' : {
    age : 23,
 },
}
```

### Aliases

HOW TO USE : "[name of item] : [alias]"

$keyName is not working with sub items 😥 but you can use aliases 😃

> name must 🤬 start with '@' if you select name from object

```javascript
qreal.run(OBJECTS, {
     "address : newAddress" : {
       first : ''
     },
     "address : @first" : {
       second : ''
     }
})

// Result
[
  {
    newAddress: {
      first: "london"
    },
    london: {
      second: "bridge"
    }
  },
  {
    newAddress: {
      first: "berlin"
    },
    berlin: {
      second: "germane"
    }
  }
]
```

### $value

TYPE: $String$ or $Function$

ARGS : [ Object , Key ]

-----------------------

You can set value of object 😎.

> name must 🤬 start with '@' if you select value from object

```javascript
qreal.run(OBJECTS, {
 $value: '@age'
})

// Result
[ 13, 23 ]
```

```javascript
qreal.run(OBJECT, {
  // WARN : use shorthand of $value method on sub queries
  address : '@first'
})

// Result
[
   { name : 'jack', address : 'london' },
   { name : 'john', address : 'berlin' }
]
```

## Qreal.use( name, middleware )

##### ARGS ( arguments what pass to middleware ) : [ ( value of data ) ], Parent Object, query value and next function

Qreal.use method provide you to add middleware to data that can use for relationships between data

```javascript
const _ = require('lodash');
const auhors = [
    ...
    {
      name : 'George Orwell',
      age : 46,
      id : 3
    },
    ...
]
const books = [
    ...
    {
       title : "Animal Farm",
       description : "Is an allegoircal novella by George Orwell.",
       author : 3 // this is an ID of author ( data what pass to middleware )
    },
    ...
]

qreal.use('author', ( id, object, done ) => {
  done(
    _.find( authors , { id } )
  )
})

qreal.run(books, {
   title : '',
   author : {
      $ignore : ['id']
   }
})

// Result
[
    ...
    {
        title : "Animal Farm",
        author : {
            name : "George Orwell",
            age : 46
        }
    },
    ...
]
```

and you can make sub middleware

```js
const auhors = [
 ...
 {
     name : 'George Orwell',
     age : 46,
     books : [ { id : 9 } ],
     id : 3
 },
 ...
]

const books = [
 ...
 {
     title : "Animal Farm",
     id : 9,
     description : "Is an allegoircal novella by George Orwell.",
     author : 3
 },
 ...
]

qreal.use('author.books', ( id, object, done ) => {
    authors.find({ id }, ( author ) => {
        done( author )
    })
})

qreal.run(books, {
 author : {
     books : {
         title: ''
     }
 }
}).then( result ) => {
 console.log( result )
})
// Result
[
 ...
 {
     author : {
         books : [
             { title : "Animal Farm" }
         ]
     }
 },
 ...
]
```

OR use value of query to do some thing

```js

const Book = {
  title : '452 Fehrenhight',
  description : 'be or not to be this is not any thing :>',
  tags : ['test', 'good', 'book'],
  publisher : {
    name : 'home screen',
    country : 'england',
    books : [
      { id : 0 },
      { id : 1 },
      { id : 2 }
    ]
  },
  id : 0,
  author : 0
}

qreal.use('title', (title, object, done, query) => {
  if ( query == 'UpperCase' ) {
    done( title.toUpperCase() )
  }
})

qreal.run(Book, {
  title : 'UpperCase'
})

// Result
{
  title : "452 FEHRENHIGHT"
}
```

## License

You can make deep restructure data

[MIT](https://github.com/AbrahemAlhofe/qrealjs/blob/master/LICENSE)
