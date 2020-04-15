const Qreal = require('../qreal.js');
const qreal = new Qreal();
const _ = require('lodash');

// Utilities
// =========================
var settings = {
  length : 10
}

const create = ( obj, n = settings.length ) => _.fill(new Array(n), obj).map((o,i)=>{
  const res = { ...obj }
  if ( _.has(obj, 'id') ) { res.id = res.id + i }
  return res
})


// Data Base
// =========================
const BookSchema = {
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

const AuthorSchema = {
  name : 'Abrahem ali',
  age : 14,
  avatar : 'https://www.avatar.com/2f3r43f3',
  id : 0,
  notifications : [],
  books : [
    { id : 0, name : 'book 1' },
    { id : 4, name : 'book 2' },
    { id : 9, name : 'book 3' }
  ]
}

// Tests
// ==========================
test('pass empty array to qreal', () => {
  expect.assertions(1);

  const expected = []

  return qreal.run([], {
    title : "",
    description : ""
  }).then((result) => {
    expect(result).toEqual( expected )
  })

})

test('restructure data by select items', () => {
  expect.assertions(1);

  const expected = [{
    title : BookSchema.title,
    description : BookSchema.description,
  }]

   return qreal.run(BookSchema, {
    title : "",
    description : ""
  }).then((result) => {
    expect(result).toEqual( expected )
  })

})

test('deep restructure data by select items', () => {
  expect.assertions(1);

  const expected = [{
    title : BookSchema.title,
    publisher : { name : BookSchema.publisher.name }
  }]

  return qreal.run(BookSchema, {
    title : '',
    publisher : { name : '' }
  }).then(result => {
    expect(result).toEqual( expected )
  })

})

test('deep restructure data by select items ( array )', () => {
  expect.assertions(1);

  const expected = [{
    books : [
      { name : 'book 1' },
      { name : 'book 2' },
      { name : 'book 3' }
    ]
  }]

 return qreal.run(AuthorSchema, {
    books : {
      name : ''
    }
  }).then(result => {
    expect(result).toEqual( expected )
  })

})

test('take only the first three items', () => {
  expect.assertions(1);

  const expected = create({
    title : BookSchema.title,
    id : BookSchema.id
  }, 3)

  return qreal.run( create(BookSchema) , {
    $take : 3,
    title : "",
    id : ""
  }).then(result => {
    expect(result).toEqual( expected )
  })
})

test('skip only the last three items', () => {
  expect.assertions(1);

  // |> 0 1 2 3 4 5 6 7 | 8 9 10
  const expected = create({
    title : BookSchema.title,
    id : BookSchema.id
  }, settings.length - 3 )

  return qreal.run( create(BookSchema), {
    $take : [ -3 ],
    title : "",
    id : ""
  }).then(result => {
    expect(result).toEqual( expected )
  })
})

test('take an item in index 4 in addition to 3 items after it', () => {
  expect.assertions(1);

  // 0 1 2 3 |> 4 5 6 7 <| 8 9 10
  const expected = create({
    title : BookSchema.title,
    id : 4
  }, 4)

  return qreal.run( create(BookSchema, 20), {
    $take : [ 4, 3 ],
    title : "",
    id : ""
  }).then(result => {
    expect(result).toEqual( expected )
  })
})

test('take an item has { id : 4 } in addition to 3 items after it', () => {
  expect.assertions(1);

  // 0 1 2 3 |> 4 5 6 7 <| 8 9 10
  const expected = create({
    title : BookSchema.title,
    id : 4
  }, 4)

  return qreal.run( create(BookSchema) , {
    $take : [ { id : 4 }, 3 ],
    title : "",
    id : ""
  }).then(result => {
    expect(result).toEqual( expected )
  })
})

test('take first 10 characters in title of book', () => {
  expect.assertions(1);

  const expected = [{
    title : BookSchema.title.slice(0, 10),
  }]

  return qreal.run( BookSchema , {
    title : {
      $take : 10
    }
  }).then(result => {
    expect(result).toEqual( expected )
  })
})

test('ignore items by select key name of it', () => {
  expect.assertions(1);

  const expected = [{
    title : BookSchema.title,
    publisher : BookSchema.publisher,
    id : BookSchema.id,
  }]

  return qreal.run(BookSchema, {
    $ignore : ['tags', 'description', 'author']
  }).then(result => {
    expect(result).toEqual( expected )
  })

})

test('ignore items in an array by select it', () => {
  expect.assertions(1);

  const expected = [{
    tags : ['test', 'book']
  }]

  return qreal.run(BookSchema, {
    tags : {
      $ignore : ['good']
    }
  }).then(result => {
    expect(result).toEqual( expected )
  })

})

test('include data to items', () => {
  expect.assertions(1);


  const expected = [{
    tags_length : BookSchema.tags.length
  }]

  return qreal.run(BookSchema, {
    $include : ( obj ) => ({ tags_length : obj.tags.length })
  }).then(result => {
    expect(result).toEqual( expected )
  })

})

test('change key name of items by $keyName method', () => {
  expect.assertions(1);

  const expected = {
    [BookSchema.title] : {
      publisher : BookSchema.publisher,
      author : BookSchema.author
    }
  }

  return qreal.run(BookSchema, {
    $keyName : () => '@title',
    publisher : '',
    author : ''
  }).then(result => {
    expect(result).toEqual( expected )
  })

})

test('change key name of items by $keyName method ( regular )', () => {
  expect.assertions(1);

  const expected = {
    "book" : {
      publisher : BookSchema.publisher,
      author : BookSchema.author
    }
  }

  return qreal.run(BookSchema, {
    $keyName : 'book',
    publisher : '',
    author : ''
  }).then(result => {
    expect(result).toEqual( expected )
  })

})

test('change key name of sub items by alias ( normal )', () => {
  expect.assertions(1);

  const expected = [
     {
      "my Publisher" : BookSchema.publisher,
      author : BookSchema.author
    }
  ]

  return qreal.run(BookSchema, {
    "publisher : my Publisher" : '',
    author : ''
  }).then(result => {
    expect(result).toEqual( expected )
  })

})

test('change key name of sub items by alias ( from item )', () => {
  expect.assertions(1);

  const expected = [
     {
      [BookSchema.publisher.name] : BookSchema.publisher,
      author : BookSchema.author
    }
  ]

  return qreal.run(BookSchema, {
    "publisher : @name" : '',
    author : ''
  }).then(result => {
    expect(result).toEqual( expected )
  })

})

test('change key name of sub items by alias ( from item ) with two middlewares', () => {
  expect.assertions(1);

  qreal.use('author', (uid, book, done) => {
    done(uid + 1)
  })

  qreal.use('author', (uid, book, done) => {
    if ( uid === 1 ) {
      done(AuthorSchema)
    }
  })

  const expected = [
     {
      [AuthorSchema.name] : {
        age : AuthorSchema.age
      }
    }
  ]

  return qreal.run(BookSchema, {
    "author : @name" : {
      age : ''
    }
  }).then(result => {
    expect(result).toEqual( expected )
  })

})

test('change value of items by Function', () => {
  expect.assertions(1);

  const expected = [{
    nameBook : BookSchema.title
  }]

  return qreal.run(BookSchema, {
    $value : (obj) => ({ nameBook : obj.title }),
  }).then(result => {
    expect(result).toEqual( expected )
  })

})

test('change value of items by String', () => {
  expect.assertions(1);

  const expected = [ BookSchema.title ]

  return qreal.run(BookSchema, {
    $value : '@title'
  }).then(result => {
    expect(result).toEqual( expected )
  })

})

test('change value of items by String ( regular )', () => {
  expect.assertions(1);

  const expected = [ 'value' ]

  return qreal.run(BookSchema, {
    $value : 'value'
  }).then(result => {
    expect(result).toEqual( expected )
  })

})

test('change value of items by String ( Number )', () => {
  expect.assertions(1);

  const expected = [ AuthorSchema.age ]

  return qreal.run(AuthorSchema, {
    $value : '@age'
  }).then(result => {
    expect(result).toEqual( expected )
  })

})

test('change value of [ books ] of Author by String ( shorthand )', () => {
  expect.assertions(1);


  const expected = [{
    books : AuthorSchema.books.length,
    notifications : AuthorSchema.notifications.length
  }]

  return qreal.run(AuthorSchema, {
    books : '@length',
    notifications : '@length'
  }).then(result => {
    expect(result).toEqual( expected )
  })

})

test('get name and age of author of each book', () => {
  expect.assertions(1);

  qreal.middlewares = {}

  qreal.use('author', ( id, object, done ) => {
    if ( id === 0 ) {
      done( AuthorSchema )
    }
  })

  const expected = [{
    author : {
      name : AuthorSchema.name,
      age : AuthorSchema.age
    }
  }]

  return qreal.run(BookSchema, {
    author : {
      name : '',
      age : ''
    }
  }).then(result => {
    expect(result).toEqual(expected)
  })

})

test('get name of author in addition to title and id of each book he had', () => {
  expect.assertions(1);
  const books = create( BookSchema, 10 )

  qreal.use('books', ({ id }, object, done) => {
    done( _.find(books, { id }) )
  })

  const expected = [{
    name : AuthorSchema.name,

    books : [
      { title : BookSchema.title, id : AuthorSchema.books[0].id },
      { title : BookSchema.title, id : AuthorSchema.books[1].id },
      { title : BookSchema.title, id : AuthorSchema.books[2].id }
    ]

  }]

  return qreal.run(AuthorSchema, {
    name : '',
    books : {
      title : '',
      id : '',
    }
  }).then(result => {
    expect(result).toEqual(expected)
  })

})

test('get name and age of author of each book he had with ( Promise ) two items', ( done ) => {
  expect.assertions(1);

  const expected = create({
    author : {
      name : AuthorSchema.name,
      age : AuthorSchema.age
    }
  }, 2)

  qreal.middlewares = {}

  qreal.use('author', ( id, object, done ) => {
    setTimeout(() => {
      if ( id === 0 ) {
        done( AuthorSchema )
      }
    }, 500)
  })

  return qreal.run( create(BookSchema, 2), {
    author : {
      name : '',
      age : ''
    }
  }).then(( result ) => {
    expect(result).toEqual(expected)
    done()
  })

})

test('get name and id of books in publisher in BookSchema ( sub middleware )', () => {

  const expected = [{
    publisher : {
      books : create({
        title : BookSchema.title,
        id : 0
      }, 3)
    }
  }]

  const find = ( id ) => {
    const array = [0, 1, 2]
    if ( array.indexOf(id) != -1 ) {
      let book = { ...BookSchema }
      book.id = id
      return book
    }
  }

  qreal.use('publisher.books', ({ id }, object, done) => {
    if ( _.isEqual(object, BookSchema.publisher) ) {
      done( find(id) )
    }
  })

  return qreal.run(BookSchema, {
    publisher : {
      books : {
        title : '',
        id : ''
      }
    }
  }).then(result => {
    expect(result).toEqual(expected)
  })

})

test('support data as a function', () => {
  expect.assertions(1);

  function BookWithCustomeId (id) {
    return Object.assign(BookSchema, { id })
  }

  const expected = [{
    BookWithCustomeId : Object.assign(BookSchema, { id : 12 })
  }]

  return qreal.run({ BookWithCustomeId }, {
    BookWithCustomeId : 12
  }).then(result => {
    expect(result).toEqual(expected)
  })

})

test('support data as a function ( array )', () => {
  function BookWithCustomeTags (tags) {
    return Object.assign(BookSchema, { tags })
  }

  const expected = [{
    BookWithCustomeTags : Object.assign(BookSchema, { tags : ['tag1', 'tag2', 'tag3'] })
  }]

  return qreal.run({ BookWithCustomeTags }, {
    BookWithCustomeTags : ['tag1', 'tag2', 'tag3']
  }).then(result => {
    expect(result).toEqual(expected)
  })

})

test('support data as a function with middleware', () => {
  function BookWithCustomeTags (tags, moreTags) {
    return Object.assign(BookSchema, { tags })
  }

  const expected = [{
    BookWithCustomeTags : Object.assign(BookSchema, { tags : ['tag11', 'tag21', 'tag31'] })
  }]

  qreal.use('BookWithCustomeTags', (func, object, done) => {
    done( func(['tag11', 'tag21', 'tag31']) )
  })

  return qreal.run({ BookWithCustomeTags }, {
    BookWithCustomeTags : ['tag1', 'tag2', 'tag3']
  }).then(result => {
    expect(result).toEqual(expected)
  })

})

test('pass query to middlewares', () => {
  expect.assertions(1);

  qreal.use('title', (title, object, done, query) => {
    if ( query == 'UpperCase' ) {
      done( title.toUpperCase() )
    }
  })

  const expected = [ { title : BookSchema.title.toUpperCase() } ]

  return qreal.run(BookSchema, {
    title : 'UpperCase'
  }).then(result => {
    expect(result).toEqual(expected)
  })

})
