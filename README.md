#Sentia-pnr
sentia-pnr is a simple client for [cpr direkte](https://www.cpr.dk/kunder/private-virksomheder/cpr-direkte-program-til-program/) developed by [Sentia](http://sentia.ai).
Sentia-pnr can either be used as a node library, or a standalone proxy for cpr direkte.


## disclaimer
Sentia accepts absolutely no responsibility for any use of this library.

## node library

```js
const pnr = require('sentia-pnr')
const client = pnr({
  logging: true,
  userID: <cpr direkte userID>,
  username: <cpr direkte username>,
  password: <cpr direkte password>,
  host: 'direkte.cpr.dk' // defaults to direkte-demo.cpr.dk
})

pnr('070861-4815')
  .then(console.log, console.error)

```
see the [test-data](/test-data) folder for examples of the data format.


## standalone proxy
you can also run sentia-pnr as a standalone proxy for cpr direkte


to run the proxy simply run :

```
yarn
yarn start
```

you need to set the following env vars before running the server:

`CPR_USER_ID`, `CPR_USERNAME`, `CPR_PASSWORD`, `CPR_HOST`, `PORT`

in addition you can set `AUTH_TOKEN`. this will make the proxy verify the requests authorization header against the AUTH_TOKEN before processing the request.

## docker
you can also run the proxy as a docker image `sentia/pnr-proxy` using the same env vars as described in the previous section.
