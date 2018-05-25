import {
  getEpic,
} from '../epic';
import {
  marbles,
} from 'rxjs-marbles/jest';
import {
  ActionTypes,
} from '../types';

test('Happy path', marbles(m => {
  const stateValue = {url: 'http://example.com'};
  const urlUpdateAction = {type: ActionTypes.UPDATE_URL};

  const values = {
    a: urlUpdateAction,
    b: {type: 'Unknown'},
    s: stateValue,
    x: [urlUpdateAction, stateValue],
  };

  const state$ = m.cold('  s----------------------', values);
  const action$ = m.cold('  -a-b-a-aaa----------|', values);
  const expected$ = m.cold('-------------x------|', values);

  // Inject `dueTime` and `TestScheduler` into epic:
  const epic = getEpic(4, m.scheduler);

  const actual$ = epic(action$, state$);

  m.expect(actual$).toBeObservable(expected$);
}));

