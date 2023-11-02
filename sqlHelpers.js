import fs from 'fs';
import db from './db';

const reformatFromDbTable = (klines) => {
    const reformattedData = [];

    for (const row of klines) {
        let formatedRow = Object.values(row);

        let nextRow = formatedRow.slice(1, formatedRow.length)

        reformattedData.push(nextRow);
    }

    return reformattedData;
}

export const checkIfTableExist = async (symbolsPairsName) => {
    const tableName = symbolsPairsName;  // Replace with the table name you want to check

    // SQL query to check if the table exists
    const checkTableQuery = `
      SELECT 1
      FROM information_schema.tables
      WHERE table_name = ?
      LIMIT 1
    `;


    return new Promise((resolve, reject) => {

        db.query(checkTableQuery, [tableName], (err, results) => {
            if (err) {
                console.error('Error checking table: ' + err.message);
                reject(err)
            } else {
                if (results.length > 0) {
                    resolve(true)
                    console.log(`Table '${tableName}' exists.`);
                } else {
                    resolve(false)
                }
            }

        })
    })
}


export const getKlinesFromTable = async (tableName) => {
    let klines = [];

    const selectDataQuery = `SELECT * FROM ${tableName}`;


    return new Promise((resolve, reject) => {
        db.query(selectDataQuery, (err, results) => {
            if (err) {
                reject(err)
                fs.writeFileSync('errors-write-klines.json', JSON.stringify(err.message) + '\n')
                console.error('Error retrieving data: ' + err.message);
            } else {
                console.log('Data from table retrieved successfully:');
                klines = reformatFromDbTable(results);

                resolve(klines)
            }

        });
    })


}


export const createTable = async (symbolsPairsName) => {
    const createTableQuery = `
    CREATE TABLE ${symbolsPairsName} (
        id INT AUTO_INCREMENT PRIMARY KEY,
        openTime BIGINT UNIQUE,
        openPrice VARCHAR(255),
        highPrice VARCHAR(255),
        lowPrice VARCHAR(255),
        closePrice VARCHAR(255),
        volume VARCHAR(255),
        closeTime BIGINT UNIQUE,
        quoteAssetVolume VARCHAR(255),
        numberOfTrades BIGINT,
        takerBuyAssetVolume VARCHAR(255),
        takerBuyQuoteAssetVolume VARCHAR(255),
        verifyUnique BIGINT AS (openTime + closeTime) UNIQUE
    )
`;

    return new Promise((resolve, reject) => {
        db.query(createTableQuery, (err, results) => {
            if (err) {
                reject(false)
                console.error(`Error creating table - ${symbolsPairsName}: ` + err.message);
            } else {
                resolve(true)
                console.log(`Table - ${symbolsPairsName} - created successfully`);
            }
        });

        console.log(`Table '${symbolsPairsName}' does not exist.`);
    })

}


export const writeKlineToTable = async (tablename, klines) => {
    console.log('start write klines to base')
    const tableName = tablename;


    // SQL query to insert data into the table
    const insertDataQuery = `
        INSERT INTO ${tableName} 
            (openTime, openPrice, highPrice, lowPrice, closePrice, volume, closeTime, 
            quoteAssetVolume, numberOfTrades, takerBuyAssetVolume, takerBuyQuoteAssetVolume) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`;

    try {
        // Use Promise.all to wait for all insert operations to complete
        await Promise.all(klines.map(async (rawData) => {
            const flatData = rawData;
            return new Promise((resolve, reject) => {
                db.query(insertDataQuery, flatData, (err) => {
                    if (err) {
                        console.error('Error inserting data: ' + err.message);
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            });
        }));

        console.log('end write klines to base');
    } catch (error) {
        console.error('Error:', error);
    }
}