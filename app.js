import express from 'express';
import cors from 'cors';
import db from './db';
import fs from 'fs';
// import axios from 'axios';
import { fetchTradingPairs } from './klinesFn';
// import dayjs from 'dayjs';
// import advancedFormat from 'dayjs/plugin/advancedFormat';

// dayjs.extend(advancedFormat);


const app = express();

const PORT = 3000;


app.use(cors({
    origin: "*"
}));


// Connect to the MySQL databas
db.connect((err) => {
    if (err) {
        console.error('Database connection failed: ' + err.stack);
        return;
    }
    console.log('Connected to the database');
});


app.get('/', (req, res) => {
    console.log('Hello express again')
    res.send('Hello World')
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);

    // let nextKlineOpenTime = 0;

    // for(let i  = 0; i < [].length; i++) {
    //     // kline[i][1] + 60000
    // }

    fetchTradingPairs()
});