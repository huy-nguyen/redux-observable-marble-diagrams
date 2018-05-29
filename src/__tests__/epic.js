import {
  epic,
} from '../epic';
import {
  marbles,
} from 'rxjs-marbles/jest';
import {
  AjaxResponse,
  AjaxError,
} from 'rxjs/ajax';
import {
  ActionTypes,
} from '../types';
import {
  of,
} from 'rxjs';
import {
  delay,
} from 'rxjs/operators';
import {
  getRetryTestObservable,
} from '../testUtils';

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

  const getAjaxObservable = jest.fn().mockReturnValueOnce(
    of({response: { content: contentAsBase64}}).pipe(delay(1))
  );

  // Inject `dueTime` and `TestScheduler` into epic:
  const actual$ = epic(action$, state$, {
    getAjax: getAjaxObservable,
    dueTime: 4,
    scheduler: m.scheduler,
  });

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

  const actual$ = epic(action$, state$, {
    // This mock will not be called so it doesn't matter what value it returns
    getAjax: jest.fn(),
    dueTime: 4,
    scheduler: m.scheduler,
  });
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

  const state$ = m.cold(' s-------t------------', values);
  const action$ = m.cold('  -a-------a------|', values);
  const expected$ = m.cold('-----xy------z--|', values);

  const testAjax = jest.fn().mockReturnValueOnce(
    of({response: { content: contentAsBase64}}).pipe(delay(1)),
  );

  const actual$ = epic(action$, state$, {
    getAjax: testAjax,
    dueTime: 4,
    scheduler: m.scheduler,
  });
  m.expect(actual$).toBeObservable(expected$);
}));

it('Should retry when encountering fetch error', marbles(m => {
  const contentAsString = 'This is a test.';
  const contentAsBase64 = btoa(contentAsString);

  const ajaxSuccess = new AjaxResponse(undefined, {
    status: 200, response: {content: contentAsBase64}, responseType: 'json',
  });
  const ajaxFailure = new AjaxError('This is an error', {
    status: 404, response: {message: 'Not Found'}, responseType: 'json',
  });

  // The AJAX request will fail three times and succeed when retried on the fourth time:
  const getTestAjaxObservable = getRetryTestObservable([ajaxFailure, ajaxFailure, ajaxFailure], ajaxSuccess);

  const values = {
    a: {type: ActionTypes.UPDATE_URL},
    b: {type: 'Unknown'},
    s: {url: 'https://github.com/ReactiveX/rxjs/blob/master/index.js'},
    x: {type: ActionTypes.FETCH_BEGIN},
    y: {type: ActionTypes.FETCH_SUCCESS, payload: {data: contentAsString}},
  };

  const state$ = m.cold(' s-------------------------', values);
  const action$ = m.cold('  -a-b-a-aaa----------|', values);
  const expected$ = m.cold('-------------(xy)---|', values);

  const actual$ = epic(action$, state$, {
    getAjax: getTestAjaxObservable,
    dueTime: 4,
    scheduler: m.scheduler,
  });
  m.expect(actual$).toBeObservable(expected$);

}));

it('Should dispatch "fetch fail" action when retries are unsuccessful due to 404s', marbles(m => {
  const errorMessage = 'Not Found';

  const ajaxFailure = new AjaxError('This is a test error', {
    status: 404, response: {message: errorMessage}, responseType: 'json',
  });

  // The AJAX request will fail four times and succeed when retried on the fifth time.
  // However, because the epic only retries three times, only errors will be emitted:
  const getTestAjaxObservable = getRetryTestObservable(
    [ajaxFailure, ajaxFailure, ajaxFailure, ajaxFailure], undefined,
  );
  const values = {
    a: {type: ActionTypes.UPDATE_URL},
    b: {type: 'Unknown'},
    s: {url: 'https://github.com/ReactiveX/rxjs/blob/master/index.js'},
    x: {type: ActionTypes.FETCH_BEGIN},
    z: {type: ActionTypes.FETCH_FAIL, payload: {message: errorMessage}},
  };

  const state$ = m.cold(' s-------------------------', values);
  const action$ = m.cold('  -a-b-a-aaa----------|', values);
  const expected$ = m.cold('-------------(xz)---|', values);

  const actual$ = epic(action$, state$, {
    getAjax: getTestAjaxObservable,
    dueTime: 4,
    scheduler: m.scheduler,
  });
  m.expect(actual$).toBeObservable(expected$);

}));

