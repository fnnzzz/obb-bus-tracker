import oebb from 'oebb-api'
import { parse, differenceInMinutes } from 'date-fns'
import { formatInTimeZone, zonedTimeToUtc, utcToZonedTime } from 'date-fns-tz'

const retrieveStationId = (term) => {
  var options = oebb.getStationSearchOptions();
  options.S = term;
  oebb.searchStations(options).then(console.log);
}

const stationsHashMap = {
  "rodaun": '001192303',
  "kaiser": '000923019',
  "liesing": '001192301',
  "hietzing": '001391367',
  "freizeitzentrum": '001331772',
  'spitalskirche': '000317092',
  'langegasse': '000908016',
  'westbahnhof': '001291501'
}

const VIENNA_TZ = 'Europe/Vienna'

var options = oebb.getStationBoardDataOptions()
options.time = formatInTimeZone(new Date(), VIENNA_TZ, 'HH:mm')

const getProcessedResponse = async (from, to) => {
  const fromId = stationsHashMap[from]
  const toId = stationsHashMap[to]

  if (!fromId || !toId) throw "Incorrect `from` or `to`"

  options.evaId = fromId
  options.dirInput = toId

  return oebb.getStationBoardData(options).then(obbResponse => {
    return obbResponse.journey
      .map(j => {
        // `rt` exists if is delayed
        const apiDateTimeString = j.rt ? `${j.rt.dld} ${j.rt.dlt}` : `${j.da} ${j.ti}`;
        const apiDateTime = parse(apiDateTimeString, 'dd.MM.yyyy HH:mm', new Date());

        const apiUtcTime = zonedTimeToUtc(apiDateTime, VIENNA_TZ);
        const localTime = new Date();

        const timeDifferenceMinutes = differenceInMinutes(localTime, apiUtcTime, { roundingMethod: 'round' });

        return { ...j, diff: timeDifferenceMinutes }
      })
      .sort((a, b) => b.diff - a.diff)
      .map(a => ({ ...a, diff: a.diff }))
      .slice(0, 8)
  })
}

export const defaultHandler = async (event, context) => {
  let responseBody = ''
  let responseCode = 0

  const [from, to] = event?.queryStringParameters?.route.split('-')

  try {
    const processedResponse = await getProcessedResponse(from, to)
    responseBody = JSON.stringify(processedResponse)
    responseCode = 200
  } catch (e) {
    responseBody = JSON.stringify({ error: e })
    responseCode = 404
  }

  const response = {
    statusCode: responseCode,
    body: responseBody
  };

  return response;
};

// console.log(await defaultHandler({ queryStringParameters: { route: 'westbahnhof-rodaun' }}))
// retrieveStationId('wien Westbahnhof')