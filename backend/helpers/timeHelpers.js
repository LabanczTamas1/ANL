function timeToMinutes(time) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function getAvailableTimes(start, end, increment, offset) {
  const result = [];
  for (let i = start; i < end; i += increment) {
    result.push(i + offset);
  }
  return result;
}

function getUnavailableTimes(availableStart, availableEnd) {
  const allAvailableHours = getAvailableTimes(0, 1440, 60, 0);
  const unavailableHours = allAvailableHours.filter((hour) => {
    return hour < availableStart || hour >= availableEnd;
  });
  return unavailableHours;
}

function convertMinutesToTime(minutes) {
  const totalMinutes = parseInt(minutes, 10);
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  const ampm = hours >= 12 ? "PM" : "AM";
  const displayHour = hours % 12 === 0 ? 12 : hours % 12;
  const displayMin = mins.toString().padStart(2, "0");
  return `${displayHour}:${displayMin} ${ampm}`;
}

function extractUTCOffset(utcString) {
  const match = utcString.match(/[-+]?\d+/);
  return match ? parseInt(match[0], 10) : null;
}

function getCountedTimesFromUTC(array, UTCOffset) {
  const newArray = array
    .map((num) => num + UTCOffset * 60 - 1440)
    .filter((num) => num >= 0 && num <= 1440);
  console.log("functions new Array: ", newArray);
  return newArray;
}

function utcToMinutes(gmtString) {
  const match = gmtString.match(/UTC([+-])(\d+)/);
  if (!match) return null;
  const sign = match[1] === "+" ? -1 : 1;
  const hours = parseInt(match[2], 10);
  return sign * hours * 60;
}

module.exports = {
  timeToMinutes,
  getAvailableTimes,
  getUnavailableTimes,
  convertMinutesToTime,
  extractUTCOffset,
  getCountedTimesFromUTC,
  utcToMinutes,
};
