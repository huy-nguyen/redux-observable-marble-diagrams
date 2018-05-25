import {
  getEpic,
} from '../epic';
import {
  marbles,
} from 'rxjs-marbles/jest';
import {
  ActionTypes,
} from '../types';

test('Should only act on UpdateURLAction', marbles(m => {
  const values = {
    a: {type: ActionTypes.UPDATE_URL},
    b: {type: 'Unknown'},
  };
  const action$ = m.cold('  -a-b-a-aaa----------|', values);
  const expected$ = m.cold('-------------a------|', values);

  // Inject `dueTime` and `TestScheduler` into epic:
  const epic = getEpic(4, m.scheduler);

  const actual$ = epic(action$);

  m.expect(actual$).toBeObservable(expected$);
}));

