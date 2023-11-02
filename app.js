import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import db from './db';
import { fetchTradingPairs } from './klinesFn';

const app = express();

const PORT = 3000;


app.use(cors({
  origin: '*'
}));


// Connect to the MySQL database
db.connect((err) => {
  if ( err ) {
    console.error('Database connection failed: ' + err.stack);
    return;
  }
  console.log('Connected to the database');
});


app.get('/', (req, res) => {
  console.log('Hello express again');
  res.send('Hello World');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${ PORT }`);


  //feature verify  every klines
  // let klines = [];

  // for (let i = 0; i <= klines.length; i++) {
  //     let featureStartTime = klines[i][1] + 60000;
  //     let klineNextStartTime = klines[i + 1][1];

  //     if (featureStartTime !== klineNextStartTime) {
  //         throw new Error('Bad kline', klines[i])
  //     }
  // }
    fetchTradingPairs();

});
