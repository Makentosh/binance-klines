import axios from 'axios';
import fs from 'fs';
import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';

dayjs.extend(advancedFormat);

import { getKlinesFromTable, createTable, writeKlineToTable, checkIfTableExist } from './sqlHelpers';

const timeFormat = 'YYYY-MM-DD HH:mm:ss';

const baseUrl = 'https://api.binance.com/api/v3/klines';
const interval = '1m';
const batchSize = 1000;


const now = Date.now();
const yearsCount = 3;
const startTime = now - yearsCount * 365 * 24 * 60 * 60 * 1000;

let nextStart = Number(dayjs(startTime).startOf('day').format('x'));
let requestCount = 0;


const retrieveKlines = async (symbol) => {
    console.log(`START getKlines-${symbol}`)

    // let klinesFileName = `klines_data_${symbol}.json`;


    // let hasFile = fs.existsSync(klinesFileName);
    // console.log(hasFile, 'has file ???')
    let tableExist = await checkIfTableExist(symbol);

    let currKlines = [];

    if (tableExist) {
        // let currfile = fs.readFileSync(klinesFileName, 'utf8');
        currKlines = await getKlinesFromTable(symbol);

        if (currKlines.length > 0) {
            let lastKlines = currKlines[currKlines.length - 1];

            console.log(dayjs(lastKlines[6] + 1).format(timeFormat), 'start with this last klines')

            nextStart = lastKlines[6] + 1 //set startTime to time last klines

        } else {
            console.log(`Table ${symbol} is empty ?`)
        }
    } else {
        await createTable(symbol)
        console.log(`Table not found, create table ${symbol}`)
    }


    let endTime = Date.now();

    while (endTime > nextStart) {
        endTime = Date.now();

        requestCount++
        // Define the parameters for the request

        const params = {
            symbol,
            interval,
            startTime: nextStart,
            endTime: endTime,
            limit: batchSize,
        };

        // console.table({
        //     initialParams: 'initialParams',
        //     startTime: dayjs(nextStart).format(timeFormat),
        //     symbol,
        //     interval,
        //     endTime: dayjs(endTime).format(timeFormat),
        //     limit: batchSize,
        // })


        try {
            const response = await axios.get(baseUrl, { params });

            console.log(response.data.length, 'length response klines')

            if (!response?.data.length) break;

            let lastTimeKline = response?.data[response?.data?.length - 1][6] + 1;

            await writeKlineToTable(symbol, response.data)

            console.table({
                symbol,
                startTime: dayjs(nextStart).format(timeFormat),
                nextTimeWillBe: dayjs(lastTimeKline).format(timeFormat),
                endTime: dayjs(endTime).format(timeFormat),
            })


            nextStart = lastTimeKline; //lst kline open time from request


        } catch (error) {
            console.error('Error while making the request:', error);
            break;
        }
    }


    console.log(requestCount, 'Count requests')

    requestCount = 0;
    nextStart = Number(dayjs(startTime).startOf('day').format('x'));

    console.log('Data retrieval complete');
}


export const fetchTradingPairs = async () => {
    const baseUrl = 'https://api.binance.com/api/v3/exchangeInfo';

    let tradingPairs = [];

    try {
        const response = await axios.get(baseUrl);
        const exchangeInfo = response.data;

        const pairsWithUSDT = exchangeInfo.symbols
            .filter(symbol => symbol.symbol.endsWith('USDT'))
            .map(symbol => symbol.symbol);


        tradingPairs.push(...pairsWithUSDT)

        fs.writeFileSync('trading-paris.json', JSON.stringify(tradingPairs) + '\n')

        for (let i = 0; i < tradingPairs.length; i++) {
            await retrieveKlines(tradingPairs[i])
        }


        console.log('Trading pairs information retrieved and stored.');
    } catch (error) {
        console.error('Error while fetching trading pairs:', error);
    }

}

