import moment from 'moment';

import { loadData } from './fileUtils';
import { getDistanceForPoint } from './coordinateUtils';

// average cycling speed in m per hour
const AVERAGE_CYCLING_SPEED = 25000;

// average vertical meter in m per hour
const AVERAGE_VERTICAL_METER_SPEED = 550

function getTimeMeta(geoMeta, coordinates, options = {}) {
  const { averageSpeed, averageVerticalMeterSpeed } = options;

  let approxTime = null;
  let actualTime = null;

  /**
   * calculate approx time for route
   */
  if (geoMeta) {
    const { accent, decent, distance } = geoMeta;

    // calculate horizontal time in hours
    const horizontalTime = distance / averageSpeed;

    // calculate vertical meters time in hours
    const verticalMeters = accent + decent;
    const verticalTime = verticalMeters / averageVerticalMeterSpeed;

    // identify big / small time
    let smallTime; 
    let bigTime;
    if (horizontalTime < verticalTime) {
      smallTime = horizontalTime;
      bigTime = verticalTime;
    } else {
      bigTime = horizontalTime;
      smallTime = verticalTime;
    }

    // calculate time
    /**
     * we use following calculation found here:
     * https://www.rotwild.de/community-news/news-blog/single/news/tipps-zum-planen-von-mountainbiketouren/
     */
    const duration = moment.duration(bigTime + (smallTime / 2), 'hours');
    approxTime = duration.humanize();
  }

  /**
   * calculate actual time between first and last
   */
  if (coordinates.length >= 2) {
    const first = moment(coordinates[0].time);
    const last = moment(coordinates[coordinates.length - 1].time);

    const duration = moment.duration(last.diff(first));
    actualTime = duration.humanize();
  }

  return {
    approxTime,
    actualTime,
  };
}

function getGeoMeta(coordinates = []) {
  let accent = null;
  let accentDistance = null;
  let decent = null;
  let decentDistance = null;
  let highest = null;
  let lowest = null;
  let distance = null;

  if (coordinates && coordinates.length > 1) {
    // init start value
    accent = 0;
    accentDistance = 0;
    decent = 0;
    decentDistance = 0;
    highest = 0;
    lowest = 0;
    distance = 0;

    coordinates.forEach((current, i) => {
      const nextI = i + 1;
      const next = nextI < coordinates.length  ? coordinates[nextI] : null;

      // only proceed valid coordinates
      if (!next) {
        return;
      }

      const { elevation,  } = current;
      const { elevation: nextElevation } = next;

      const elevationDiff = elevation - nextElevation;

      // handle distance / time
      const pointDistance = getDistanceForPoint(current, next);
      distance += pointDistance;

      // handle accent / decent
      if (elevationDiff > 0) {
        decent += elevationDiff;
        decentDistance += pointDistance;
      } else {
        accent += (-1 * elevationDiff);
        accentDistance += pointDistance;
      }

      // handle highest / lowest point
      if (elevation > highest) {
        highest = elevation;
      }

      if (lowest === 0 || elevation < lowest) {
        lowest = elevation;
      }
    })
  }

  return {
    accent,
    accentDistance,
    decent,
    decentDistance,
    highest,
    lowest,
    distance,
  };
}

async function main() {
  const data = await loadData();
  const geoMeta = getGeoMeta(data);

  const options = {
    averageSpeed: AVERAGE_CYCLING_SPEED,
    averageVerticalMeterSpeed: AVERAGE_VERTICAL_METER_SPEED,
  };
  const timeMeta = getTimeMeta(geoMeta, data, options);

  const meta = {
    ...geoMeta,
    ...timeMeta,
  };

  console.log(meta);
}

main();
