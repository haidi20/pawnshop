import { isLeft, type Either } from 'fp-ts/Either';

export const toError = (error: unknown): Error =>
    error instanceof Error ? error : new Error(String(error));

export const unwrapEitherOrThrow = <T>(result: Either<Error, T>): T => {
    if (isLeft(result)) {
        throw result.left;
    }

    return result.right;
};
