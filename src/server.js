//@flow weak
const assert = require('assert')
assert(process.env.PORT, 'You must set the env var PORT')
assert(process.env.PORT, 'You must set the env var PORT')
assert(process.env.CPR_USER_ID, 'You must set the env var CPR_USER_ID')
assert(process.env.CPR_USERNAME, 'You must set the env var CPR_USERNAME')
assert(process.env.CPR_PASSWORD, 'You must set the env var CPR_PASSWORD')
assert(process.env.CPR_HOST, 'You must set the env var CPR_HOST')

const express = require('express')
const app = express()

const {PORT, AUTH_TOKEN} = process.env
const OPTIONS = {
  userID: process.env.CPR_USER_ID,
  username: process.env.CPR_USERNAME,
  password: process.env.CPR_PASSWORD,
  host: process.env.CPR_HOST
}

const pnrLookup = require('./index')(OPTIONS)

app.use((req, res, next) => {
  !AUTH_TOKEN ? next() :
  req.headers.authorization === AUTH_TOKEN ? next() :
  res.status(403).send('Invalid Authorization header')
})

app.get('/pnr/:pnr', (req, res) =>
  pnrLookup(req.params.pnr)
    .then(x => res.send(x), e => res.status(500).send(e))
)

app.listen(PORT, () => console.log(`Server listening on port ${String(PORT)}`))
