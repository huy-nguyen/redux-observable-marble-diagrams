import parse from 'github-url-parse';
import {
  Epic,
} from 'redux-observable';
import {
  concat,
  Observable,
  of,
  Scheduler,
} from 'rxjs';
import {
  ajax,
  AjaxError,
  AjaxRequest,
  AjaxResponse,
} from 'rxjs/ajax';
import {
  catchError,
  debounceTime,
  filter,
  map,
  retry,
  switchMap,
  withLatestFrom,
} from 'rxjs/operators';
import {
  Action,
  ActionTypes,
  FetchBeginAction,
  FetchFailAction,
  FetchInitialAction,
  FetchSuccessAction,
  RootState,
  UpdateURLAction,
} from './types';

// Type guard:
const isUpdateURLAction = (action: Action): action is UpdateURLAction =>
  action.type === ActionTypes.UPDATE_URL;

export type FetchOutcome = FetchInitialAction | FetchBeginAction |
                            FetchSuccessAction | FetchFailAction;

export interface EpicDependencies {
  ajaxMethod: typeof ajax;
  dueTime: number;
  scheduler?: Scheduler;
}

export const epic: Epic<Action, RootState, EpicDependencies, FetchOutcome> =
  (action$: Observable<Action>, state$: Observable<RootState>, {
    ajaxMethod = ajax,
    dueTime = 250,
    scheduler,
  }: EpicDependencies) =>
    action$.pipe(
      filter<Action, UpdateURLAction>(isUpdateURLAction),
      debounceTime(dueTime, scheduler),
      withLatestFrom(state$),
      switchMap<[UpdateURLAction, RootState], FetchOutcome>(([, {url}]): Observable<FetchOutcome> => {
        if (url === '') {
          // If the user input is blank, show the initial prompt:
          return of<FetchInitialAction>({type: ActionTypes.FETCH_INITIAL});
        } else {
          const parseResult = parse(url);
          if (parseResult === null) {
            // If we cannot parse the URL into a GitHub URL at all, show an error message:
            return of<FetchFailAction>({type: ActionTypes.FETCH_FAIL, payload: {message: 'Invalid GitHub URL'}});
          } else {
            // Otherwise, initiate a fetch:
            const fetchBegin$ = of<FetchBeginAction>({type: ActionTypes.FETCH_BEGIN});
            const {branch, path, repo, user} = parseResult;
            const fetchURL = `https://api.github.com/repos/${user}/${repo}/contents/${path}?ref=${branch}`;

            let ajaxRequest: AjaxRequest;
            // Note: `GITHUB_TOKEN` will be replaced with a string
            // value by webpack's `DefinePlugin`:
            if (GITHUB_TOKEN === undefined) {
              // If no github token is provided, send an unauthenticated request:
              ajaxRequest = {
                url: fetchURL,
              };
            } else {
              // Otherwise, send credentials along to avoid rate limit:
              ajaxRequest = {
                url: fetchURL,
                headers: {
                  Authorization: `token ${GITHUB_TOKEN}`,
                },
              };
            }

            const fetchPipeline$ = ajaxMethod(ajaxRequest).pipe(
              retry<AjaxResponse>(3),
              map<AjaxResponse, FetchSuccessAction>(({response}) => {
                if (Array.isArray(response)) {
                  // This means the fetched URL is a directory instead
                  // of a file:
                  throw new Error('URL is a GitHub directory instead of a file');
                }
                const {content} = response;
                const decoded = atob(content);
                return {type: ActionTypes.FETCH_SUCCESS, payload: {data: decoded}};
              }),
              catchError<any, FetchFailAction>((err: AjaxError) => {
                // Try to use error message in ajax response because we assume
                // it's more relevant that the `message` property of the `err`
                // observable:
                let message: string;
                if (err.xhr && err.xhr.response && err.xhr.response.message) {
                  message = err.xhr.response.message;
                } else {
                  message = err.message;
                }
                return of<FetchFailAction>({type: ActionTypes.FETCH_FAIL, payload: {message}});
              }),
            );
            return concat(fetchBegin$, fetchPipeline$);
          }
        }
      }),
    );
