import {
  marbles,
} from 'rxjs-marbles/jest';
import {
  filter,
} from 'rxjs/operators';

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
