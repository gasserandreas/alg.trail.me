import { TileSet } from 'node-hgt';

/**
 * Calculate elevation data for coordinates
 * @param {*} coordinates 
 * @returns
 */
function getElevation(coordinates) {
  const path = `${__dirname}/elevation-data`;
  const tileset = new TileSet(path);

  return Promise.all(
    coordinates.map(
      (coordinate) => new Promise((resolve) => {
        tileset.getElevation(coordinate, function(err, elevation) {
          if (err) {
            resolve(null);
          } else {
            resolve(elevation);
          }
        });
      })
    )
  );
}

/**
 * Enhance coordinates with elevation data
 * @param {*} coordinates 
 * @returns 
 */
async function main(coordinates) {
  const elevationData = await getElevation(coordinates);
  return coordinates.map((coordinate, i) => ({
    ...coordinate,
    elevation: elevationData[i] || '',
  }));
}

const EXAMPLE_COORDINATES = [
  {
    lat: 47.4984356202,
    lng: 8.0340416171,
  },
  {
    lat: 47.4613318685,
    lng: 8.0527532101,
  },
  {
    lat: 47.4615602754,
    lng: 8.0531485006,
  }
];

console.log(EXAMPLE_COORDINATES);

main(EXAMPLE_COORDINATES)
  .then((coordinates) => {
    console.log(coordinates);
  })
  .catch((error) => {
    console.log(error);
  });

