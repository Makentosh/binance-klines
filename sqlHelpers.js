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


export const writeklineToTable = async (tablename, klines) => {
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

// 2023-10-25 00:09:22 Error inserting data: ER_DUP_ENTRY: Duplicate entry '1679697660000' for key 'openTime'
// 2023-10-25 00:09:22 Error inserting data: ER_DUP_ENTRY: Duplicate entry '1679697720000' for key 'openTime'
// 2023-10-25 00:09:22 Error inserting data: ER_DUP_ENTRY: Duplicate entry '1679697780000' for key 'openTime'
// 2023-10-25 00:09:22 Error inserting data: ER_DUP_ENTRY: Duplicate entry '1679697840000' for key 'openTime'
// 2023-10-25 00:09:22 Error inserting data: ER_DUP_ENTRY: Duplicate entry '1679697900000' for key 'openTime'
// 2023-10-25 00:09:22 Error inserting data: ER_DUP_ENTRY: Duplicate entry '1679697960000' for key 'openTime'
// 2023-10-25 00:09:22 Error inserting data: ER_DUP_ENTRY: Duplicate entry '1679698020000' for key 'openTime'
// 2023-10-25 00:09:22 Error inserting data: ER_DUP_ENTRY: Duplicate entry '1679698080000' for key 'openTime'
// 2023-10-25 00:09:22 Error inserting data: ER_DUP_ENTRY: Duplicate entry '1679698140000' for key 'openTime'
// 2023-10-25 00:09:22 Error inserting data: ER_DUP_ENTRY: Duplicate entry '1679698200000' for key 'openTime'
// 2023-10-25 00:09:22 Error inserting data: ER_DUP_ENTRY: Duplicate entry '1679698260000' for key 'openTime'
// 2023-10-25 00:09:22 Error inserting data: ER_DUP_ENTRY: Duplicate entry '1679698320000' for key 'openTime'
// 2023-10-25 00:09:22 Error inserting data: ER_DUP_ENTRY: Duplicate entry '1679698380000' for key 'openTime'
// 2023-10-25 00:09:22 Error inserting data: ER_DUP_ENTRY: Duplicate entry '1679698440000' for key 'openTime'
// 2023-10-25 00:09:22 Error inserting data: ER_DUP_ENTRY: Duplicate entry '1679698500000' for key 'openTime'
// 2023-10-25 00:09:22 Error inserting data: ER_DUP_ENTRY: Duplicate entry '1679698560000' for key 'openTime'
// 2023-10-25 00:09:22 Error inserting data: ER_DUP_ENTRY: Duplicate entry '1679698620000' for key 'openTime'
// 2023-10-25 00:09:22 Error inserting data: ER_DUP_ENTRY: Duplicate entry '1679698680000' for key 'openTime'
// 2023-10-25 00:09:22 Error inserting data: ER_DUP_ENTRY: Duplicate entry '1679698740000' for key 'openTime'
// 2023-10-25 00:09:22 Error inserting data: ER_DUP_ENTRY: Duplicate entry '1679698800000' for key 'openTime'
// 2023-10-25 00:09:22 Error inserting data: ER_DUP_ENTRY: Duplicate entry '1679698860000' for key 'openTime'
// 2023-10-25 00:09:22 Error inserting data: ER_DUP_ENTRY: Duplicate entry '1679698920000' for key 'openTime'
// 2023-10-25 00:09:22 Error inserting data: ER_DUP_ENTRY: Duplicate entry '1679698980000' for key 'openTime'
// 2023-10-25 00:09:22 Error inserting data: ER_DUP_ENTRY: Duplicate entry '1679699040000' for key 'openTime'
// 2023-10-25 00:09:22 Error inserting data: ER_DUP_ENTRY: Duplicate entry '1679699100000' for key 'openTime'
// 2023-10-25 00:09:22 Error inserting data: ER_DUP_ENTRY: Duplicate entry '1679699160000' for key 'openTime'
// 2023-10-25 00:09:22 Error inserting data: ER_DUP_ENTRY: Duplicate entry '1679699220000' for key 'openTime'
// 2023-10-25 00:09:22 Error inserting data: ER_DUP_ENTRY: Duplicate entry '1679699280000' for key 'openTime'
// 2023-10-25 00:09:22 Error inserting data: ER_DUP_ENTRY: Duplicate entry '1679699340000' for key 'openTime'
// 2023-10-25 00:09:22 Error inserting data: ER_DUP_ENTRY: Duplicate entry '1679699400000' for key 'openTime'
// 2023-10-25 00:09:22 Error inserting data: ER_DUP_ENTRY: Duplicate entry '1679699460000' for key 'openTime'
// 2023-10-25 00:09:22 Error inserting data: ER_DUP_ENTRY: Duplicate entry '1679699520000' for key 'openTime'
// 2023-10-25 00:09:22 Error inserting data: ER_DUP_ENTRY: Duplicate entry '1679699580000' for key 'openTime'
// 2023-10-25 00:09:22 Error inserting data: ER_DUP_ENTRY: Duplicate entry '1679699640000' for key 'openTime'
// 2023-10-25 00:09:22 Error inserting data: ER_DUP_ENTRY: Duplicate entry '1679699700000' for key 'openTime'
// 2023-10-25 00:09:22 Error inserting data: ER_DUP_ENTRY: Duplicate entry '1679699760000' for key 'openTime'
// 2023-10-25 00:09:22 Error inserting data: ER_DUP_ENTRY: Duplicate entry '1679699820000' for key 'openTime'
// 2023-10-25 00:09:22 Error inserting data: ER_DUP_ENTRY: Duplicate entry '1679699880000' for key 'openTime'
// 2023-10-25 00:09:22 Error inserting data: ER_DUP_ENTRY: Duplicate entry '1679699940000' for key 'openTime'
// 2023-10-25 00:09:22 Error inserting data: ER_DUP_ENTRY: Duplicate entry '1679700000000' for key 'openTime'
// 2023-10-25 00:09:22 Error inserting data: ER_DUP_ENTRY: Duplicate entry '1679700060000' for key 'openTime'
// 2023-10-25 00:09:22 Error inserting data: ER_DUP_ENTRY: Duplicate entry '1679700120000' for key 'openTime'
// 2023-10-25 00:09:22 Error inserting data: ER_DUP_ENTRY: Duplicate entry '1679700180000' for key 'openTime'
// 2023-10-25 00:09:22 Error inserting data: ER_DUP_ENTRY: Duplicate entry '1679700240000' for key 'openTime'
// 2023-10-25 00:09:22 Error inserting data: ER_DUP_ENTRY: Duplicate entry '1679700300000' for key 'openTime'
// 2023-10-25 00:09:22 Error inserting data: ER_DUP_ENTRY: Duplicate entry '1679700360000' for key 'openTime'
// 2023-10-25 00:09:22 Error inserting data: ER_DUP_ENTRY: Duplicate entry '1679700420000' for key 'openTime'
// 2023-10-25 00:09:22 Error inserting data: ER_DUP_ENTRY: Duplicate entry '1679700480000' for key 'openTime'
// 2023-10-25 00:09:22 Error inserting data: ER_DUP_ENTRY: Duplicate entry '1679700540000' for key 'openTime'
// 2023-10-25 00:09:22 Error inserting data: ER_DUP_ENTRY: Duplicate entry '1679700600000' for key 'openTime'
// 2023-10-25 00:09:22 Error inserting data: ER_DUP_ENTRY: Duplicate entry '1679700660000' for key 'openTime'
// 2023-10-25 00:09:22 Error inserting data: ER_DUP_ENTRY: Duplicate entry '1679700720000' for key 'openTime'
// 2023-10-25 00:09:22 Error inserting data: ER_DUP_ENTRY: Duplicate entry '1679700780000' for key 'openTime'
// 2023-10-25 00:09:22 Error inserting data: ER_DUP_ENTRY: Duplicate entry '1679700840000' for key 'openTime'
// 2023-10-25 00:09:22 Error inserting data: ER_DUP_ENTRY: Duplicate entry '1679700900000' for key 'openTime'
// 2023-10-25 00:09:22 Error inserting data: ER_DUP_ENTRY: Duplicate entry '1679700960000' for key 'openTime'
// 2023-10-25 00:09:22 Error inserting data: ER_DUP_ENTRY: Duplicate entry '1679701020000' for key 'openTime'
// 2023-10-25 00:09:22 Error inserting data: ER_DUP_ENTRY: Duplicate entry '1679701080000' for key 'openTime'
// 2023-10-25 00:09:22 Error inserting data: ER_DUP_ENTRY: Duplicate entry '1679701140000' for key 'openTime'
// 2023-10-25 00:09:22 Error inserting data: ER_DUP_ENTRY: Duplicate entry '1679701200000' for key 'openTime'
// 2023-10-25 00:09:22 Error inserting data: ER_DUP_ENTRY: Duplicate entry '1679701260000' for key 'openTime'
// 2023-10-25 00:09:22 Error inserting data: ER_DUP_ENTRY: Duplicate entry '1679701320000' for key 'openTime'
// 2023-10-25 00:09:22 Error inserting data: ER_DUP_ENTRY: Duplicate entry '1679701380000' for key 'openTime'
// 2023-10-25 00:09:22 Error inserting data: ER_DUP_ENTRY: Duplicate entry '1679701440000' for key 'openTime'
// 2023-10-25 00:09:22 Error inserting data: ER_DUP_ENTRY: Duplicate entry '1679701500000' for key 'openTime'
// 2023-10-25 00:09:22 Error inserting data: ER_DUP_ENTRY: Duplicate entry '1679701560000' for key 'openTime'
// 2023-10-25 00:09:22 Error inserting data: ER_DUP_ENTRY: Duplicate entry '1679701620000' for key 'openTime'
// 2023-10-25 00:09:22 Error inserting data: ER_DUP_ENTRY: Duplicate entry '1679701680000' for key 'openTime'
// 2023-10-25 00:09:22 Error inserting data: ER_DUP_ENTRY: Duplicate entry '1679701740000' for key 'openTime'
// 2023-10-25 00:09:22 Error inserting data: ER_DUP_ENTRY: Duplicate entry '1679701800000' for key 'openTime'
// 2023-10-25 00:09:22 Error inserting data: ER_DUP_ENTRY: Duplicate entry '1679701860000' for key 'openTime'
// 2023-10-25 00:09:22 Error inserting data: ER_DUP_ENTRY: Duplicate entry '1679701920000' for key 'openTime'
// 2023-10-25 00:09:22 Error inserting data: ER_DUP_ENTRY: Duplicate entry '1679701980000' for key 'openTime'
// 2023-10-25 00:09:22 Error inserting data: ER_DUP_ENTRY: Duplicate entry '1679702040000' for key 'openTime'
// 2023-10-25 00:09:22 Error inserting data: ER_DUP_ENTRY: Duplicate entry '1679702100000' for key 'openTime'
// 2023-10-25 00:09:22 Error inserting data: ER_DUP_ENTRY: Duplicate entry '1679702160000' for key 'openTime'
// 2023-10-25 00:09:22 Error inserting data: ER_DUP_ENTRY: Duplicate entry '1679702220000' for key 'openTime'
// 2023-10-25 00:09:22 Error inserting data: ER_DUP_ENTRY: Duplicate entry '1679702280000' for key 'openTime'
// 2023-10-25 00:09:22 Error inserting data: ER_DUP_ENTRY: Duplicate entry '1679702340000' for key 'openTime'