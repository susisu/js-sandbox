// @flow

import assert from "assert";

// argument
class Arg<K, V> {
  name: K;
  _parse: string => V;

  constructor(name: K, parse: string => V) {
    this.name   = name;
    this._parse = parse;
  }

  parse(argv: string): V {
    return this._parse.call(undefined, argv);
  }
}

function stringArg<K>(name: K): Arg<K, string> {
  return new Arg(name, argv => argv);
}

function numberArg<K>(name: K): Arg<K, number> {
  return new Arg(name, argv => parseFloat(argv));
}

// command constructors
interface Command<C> {
  run<T>(argv: Array<string>, callback: C => T): T
}

class Empty implements Command<{}> {
  run<T>(argv: Array<string>, callback: {} => T): T {
    return callback({});
  }
}

class Append<C: {}, K: string, V> implements Command<C & { [K]: V }> {
  cmd: Command<C>;
  arg: Arg<K, V>;

  constructor(cmd: Command<C>, arg: Arg<K, V>) {
    this.cmd = cmd;
    this.arg = arg;
  }

  run<T>(argv: Array<string>, callback: (C & { [K]: V }) => T): T {
    const res = Object.assign(
      this.cmd.run(argv.slice(0, -1), x => x),
      { [this.arg.name]: this.arg.parse(argv[argv.length - 1]) }
    );
    return callback(res);
  }
}

const empty = new Empty();

function append<C: {}, K: string, V>(cmd: Command<C>, arg: Arg<K, V>): Append<C, K, V> {
  return new Append(cmd, arg);
}

// test
const argv = ["foo", "123"];

const cmd = append(
  append(
    empty,
    (stringArg("str"): Arg<"str", *>)
  ),
  (numberArg("num"): Arg<"num", *>)
);

cmd.run(argv, res => {
  (res.str: string);
  (res.num: number);
  assert(res.str === "foo");
  assert(res.num === 123);
  // res.unknown; // -> error
});
