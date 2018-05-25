import {
  Observable,
  Scheduler,
} from 'rxjs';
import {
  debounceTime,
  filter,
  withLatestFrom,
} from 'rxjs/operators';
import {
  Action,
  ActionTypes,
  RootState,
  UpdateURLAction,
} from './types';

// Type guard:
const isUpdateURLAction = (action: Action): action is UpdateURLAction =>
  action.type === ActionTypes.UPDATE_URL;

export const getEpic = (
    // These arguments allow for dependency injection during testing:
    dueTime: number = 250,
    // Note: `undefined` scheduler passed to `debounceTime` in production means
    // it'll use the "natural" scheduler:
    scheduler: Scheduler | undefined = undefined,
  ) =>
    (action$: Observable<Action>, state$: Observable<RootState>) =>
      action$.pipe(
        filter<Action, UpdateURLAction>(isUpdateURLAction),
        debounceTime(dueTime, scheduler),
        withLatestFrom(state$),
      );
