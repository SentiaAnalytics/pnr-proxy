//@flow weak
const HOST = 'direkte-demo.cpr.dk'
const {parseLogin, parseResult} = require('./parser')
const socket = require('./socket')
const {replace, assoc, merge, evolve, range, map, compose, take} = require('ramda')

const tap = f => x => (f(x), x)
const then = f => p => p.then(f)

const DEFAULTS = {
  logging: true,
  host: 'direkte-demo.cpr.dk',
  userID: '0000',
  username: 'default!',
  password: 'default!'
}

const pad = len => str =>
  str + (new Array((len - str.length) + 1).join(' '))

const padCredentials = evolve({
  username: pad(8),
  password: pad(8)
})

const loginRequest = ({userID, username, password}) =>
  pad(35)(`PRIV,${userID}90${username}${password}`)


const pnrRequest = cpr => ({username, userID, token}) =>
  pad(39)(`PRIV,${userID}06${token}${username}00${cpr}`)

const cleanCpr = replace('-', '')

module.exports = _options => {
  let options = merge(DEFAULTS)(padCredentials(_options))

  const log = key => value =>
    options.logging ? (console.log(key, value), value) : value

  const cprRequest = socket(options.host)

  const login = compose(then(parseLogin), cprRequest, loginRequest)

  const makePnrRequest = cpr =>
    compose(then(parseResult), cprRequest, pnrRequest(cleanCpr(cpr)))

  const makePnrRequestWithLogin = cpr =>
    compose(then(makePnrRequest(cpr)), login)

  const pnrLookup = cpr => credentials =>
    credentials.token ? makePnrRequest(cpr)(credentials) :
    makePnrRequestWithLogin(cpr)(credentials)

  return cpr =>
    pnrLookup(cpr)(options)
      .catch(e => {
        if (e.errorCode === '07') {
          log('token expired')(options.token)
          options = assoc('token', null, options)
          return pnrLookup(cpr)(options)
        }
        return Promise.reject(e)
      })
      .then(tap(({token}) => options = assoc('token', token, options))) // save token for next call
}
