const data = new Array(10000).fill({
  title : 'lorem ipsum dollar',
  likes : 23,
  id : 123123
})

async function run() {
  const val = await qreal(data, { title : '' })
  console.log( val )
}

document.getElementById('btn').addEventListener('click', run)
