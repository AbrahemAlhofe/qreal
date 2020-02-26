const qreal = require('./index.js');
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
  books : [
    { id : 0 },
    { id : 4 },
    { id : 9 }
  ]
}

// Tests
// ==========================
test('pass empty array to qreal', () => {
  const result = qreal([], {
    title : "",
    description : ""
  })
  const expected = []

  expect(result).toEqual( expected )
})

test('pass empty array to qreal ( callBack )', ( done ) => {
  const expected = []

  const result = qreal([], {
    title : "",
    description : ""
  }, ( result ) => {
    expect(result).toEqual( expected )
    done()
  })

})

test('restructure data by select items', () => {

  const expected = [{
    title : BookSchema.title,
    description : BookSchema.description,
  }]

  const result = qreal(BookSchema, {
    title : "",
    description : ""
  })

  expect(result).toEqual( expected )
})

test('deep restructure data by select items', () => {

  const result = qreal(BookSchema, {
    title : "",
    publisher : { name : "" }
  })

  const expected = [{
    title : BookSchema.title,
    publisher : { name : BookSchema.publisher.name }
  }]

  expect(result).toEqual( expected )

})

test('take only the first three items', () => {

  const result = qreal( create(BookSchema) , {
    $take : 3,
    title : "",
    id : ""
  })

  const expected = create({
    title : BookSchema.title,
    id : BookSchema.id
  }, 3)

  expect(result).toEqual( expected )

})

test('skip only the last three items', () => {

  const result = qreal( create(BookSchema), {
    $take : [ -3 ],
    title : "",
    id : ""
  })

  // |> 0 1 2 3 4 5 6 7 | 8 9 10
  const expected = create({
    title : BookSchema.title,
    id : BookSchema.id
  }, settings.length - 3 )

  expect(result).toEqual( expected )

})

test('take an item in index 4 in addition to 3 items after it', () => {

  const result = qreal( create(BookSchema, 20), {
    $take : [ 4, 3 ],
    title : "",
    id : ""
  })

  // 0 1 2 3 |> 4 5 6 7 <| 8 9 10
  const expected = create({
    title : BookSchema.title,
    id : 4
  }, 4)

  expect(result).toEqual( expected )

})

test('take an item has { id : 4 } in addition to 3 items after it', () => {

  const result = qreal( create(BookSchema) , {
    $take : [ { id : 4 }, 3 ],
    title : "",
    id : ""
  })

  // 0 1 2 3 |> 4 5 6 7 <| 8 9 10
  const expected = create({
    title : BookSchema.title,
    id : 4
  }, 4)

  expect(result).toEqual( expected )

})

test('take first 10 characters in title of book', () => {
  const result = qreal( BookSchema , {
    title : {
      $take : 10
    }
  })

  const expected = [{
    title : BookSchema.title.slice(0, 10),
  }]

  expect(result).toEqual( expected )
})

test('ignore items by select key name of it', () => {

  const result = qreal(BookSchema, {
    $ignore : ['tags', 'description', 'author']
  })

  const expected = [{
    title : BookSchema.title,
    publisher : BookSchema.publisher,
    id : BookSchema.id,
  }]

  expect(result).toEqual( expected )

})

test('ignore items in an array by select it', () => {

  const result = qreal(BookSchema, {
    tags : {
      $ignore : ['good']
    }
  })

  const expected = [{
    tags : ['test', 'book']
  }]

  expect(result).toEqual( expected )

})

test('include data to items', () => {

  const result = qreal(BookSchema, {
    $include : ( obj ) => ({ tags_length : obj.tags.length })
  })

  const expected = [{
    tags_length : BookSchema.tags.length
  }]

  expect(result).toEqual( expected )

})

test('change key name of items', () => {

  const result = qreal(BookSchema, {
    $keyName : () => '@title',
    publisher : '',
    author : ''
  })

  const expected = {
    [BookSchema.title] : {
      publisher : BookSchema.publisher,
      author : BookSchema.author
    }
  }

  expect(result).toEqual( expected )

})

test('change value of items by Function', () => {

  const result = qreal(BookSchema, {
    $value : (obj) => ({ nameBook : obj.title }),
  })

  const expected = [{
    nameBook : BookSchema.title
  }]

  expect(result).toEqual( expected )

})

test('change value of items by String', () => {

  const result = qreal(BookSchema, {
    $value : '@title'
  })

  const expected = [ BookSchema.title ]

  expect(result).toEqual( expected )

})

test('change value of items by String ( Number )', () => {

  const result = qreal(AuthorSchema, {
    $value : '@age'
  })

  const expected = [ AuthorSchema.age ]

  expect(result).toEqual( expected )

})


test('change value of [ books ] of Author by String', () => {

  const result = qreal(AuthorSchema, {
    books : {
      $value : '@length'
    }
  })

  const expected = [{
    books : AuthorSchema.books.length
  }]

  expect(result).toEqual( expected )

})

test('change value of [ books ] of Author by String ( shorthand )', () => {

  const result = qreal(AuthorSchema, {
    books : '@length'
  })

  const expected = [{
    books : AuthorSchema.books.length
  }]

  expect(result).toEqual( expected )

})

test('get name and age of author of each book', () => {

  qreal.use('author', ( id, done ) => {
    if ( id === 0 ) {
      done( AuthorSchema )
    }
  })

  const result = qreal(BookSchema, {
    author : {
      name : '',
      age : ''
    }
  })

  const expected = [{
    author : {
      name : AuthorSchema.name,
      age : AuthorSchema.age
    }
  }]

  expect(result).toEqual(expected)
})

test('get name of author in addition to title and id of each book he had', () => {
  const books = create( BookSchema, 10 )

  qreal.use('books', ({ id }, done) => {
    done( _.find(books, { id }) )
  })

  const result = qreal(AuthorSchema, {
    name : '',
    books : {
      title : '',
      id : '',
    }
  })

  const expected = [{
    name : AuthorSchema.name,

    books : [
      { title : BookSchema.title, id : AuthorSchema.books[0].id },
      { title : BookSchema.title, id : AuthorSchema.books[1].id },
      { title : BookSchema.title, id : AuthorSchema.books[2].id }
    ]

  }]

  expect(result).toEqual(expected)
})

test('get name and age of author of each book he had with ( Promise ) two items', ( done ) => {
  const expected = create({
    author : {
      name : AuthorSchema.name,
      age : AuthorSchema.age
    }
  }, 2)


  qreal.use('author', ( id, done ) => {
    setTimeout(() => {
      if ( id === 0 ) {
        done( AuthorSchema )
      }
    }, 500)
  })

  const result = qreal( create(BookSchema, 2), {
    author : {
      name : '',
      age : ''
    }
  }, ( result ) => {
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

  qreal.use('publisher.books', ({ id }, done) => {
    done( find(id) )
  })

  const result = qreal(BookSchema, {
    publisher : {
      books : {
        title : '',
        id : ''
      }
    }
  })

  expect(result).toEqual(expected)
})
