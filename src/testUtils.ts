import {
  Observable,
} from 'rxjs';

// Return a function that creates an observable that is designed to throw
// `countBeforeSuccess` error ovservables before emitting a non-error
// observable. Useful when testing `retry` operators.
export const getRetryTestObservable = <Error, Success>(
    errors: Error[],
    success: Success,
  ) =>
    () => {

  const errorsCopy = [...errors];
  const customObservable = new Observable((observer) => {
    const error = errorsCopy.shift();
    if (error !== undefined) {
      observer.error(error);
    } else {
      observer.next(success);
      observer.complete();
    }
  });
  return customObservable;
};
