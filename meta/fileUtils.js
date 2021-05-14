import fs from 'fs';

/**
 * read test data as JSON object
 * @returns 
 */
export async function loadData() {
  const path = `${__dirname}/data/coordinates.json`;

  return new Promise((resolve) => {
    fs.readFile(path, (err, data) => {
      if (err) {
        resolve(null);
      } else {
        const str = data.toString();
        resolve(JSON.parse(str));
      }
    });
  });
};
