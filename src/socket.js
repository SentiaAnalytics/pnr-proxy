//@flow weak
const tls = require('tls')

module.exports = host => request =>
  new Promise((resolve, reject) => {
    const socket = tls.connect(5000, host)
    socket.write(request)

    socket.setEncoding('latin1');

    let data = ''
    socket.on('data', (d) => {
      data += d
    });

    socket.on('error', (e) => {
      reject(e)
    });

    socket.on('end', () => {
      resolve(new Buffer(data).toString('utf8'))
    });
  })
