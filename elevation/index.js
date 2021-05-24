import { TileSet } from 'node-hgt';
import fs from 'fs';
import dotenv from 'dotenv';

import S3Downloader from './S3Downloader';

// load .env vars
dotenv.config();

const {
  AWS_DEFAULT_REGION,
  AWS_DEFAULT_ACCESS_KEY_ID,
  AWS_DEFAULT_SECRET_ACCESS_KEY,
} = process.env;

/**
 * Calculate elevation data for coordinates
 * @param {*} coordinates 
 * @returns
 */
function getElevation(coordinates) {
  // const path = `${__dirname}/elevation-data`;
  const path = `${__dirname}/temp`;

  if (!fs.existsSync(path)) {
    fs.mkdirSync(path);
  }

  const awsConfig = {
    accessKeyId: AWS_DEFAULT_ACCESS_KEY_ID,
    secretAccessKey: AWS_DEFAULT_SECRET_ACCESS_KEY,
    region: AWS_DEFAULT_REGION,
  };
  const downloaderOptions = {
    awsConfig,
  };
  const downloader = new S3Downloader(path, '151434533289-calc-elevation-assets-bucket', downloaderOptions);

  const options = {
    downloader,
  };
  const tileset = new TileSet(path, options);

  return Promise.all(
    coordinates.map(
      (coordinate) => new Promise((resolve) => {
        tileset.getElevation(coordinate, function(err, elevation) {
          if (err) {
            console.log({ err });
            resolve(null);
          } else {
            console.log(elevation);
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

