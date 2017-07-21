// @flow

import assert from "assert";
import { uncons, stringStream, arrayStream } from "./stream.js";

{
  const string = "";
  const unconsed = uncons(string, stringStream);
  // uncons(string, arrayStream()); // error
  assert(unconsed === null || unconsed === undefined);
}

{
  const string = "foobar";
  const unconsed = uncons(string, stringStream);
  assert(unconsed !== null && unconsed !== undefined);
  if (unconsed !== null && unconsed !== undefined) {
    assert(unconsed[0] === "f");
    assert(unconsed[1] === "oobar");
  }
}

{
  const array = [];
  const unconsed = uncons(array, arrayStream());
  // uncons(array, stringStream); // error
  assert(unconsed === null || unconsed === undefined);
}

{
  const array = [1, 2, 3];
  const unconsed = uncons(array, arrayStream());
  assert(unconsed !== null && unconsed !== undefined);
  if (unconsed !== null && unconsed !== undefined) {
    assert(unconsed[0] === 1);
    assert(unconsed[1][0] === 2);
    assert(unconsed[1][1] === 3);
  }
}

class S extends stringStream.constructor {
  uncons(stream: string): ?[string, string] {
    if (stream.length === 0) {
      return undefined;
    }
    const head = String.fromCodePoint(stream.codePointAt(0));
    return [head, stream.slice(head.length)];
  }
}

{
  const string = "🍣";
  const unconsed = uncons(string, stringStream);
  assert(unconsed !== null && unconsed !== undefined);
  if (unconsed !== null && unconsed !== undefined) {
    assert(unconsed[0] === "\uD83C");
    assert(unconsed[1] === "\uDF63");
  }
}

{
  const string = "🍣";
  const unconsed = uncons(string, new S()); // omg
  assert(unconsed !== null && unconsed !== undefined);
  if (unconsed !== null && unconsed !== undefined) {
    assert(unconsed[0] === "🍣");
    assert(unconsed[1] === "");
  }
}
