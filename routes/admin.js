const  path = require('path');
const express = require('express');
const rootDir = require('../util/path');
const router = express.Router();
const fetch = require('node-fetch');
const ExcelJS = require('exceljs');
// Requiring the module
const reader = require('xlsx')
// Reading our test file
const file = reader.readFile('./test.xlsx')

const pushToArr = (key, arr, send, tic) => {
    //console.log(send)
        let num = key[0] + key[1] + key[2] + key[3]
        //CHANGE IF WANT DATA BEFORE 2010
        if (num > 2010) {
            let obj = {'date': key, 'close': send[key]['4. close'], 'high': send[key]['2. high'], 'low': send[key]['3. low'],'ticker': tic}
            arr.push(obj)
        } else {
            return
        }
}
let workbook;
const addToWorkBook = (array) => {
    return new Promise((res, rej) => {
        let final = array.flat()
        console.log('FINAL', final.length)
        workbook = new ExcelJS.Workbook()
        let worksheet = workbook.addWorksheet('Info')
        worksheet.columns = [
                {header: 'date', key: 'date'},
                {header: 'close', key: 'close'},
                {header: 'ticker', key: 'ticker'},
                {header: 'high', key: 'high'},
                {header: 'low', key: 'low'}
        ]
        final.forEach((e, index) => {
            console.log(e)
            const rowIndex = index + 2;
            worksheet.addRow({
                ...e
            })
            if (index === final.length-1) {
                console.log('res')
                res()
            }
        })
    })
}

router.get('/home', (req, response, next) => {
    let apiKey = 'RPOBY3XSMPFJWUWF';
    let func = 'TIME_SERIES_WEEKLY'
    // let ticker = ['IBM', 'AAPL', 'TSLA', 'GME', 'AMZN'];
    let ticker = ['AAPL']
    //interval=5min
    let final = new Array;
    Promise.all(
        ticker.map((tic, ti) => {
        return fetch(`https://www.alphavantage.co/query?function=${func}&symbol=${tic}&apikey=${apiKey}`)
        .then(res => res.json())
        .then(data => {
            if (!data["Weekly Time Series"]) {throw new Error('No data')}
            let send = data["Weekly Time Series"]
            let arr = new Array;
            let keys = Object.keys(send);
            return Promise.all(
                keys.map(key => {
                    return pushToArr(key, arr, send, tic)
                })
            ).then(() => {
                if (arr.length > 0) {
                    final.push(arr)
                }
            })
            .catch(err => console.log('ERROR AT KEY'))
        }) 
        .catch(err => console.log('ERROR AT FETCH', err))
    }))
    .then(async () => {
        addToWorkBook(final).then(() => {
            console.log('final section has fired')
            workbook.xlsx.writeFile('Info.xlsx')
            return response.json({'Data': final})
        })

    })
});



exports.routes = router;

