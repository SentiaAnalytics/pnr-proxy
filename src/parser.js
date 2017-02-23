//@flow weak
const {compose, evolve, merge, drop, slice, map, assoc} = require('ramda')
const errorCodes = require('./error-codes.json')

const then = f => p => p.then(f)

const read = start => len => text =>
  slice(start-1, start + len - 1, text).trim()

// all responses include a header on the same format
const parseHeader = result =>
  map(
    f => f(result.trim()),
    {
      userID: read(1)(4),
      subscriptionType: read(5)(1),
      dataType: read(6)(1),
      token: read(7)(8),
      username: read(15)(8),
      errorCode: read(23)(2),
      errorDetails: d => errorCodes[read(23)(2)(d)] || '',
      contentLength: read(25)(4),
      body: drop(28)
    }
  )

// body will contain 3 or more records each with its own format and content length
// the first 3 bytes of every record shows the record type
// return the record, and the remaining data
const readRecord = data => {
  const id = read(1)(3)(data)
  const len = recordLength[id] || 0
  return [
    {[id]: read(1)(len)(data)},
    drop(len)(data)
  ]
}

const recordLength = {
  '000': 35,
  '001': 469,
  '002': 195,
  '003': 195,
  '004': 26,
  '005': 217,
  '011': 88,
  '050': 29,
  '999': 21
}

// each record has its own parsing rules
const recordParsers = {
  '000': data => ({
    type: read(10)(3)(data),
    assignmentNumber: read(14)(6)(data),
    date: read(20)(8)(data),
    lastDate: read(28)(8)(data)
  }),
  '001': data => ({
    type: read(1)(3)(data),
    pnr: read(4)(10)(data),
    dob: read(14)(8)(data),
    sex: read(22)(1)(data).replace('K', 'F'),
    status: read(23)(2)(data),
    statusDate: read(25)(12)(data),
    pnrStatus: read(37)(10)(data),
    tutelageDate: read(47)(12)(data),
    moveInDate: read(59)(12)(data),
    nameAddrressProtectionDate: read(71)(12)(data),
    occupation: read(83)(34)(data),
    formattedName: read(117)(34)(data),
    COName: read(151)(34)(data),
    locality: read(185)(34)(data),
    standardAddress: read(219)(34)(data),
    city: read(253)(34)(data),
    postcode: read(287)(4)(data),
    postDistrict: read(291)(20)(data),
    municipalityCode: read(311)(4)(data),
    streetCode: read(315)(4)(data),
    houseNumber: read(319)(4)(data),
    floor: read(323)(2)(data),
    apartment: read(325)(4)(data),
    buildingNumber: read(329)(4)(data),
    forenames: read(333)(50)(data),
    lastname: read(383)(40)(data),
    street: read(423)(20)(data),
    directMarketingProtectionDate: read(458)(12)(data)
  }),
  '002': data => data,
  '999': data => ({
    type: read(1)(3)(data),
    recordCount: read(14)(8)(data)
  })
}

// read each record form the body and run them through the respective parsers
const parseBody = data => {
  const go = records => body => {
    if (body.length <= 0) return records
    const [record, rest] = readRecord(body)
    return go(merge(record)(records))(rest)
  }
  return evolve(recordParsers)(go({})(data))
}

const checkForError = header =>
  header.errorCode === '00' ? Promise.resolve(header) : Promise.reject(header)

exports.parseResult =
  compose(then(evolve({body: parseBody})), checkForError, parseHeader)

exports.parseLogin =
  compose(checkForError, parseHeader)
