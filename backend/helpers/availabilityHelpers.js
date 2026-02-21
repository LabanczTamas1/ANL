const { getRedisClient } = require("../config/database");

async function checkCustomAvailability(
  date,
  standardAvailabilityArr,
  openClosedFlag
) {
  const redisClient = getRedisClient();
  console.log("Checking custom availability on this day", date);
  console.log(openClosedFlag);
  console.log(standardAvailabilityArr);

  let allAvailableTimes = [];

  if (openClosedFlag === "both") {
    let addedTimes = await redisClient.zRange(`AddedTimes:${date}`, 0, -1);
    addedTimes = addedTimes.map((item) => Number(item));
    console.log(`Added times: ${date}`, addedTimes);

    let deletedTimes = await redisClient.zRange(`DeletedTimes:${date}`, 0, -1);
    deletedTimes = deletedTimes.map((item) => Number(item));

    console.log("Added Times: ", addedTimes);

    let allSet = new Set([...standardAvailabilityArr, ...addedTimes]);
    console.log("as", allSet);
    allAvailableTimes = [...allSet].filter(
      (item) => !deletedTimes.includes(item)
    );

    console.log("Merged Array: ", allAvailableTimes);
  }

  return allAvailableTimes;
}

module.exports = {
  checkCustomAvailability,
};
