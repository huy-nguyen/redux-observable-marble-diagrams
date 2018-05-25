import {
  Observable,
} from 'rxjs';
import {
  filter,
} from 'rxjs/operators';
import {
  Action,
  ActionTypes,
  UpdateURLAction,
} from './types';

// Type guard:
const isUpdateURLAction = (action: Action): action is UpdateURLAction =>
  action.type === ActionTypes.UPDATE_URL;

export const epic =
  (action$: Observable<Action>) =>
    action$.pipe(
      filter<Action, UpdateURLAction>(isUpdateURLAction),
    );
