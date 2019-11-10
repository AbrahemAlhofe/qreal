# qreal v1.0.0

qreal is small middleware to restructure data ( Array Objects )

## Installation

Use the [npm](https://www.npmjs.com) to install qreal.

```bash
npm install qreal --save
```
or you can use  [yarn](https://yarnpkg.com/) to install qreal.

```bash
npm install qreal --save
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

You can specify the number of items what do you want

```javascript
qreal(OBJECTS, {
 length : 2,
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


## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update the tests as appropriate.

## License
[MIT](https://choosealicense.com/licenses/mit/)
