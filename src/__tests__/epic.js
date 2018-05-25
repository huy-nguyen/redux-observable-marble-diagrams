import {
  getEpic,
} from '../epic';
import {
  marbles,
} from 'rxjs-marbles/jest';
import {
  ActionTypes,
} from '../types';
import {
  of,
} from 'rxjs';
import {
  delay,
} from 'rxjs/operators';

test('Happy path', marbles(m => {
  const stateValue = {url: 'https://github.com/ReactiveX/rxjs/blob/master/index.js'};
  const urlUpdateAction = {type: ActionTypes.UPDATE_URL};

  const contentAsString = 'This is a test.';
  // Encode to base64 for testing:
  const contentAsBase64 = btoa(contentAsString);

  const values = {
    a: urlUpdateAction,
    b: {type: 'Unknown'},
    s: stateValue,
    x: {type: ActionTypes.FETCH_BEGIN},
    y: {type: ActionTypes.FETCH_SUCCESS, payload: {data: contentAsString}},
  };

  const state$ = m.cold('  s----------------------', values);
  const action$ = m.cold('  -a-b-a-aaa----------|', values);
  const expected$ = m.cold('-------------xy-----|', values);


  const testAjax = jest.fn().mockReturnValueOnce(
    of({response: { content: contentAsBase64}}).pipe(delay(1))
  );

  // Inject `dueTime` and `TestScheduler` into epic:
  const epic = getEpic(testAjax, 4, m.scheduler);

  const actual$ = epic(action$, state$);

  m.expect(actual$).toBeObservable(expected$);
}));

test('Should dispatch error message when invalid URL is entered', marbles(m => {
  const stateValue = {url: 'Nonsense'};
  const urlUpdateAction = {type: ActionTypes.UPDATE_URL};

  const values = {
    a: urlUpdateAction,
    b: {type: 'Unknown'},
    s: stateValue,
    x: {type: ActionTypes.FETCH_FAIL, payload: {message: 'Invalid GitHub URL'}},
  };

  const state$ = m.cold('  s----------------------', values);
  const action$ = m.cold('  -a-b-a-aaa----------|', values);
  const expected$ = m.cold('-------------x------|', values);

  // This mock will not be called so it doesn't matter what value it returns
  const testAjax = jest.fn();

  const epic = getEpic(testAjax, 4, m.scheduler);
  const actual$ = epic(action$, state$);
  m.expect(actual$).toBeObservable(expected$);
}));


test('Should show initial state when user clears input field', marbles(m => {
  const url = 'https://github.com/ReactiveX/rxjs/blob/master/index.js';

  const contentAsString = 'This is a test.';
  // Encode to base64 for testing:
  const contentAsBase64 = btoa(contentAsString);

  const values = {
    a: {type: ActionTypes.UPDATE_URL},
    s: {url},
    t: {url: ''},
    x: {type: ActionTypes.FETCH_BEGIN},
    y: {type: ActionTypes.FETCH_SUCCESS, payload: {data: contentAsString}},
    z: {type: ActionTypes.FETCH_INITIAL},
  };

  const state$ = m.cold('  s-------t------------', values);
  const action$ = m.cold('   -a-------a------|', values);
  const expected$ = m.cold(' -----xy------z--|', values);


  const testAjax = jest.fn().mockReturnValueOnce(
    of({response: { content: contentAsBase64}}).pipe(delay(1))
  );

  const epic = getEpic(testAjax, 4, m.scheduler);
  const actual$ = epic(action$, state$);
  m.expect(actual$).toBeObservable(expected$);
}));
