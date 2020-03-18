const data = new Array(10 ** 2).fill({
  title : 'lorem ipsum dollar',
  likes : 23,
  author : {
    name : 'Abrahem alhofe',
    age : 14
  },
  id : 123123
})

qreal.use('likes', (likes, object, done) => {
  done(1)
})

async function run() {
  // Start time
  var start = new Date().getTime();

  // Restructure data
  const val = await qreal(data, { title : '', likes : '', author : { name : ''} })
  console.log( val )

  // End time
  var end = new Date().getTime();

  // messure time of process at all in seconds
  console.log('time : ', (end - start) / 1000, 's')
}

document.getElementById('btn').addEventListener('click', run)
