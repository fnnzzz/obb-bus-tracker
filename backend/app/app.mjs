import { differenceInMinutes, parse } from "date-fns";
import { formatInTimeZone, zonedTimeToUtc } from "date-fns-tz";
import oebb from "oebb-api";

const retrieveStationId = (term) => {
  var options = oebb.getStationSearchOptions();
  options.S = term;
  oebb.searchStations(options).then(console.log);
};

const stationsHashMap = {
  rodaun_tram: "001192303",
  rodaun_bus: "001392389",
  kaiser: "000923019",
  liesing: "001192301",
  hietzing: "001391367",
  spitalskirche: "000317092",
  westbahnhof: "001291501",
  liesing_bhf: "001192301",
  hauptbahnhof: "001290401",
  prater_bhf: "001290201",
};

const VIENNA_TZ = "Europe/Vienna";

var options = oebb.getStationBoardDataOptions();
options.time = formatInTimeZone(new Date(), VIENNA_TZ, "HH:mm");

const getProcessedResponse = async (from, to, count = 5) => {
  const fromId = stationsHashMap[from];
  const toId = stationsHashMap[to];

  if (!fromId || !toId) throw "Incorrect `from` or `to`";

  options.evaId = fromId;
  options.dirInput = toId;

  return oebb.getStationBoardData(options).then((obbResponse) => {
    return obbResponse.journey
      .map((j) => {
        // `rt` exists if is delayed
        const apiDateTimeString = j.rt
          ? `${j.rt.dld} ${j.rt.dlt}`
          : `${j.da} ${j.ti}`;
        const apiDateTime = parse(
          apiDateTimeString,
          "dd.MM.yyyy HH:mm",
          new Date()
        );

        const apiUtcTime = zonedTimeToUtc(apiDateTime, VIENNA_TZ);
        const localTime = new Date();

        const timeDifferenceMinutes = differenceInMinutes(
          localTime,
          apiUtcTime,
          { roundingMethod: "round" }
        );

        return { ...j, diff: timeDifferenceMinutes };
      })
      .sort((a, b) => b.diff - a.diff)
      .map((a) => ({ ...a, diff: a.diff }))
      .slice(0, count);
  });
};

export const defaultHandler = async (event, context) => {
  let responseBody = "";
  let responseCode = 0;

  const [from, to] = event?.queryStringParameters?.route.split("-");
  const count = parseInt(event?.queryStringParameters?.count) || 5;

  try {
    const processedResponse = await getProcessedResponse(from, to, count);
    responseBody = JSON.stringify(processedResponse);
    responseCode = 200;
  } catch (e) {
    responseBody = JSON.stringify({ error: e });
    responseCode = 404;
  }

  const response = {
    statusCode: responseCode,
    body: responseBody,
  };

  return response;
};

// console.log(
//   await defaultHandler({
//     queryStringParameters: { route: "liesingBhf-meidlingBhf" },
//   })
// );
// retrieveStationId("Praterstern");
