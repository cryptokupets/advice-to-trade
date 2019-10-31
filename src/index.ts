import { Transform } from "stream";

export interface IAdvice {
  time: string;
  sign: number;
  price: number;
}

export interface ITrade {
  time: string;
  quantity: number;
  amount: number;
}

export function streamAdviceToTrade(initialBalance: number): Transform {
  let currencyAmount = initialBalance;
  let assetAmount = 0;

  const ts = new Transform({
    transform: async (chunk, encoding, callback) => {
      const { time, sign, price } = JSON.parse(chunk) as IAdvice;

      const quantity = sign === 1 ? currencyAmount / price : -assetAmount;

      if (quantity) {
        const amount = sign === 1 ? currencyAmount : -assetAmount * price;

        assetAmount += quantity;
        currencyAmount -= amount;

        const trade: ITrade = {
          time,
          quantity,
          amount
        };

        ts.push(JSON.stringify(trade));
      }
      callback();
    }
  });

  return ts;
}
