const Koa = require('koa');
const https = require('https');
const http = require('http');
const querystring = require('querystring');
const fs = require('fs');

const app = new Koa();

// const host = 'testapi.blkee.com';
const host = 'localhost';
const port = 5500;

function request(ctx, method = 'POST') {
  return new Promise((resolve, reject) => {
    const type = ctx.header['content-type'];
    if (!type) {
      resolve({});
      return;
    }
    if (type.search('application/json') > -1) {
      postData = JSON.stringify(ctx.request.body);
    } else if (type.search('application/x-www-form-urlencoded') > -1) {
      postData = querystring.stringify(ctx.request.body);
    }
    const myHeaders = {
      'Content-Type': type,
      'Content-Length': Buffer.byteLength(postData),
      'User-Agent':
        'Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1 MicroMessenger/6.10.5',
    };
    const headers = { ...ctx.header, ...myHeaders };
    const options = {
      host,
      path: ctx.path,
      port,
      method,
      headers,
    };
    const req = http.request(options, res => {
      resolve(res);
    });
    req.on('error', e => {
      reject(e);
    });
    req.write(postData);
    req.end();
  });
}

app.use(async (ctx, next) => {
  const res = await request(ctx);
  const headers = res.headers;
  Object.keys(headers).forEach(key => {
    ctx.set(key, headers[key]);
  });
  ctx.status = res.statusCode;
  ctx.message = res.statusMessage;
  ctx.body = res;
});

module.exports = app;
