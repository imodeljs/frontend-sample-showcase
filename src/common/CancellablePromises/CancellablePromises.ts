/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

export function runWithCancel(fn: Function, ...args: any[]) {
  const gen = fn(...args);
  let cancelled: boolean = false;
  let cancel: Function = () => { };

  const promise = new Promise((resolve, reject) => {
    // define cancel function to return it from our fn
    cancel = () => {
      cancelled = true;
      reject({ reason: "cancelled" });
    };

    onFulfilled();

    function onFulfilled(res?: any) {
      if (!cancelled) {
        let result;
        try {
          result = gen.next(res);
        } catch (e) {
          return reject(e);
        }
        next(result);
        return null;
      }
    }

    function onRejected(err: any) {
      let result: any;
      try {
        result = gen.throw(err);
      } catch (e) {
        return reject(e);
      }
      next(result);
    }

    function next(result: any) {
      if (result.done) {
        return resolve(result.value);
      }
      // we assume we always receive promises, so no type checks
      return result.value.then(onFulfilled, onRejected);
    }
  });

  return { promise, cancel };
}
