const qreal = require('./src/index');
const _ = require('lodash');

// Utilities
// =========================
var settings = {
  length : 10
}

const create = (object, args=[], length = settings.length, keyName) => {
  // add id argument by default to args if user pass args without id
  args.push('id')
  // edite each object on array of objects to make every object diffrent of each other
  const result = ( keyName ) ? {}:[]
  for ( let i = 0; i < length ; i += 1 ) {
    let data = ( _.isString(object) ) ? object : { ...object }
    for ( let argument of args ) {
      if ( _.has( data, argument ) ) {
        data[argument] = data[argument] + i
      }
    }
    result[keyName || i] = data
  }
  return result
}

// Data Base
// =========================
const BookSchema = {
  title : '452 Fehrenhight',
  description : 'be or not to be this is not any thing :>',
  tags : ['test', 'good', 'book'],
  publisher : {
    name : 'home screen',
    country : 'england'
  },
  id : 0,
  author : 0
}

const books = create(BookSchema, [ 'author' ])

// Tests
// ==========================

describe('Qreal in ( Hello World ) mode ', () => {

  test('restructure data by select items', () => {

    const result = qreal(books, {
      title : "",
      description : ""
    })

    const expected = create({
      title : BookSchema.title,
      description : BookSchema.description,
    })

    expect(result).toEqual( expected )

  })

  test('deep restructure data by select items', () => {

    const result = qreal(books, {
      title : "",
      publisher : { name : "" }
    })

    const expected = create({
      title : BookSchema.title,
      publisher : { name : BookSchema.publisher.name }
    })

    expect(result).toEqual( expected )

  })

  test('take only the first three items', () => {

    const result = qreal(books, {
      $take : 3,
      title : "",
      id : ""
    })

    const expected = create({
      title : BookSchema.title,
      id : BookSchema.id
    }, [], 3)

    expect(result).toEqual( expected )

  })

  test('skip only the last three items', () => {

    const result = qreal(books, {
      $take : [ -3 ],
      title : "",
      id : ""
    })

    // |> 0 1 2 3 4 5 6 7 | 8 9 10
    const expected = create({
      title : BookSchema.title,
      id : BookSchema.id
    }, [], settings.length - 3 )

    expect(result).toEqual( expected )

  })

  test('take an item in index 4 in addition to 3 items after it', () => {

    const result = qreal(books, {
      $take : [ 4, 3 ],
      title : "",
      id : ""
    })

    // 0 1 2 3 |> 4 5 6 7 <| 8 9 10
    const expected = create({
      title : BookSchema.title,
      id : 4
    }, [], 4)

    expect(result).toEqual( expected )

  })

  test('take an item has { id : 4 } in addition to 3 items after it', () => {

    const result = qreal(books, {
      $take : [ { id : 4 }, 3 ],
      title : "",
      id : ""
    })

    // 0 1 2 3 |> 4 5 6 7 <| 8 9 10
    const expected = create({
      title : BookSchema.title,
      id : 4
    }, [], 4)

    expect(result).toEqual( expected )

  })

  test('ignore items by select key name of it', () => {

    const result = qreal(books, {
      $ignore : ['tags', 'description']
    })

    const expected = create({
      title : BookSchema.title,
      publisher : BookSchema.publisher,
      id : BookSchema.id,
      author : BookSchema.author
    }, ['author'])

    expect(result).toEqual( expected )

  })

  test('ignore items in an array by select it', () => {

    const result = qreal(books, {
      tags : {
        $ignore : ['good']
      }
    })

    const expected = create({
      tags : ['test', 'book']
    })

    expect(result).toEqual( expected )

  })

  test('include data to items', () => {

    const result = qreal(books, {
      $include : ( obj ) => ({ tags_length : obj.tags.length })
    })

    const expected = create({
      tags_length : BookSchema.tags.length
    })

    expect(result).toEqual( expected )

  })

  test('change key name of items', () => {

    const result = qreal(books[0], {
      $keyName : () => '@title',
      publisher : '',
      author : ''
    })

    const expected = create({
      publisher : BookSchema.publisher,
      author : BookSchema.author
    }, [], 1, BookSchema.title)

    expect(result).toEqual( expected )

  })

  test('change value of items by Function', () => {

    const result = qreal(books, {
      $value : (obj) => ({ nameBook : obj.title }),
    })

    const expected = create({
      nameBook : BookSchema.title
    })

    expect(result).toEqual( expected )

  })

  test('change value of items by String', () => {

    const result = qreal(books, {
      $value : '@title'
    })

    const expected = create(BookSchema.title)

    expect(result).toEqual( expected )

  })

})
