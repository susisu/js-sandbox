// @flow

class Stream<S, T> {
  uncons(stream: S): ?[T, S] {
    throw new Error("not implemented");
  }
}

export function uncons<S, T>(stream: S, streamInstance: Stream<S, T>): ?[T, S] {
  return streamInstance.uncons(stream);
}

class StringStream extends Stream<string, string> {
  uncons(stream: string): ?[string, string] {
    return stream.length === 0
      ? undefined
      : [stream[0], stream.slice(1)];
  }
}

export const stringStream = new StringStream();

class ArrayStream<T> extends Stream<Array<T>, T> {
  uncons(stream: Array<T>): ?[T, Array<T>] {
    return stream.length === 0
      ? undefined
      : [stream[0], stream.slice(1)];
  }
}

export function arrayStream<T>(): ArrayStream<T> {
  return new ArrayStream();
}
