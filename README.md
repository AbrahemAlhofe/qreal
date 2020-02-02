# Qreal: control your data 😎

qreal is small function to restructure data ( Array Objects )

## Installation

Use the [npm](https://www.npmjs.com) to install qreal.

```bash
npm install qreal --save
```

or you can use [yarn](https://yarnpkg.com/) to install it

```bash
yarn add qreal
```

you can use qreal in browser by add url of [unpkg](https://unpkg.com) in ```<script>``` tag

```html
<script src='https://unpkg.com/qreal'></script>
```

## Usage

restructure data by write the name of the property.

```javascript
const qreal = require('qreal')
var data = [
   {
       name : 'jack',
       age : 13,
       address : {
           first : 'london',
           second : 'bridge'
       },
   },
   {
       name : 'john',
       age : 23
       address : {
           first : 'berlin',
           second : 'german'
       }
   }
]

qreal(data, {
 name : '',
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
qreal(data, {
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
qreal(data, {
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
qreal(data, { 
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
qreal(OBJECTS, {
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

### $value

TYPE: $String$ or $Function$

ARGS : [ Object , Key ]

-----------------------

You can set value of object 😎.

> name must 🤬 start with '@' if you select value from object

```javascript
qreal(OBJECTS, {
 $value: '@age'
})

// Result
{
 'jack' : 13,
 'john' : 23
}
```

## Qreal.use( name, middleware )

##### ARGS ( arguments what pass to middleware ) : [ ( value of data ) ]

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

qreal.use('author', ( id ) => {
    return _.find( authors , { id } )
})

qreal(books, {
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

you can return promise in middleware,, if you make that you should put your left code into call back qreal

```javascript
const auhors = [
     ...
     {
         name : 'George Orwell',
         age : 46,
         id : 3
     },
     ...
]

const find = ( id ) => {
    return new Promise((resolve, reject) => {
        authors.find({ id }, ( author ) => {
            resolve( author )
        })
    })
}

const books = [
     ...
     {
         title : "Animal Farm",
         description : "Is an allegoircal novella by George Orwell.",
         author : 3 // this is an ID of author ( data what pass to middleware )
     },
     ...
]

qreal.use('author', ( id ) => {
     return find( authors , { id } )
})

qreal(books, {
     title : '',
     author : {
         $ignore : ['id']
     }
}, ( result ) => {
   console.log( result )
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
const find = ( id ) => {
 return new Promise((resolve, reject) => {
     authors.find({ id }, ( author ) => {
         resolve( author )
     })
 })
}
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
qreal.use('author.books', ( id ) => {
 return find( books, { id } )
})
qreal(books, {
 author : {
     books : {
         title: ''
     }
 }
}, ( result ) => {
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

## License

You can make deep restructure data

[MIT](https://github.com/AbrahemAlhofe/qrealjs/blob/master/LICENSE)


