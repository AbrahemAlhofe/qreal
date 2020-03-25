const data = new Array(1000).fill({
    name : 'jack',
    age : 13,
    address : {
        first : 'london',
        second : 'bridge'
    },
})

const query = {
  "address : newAddress" : {
    first : ''
  }
}

async function run() {
  // Start time
  var start = new Date().getTime();

  // Restructure data
  const val = await qreal(data, query)
  console.log( val )

  // End time
  var end = new Date().getTime();

  // messure time of process at all in seconds
  console.log('time : ', (end - start) / 1000, 's')
}

document.getElementById('btn').addEventListener('click', run)
