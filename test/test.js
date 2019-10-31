require("mocha");
const { assert } = require("chai");
const { Readable } = require("stream");
const { streamAdviceToTrade } = require("../lib/index");

describe("streamAdviceToTrade", function() {
  it("один купить, один трейд", function(done) {
    const advices = [
      {
        time: "2000-01-01T00:00:00.000Z",
        sign: 1,
        price: 10
      }
    ];

    const rs = new Readable({
      read: () => {
        rs.push(advices.length ? JSON.stringify(advices.shift()) : null);
      }
    });

    const ts = streamAdviceToTrade(70);

    rs.pipe(ts);
    let i = 0;
    ts.on("data", chunk => {
      const output = JSON.parse(chunk);
      assert.isObject(output);
      assert.hasAllKeys(output, ["time", "quantity", "amount"]);
      assert.isString(output.time);
      assert.isNumber(output.quantity);
      assert.isNumber(output.amount);
      i++;
    });

    ts.on("finish", () => {
      assert.equal(i, 1);
      done();
    });
  });

  it("купить, продать, два трейда", function(done) {
    const advices = [
      {
        time: "2000-01-01T00:00:00.000Z",
        sign: 1,
        price: 10
      },
      {
        time: "2000-01-01T00:01:00.000Z",
        sign: -1,
        price: 11
      }
    ];

    const rs = new Readable({
      read: () => {
        rs.push(advices.length ? JSON.stringify(advices.shift()) : null);
      }
    });

    const ts = streamAdviceToTrade(70);

    rs.pipe(ts);
    let i = 0;
    ts.on("data", chunk => {
      const output = JSON.parse(chunk);
      assert.isObject(output);
      assert.hasAllKeys(output, ["time", "quantity", "amount"]);
      assert.isString(output.time);
      assert.isNumber(output.quantity);
      assert.isNumber(output.amount);
      switch (i) {
        case 0:
          assert.equal(output.quantity, 7);
          assert.equal(output.amount, 70);
          break;
        case 1:
          assert.equal(output.quantity, -7);
          assert.equal(output.amount, -77);
          break;
      }
      i++;
    });

    ts.on("finish", () => {
      assert.equal(i, 2);
      done();
    });
  });

  it("два купить, один трейд", function(done) {
    const advices = [
      {
        time: "2000-01-01T00:00:00.000Z",
        sign: 1,
        price: 10
      },
      {
        time: "2000-01-01T00:01:00.000Z",
        sign: 1,
        price: 11
      }
    ];

    const rs = new Readable({
      read: () => {
        rs.push(advices.length ? JSON.stringify(advices.shift()) : null);
      }
    });

    const ts = streamAdviceToTrade(70);

    rs.pipe(ts);
    let i = 0;
    ts.on("data", chunk => {
      i++;
    });

    ts.on("finish", () => {
      assert.equal(i, 1);
      done();
    });
  });

  it("продать, купить, один трейд", function(done) {
    const advices = [
      {
        time: "2000-01-01T00:00:00.000Z",
        sign: -1,
        price: 10
      },
      {
        time: "2000-01-01T00:01:00.000Z",
        sign: 1,
        price: 11
      }
    ];

    const rs = new Readable({
      read: () => {
        rs.push(advices.length ? JSON.stringify(advices.shift()) : null);
      }
    });

    const ts = streamAdviceToTrade(70);

    rs.pipe(ts);
    let i = 0;
    ts.on("data", chunk => {
      i++;
    });

    ts.on("finish", () => {
      assert.equal(i, 1);
      done();
    });
  });
});
