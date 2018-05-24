import {
  marbles,
} from 'rxjs-marbles/jest';
import {
  filter,
  withLatestFrom,
  debounceTime,
  switchMap,
  map,
  retry,
  catchError,
} from 'rxjs/operators';
import {
  concat,
}from 'rxjs';
import {
  getRetryTestObservable,
} from '../testUtils';

it('filter operator', marbles(m => {
  const values = {
    a: 2,
    b: 30,
    c: 22,
    d: 5,
    e: 60,
    f: 1,
  };
  const source = m.cold('  -a-b-c-d-e-f---|', values);
  const expected = m.cold('---b-c---e-----|', values);
  const actual = source.pipe(
    filter(x => x > 10),
  );
  m.expect(actual).toBeObservable(expected);
}));

it('map operator', marbles(m => {
  const source = m.cold('  -a-b-c--|');
  const expected = m.cold('-A-B-C--|');
  const actual = source.pipe(
    map(x => x.toUpperCase())
  );
  m.expect(actual).toBeObservable(expected);
}));

it('withLatestFrom operator', marbles(m => {
  const values = {
    x: ['a', 's'],
    y: ['b', 't'],
    z: ['c', 't'],
  };
  const source = m.cold('  -a---b---c--|');
  const other = m.cold('   s--t--------|');
  const expected = m.cold('-x---y---z--|', values);
  const actual = source.pipe(
    withLatestFrom(other),
  );
  m.expect(actual).toBeObservable(expected);
}));

it('debounceTime operator', marbles(m => {
  const source = m.cold('  -a-a-a-a---------|');
  const expected = m.cold('-----------a-----|');
  const actual = source.pipe(
    debounceTime(4, m.scheduler)
  );
  m.expect(actual).toBeObservable(expected);
}));

it('switchMap operator', marbles(m => {
  const source = m.cold(  '-a----b------c----|');
  const obs1 = m.cold('     -1-1-----1-|');
  const obs2 = m.cold('          2-2-2-----|');
  const obs3 = m.cold('                 3----|');
  const expected = m.cold('--1-1-2-2-2--3----|');
  const project = jest.fn().
    mockReturnValueOnce(obs1).
    mockReturnValueOnce(obs2).
    mockReturnValueOnce(obs3);
  const actual = source.pipe(
    switchMap(project),
  );
  m.expect(actual).toBeObservable(expected);
}));

it('catchError operator', marbles(m => {
  const errorMessage = 'This is an error!';
  const error = {
    name: 'Error',
    message: errorMessage,
  };
  const values = {
    x: 'Error caught!',
  };
  const source = m.cold('          --a---|', values, error);
  const recovery = m.cold('          x-|', values, error);
  const expectedUncaught = m.cold('--#', values, error);
  const expectedCaught = m.cold('  --x-|', values);


  // This observable cause an uncaught error:
  const actualUncaught = source.pipe(
    map(() => {
      throw new Error(errorMessage);
    })
  );
  m.expect(actualUncaught).toBeObservable(expectedUncaught);

  // This observable catches its error:
  const actualCaught = source.pipe(
    map(() => {
      throw new Error(errorMessage);
    }),
    catchError(() => recovery)
  );
  m.expect(actualCaught).toBeObservable(expectedCaught);
}));

it('retry operator', marbles(m => {
  const errorMessage = 'This is an error';
  const successMessage = 'Success!';

  const values = {
    x: successMessage,
  };
  const source = m.cold('   -a-|', values);
  const expected1 = m.cold('-x-|', values);
  const expected2 = m.cold('-#', values, errorMessage);


  // This observable will error on the first 2 subscriptions
  // but succeed on the third subscription onward.
  const failTwiceThenSucceed = getRetryTestObservable(
    [errorMessage, errorMessage], successMessage
  )();

  const actual1 = source.pipe(
    switchMap(() => failTwiceThenSucceed.pipe(retry(2))),
  );
  m.expect(actual1).toBeObservable(expected1);

  // This observable will error on the first 3 subscriptions
  // but succeed on the fourth subscription onward.
  const failThriceThenSucceed = getRetryTestObservable(
    [errorMessage, errorMessage, errorMessage], successMessage,
  )();
  const actual2 = source.pipe(
    switchMap(() => failThriceThenSucceed.pipe(retry(2))),
  );
  m.expect(actual2).toBeObservable(expected2);
}));

it('concat operator', marbles(m => {
  const source1 = m.cold(' --a--b--|');
  const source2 = m.cold('         c---d---|');
  const expected = m.cold('--a--b--c---d---|');
  const actual = concat(source1, source2);
  m.expect(actual).toBeObservable(expected);
}));
