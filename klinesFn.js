import axios from 'axios';
import fs from 'fs';
import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';

dayjs.extend(advancedFormat);

import { getKlinesFromTable, createTable, writeklineToTable, checkIfTableExist } from './sqlHelpers';


const baseUrl = 'https://api.binance.com/api/v3/klines';
const interval = '1m';

const now = Date.now();
const YEARS_COUNT = 3;
// const start_time = now - YEARS_COUNT * 365 * 24 * 60 * 60 * 1000; //3 year
const start_time = now - YEARS_COUNT * 365 * 24 * 60 * 60 * 1000;

let next_start = Number(dayjs(start_time).startOf('day').format('x'));

const batch_size = 1000;

let requestCount = 0;

async function retrieveKlines(symbol) {
    console.log(`START retrieveKlines-${symbol}`)

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

            console.log(dayjs(lastKlines[6] + 1).format('YYYY-MM-DD, HH:mm:ss'), 'start with this last klines')

            next_start = lastKlines[6] + 1 //set start_time to time last klines

        } else {
            console.log(`Table ${symbol} is empty ?`)
        }
    } else {
        await createTable(symbol)
        console.log(`Table not found, create table ${symbol}`)
    }


    let end_time = Date.now();

    while (end_time > next_start) {
        end_time = Date.now();

        requestCount++
        // Define the parameters for the request

        const params = {
            symbol,
            interval,
            startTime: next_start,
            endTime: end_time,
            limit: batch_size,
        };

        // console.table({
        //     initialParams: 'initialParams',
        //     startTime: dayjs(next_start).format('YYYY-MM-DD HH:mm:ss'),
        //     symbol,
        //     interval,
        //     endTime: dayjs(end_time).format('YYYY-MM-DD HH:mm:ss'),
        //     limit: batch_size,
        // })


        try {
            const response = await axios.get(baseUrl, { params });

            console.log(response.data.length, 'length response klines')

            if (!response?.data.length) break;

            let lastTimeKline = response?.data[response?.data?.length - 1][6] + 1;

            await writeklineToTable(symbol, response.data)

            console.table({
                symbol,
                startTime: dayjs(next_start).format('YYYY-MM-DD HH:mm:ss'),
                nextTimeWillBe: dayjs(lastTimeKline).format('YYYY-MM-DD HH:mm:ss'),
                endTime: dayjs(end_time).format('YYYY-MM-DD HH:mm:ss'),
            })


            next_start = lastTimeKline; //lst kline open time from request


        } catch (error) {
            console.error('Error while making the request:', error);
            break;
        }
    }


    console.log(requestCount, 'Count requests')

    requestCount = 0;
    next_start = Number(dayjs(start_time).startOf('day').format('x'));

    console.log('Data retrieval complete');
}


export async function fetchTradingPairs() {
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

