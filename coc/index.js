// @flow

import { createInterface } from "readline";

import { parse } from "./lib/parser.js";
import { emptyContext } from "./lib/context.js";
import { State } from "./lib/state.js";

let state = State.fromContext(emptyContext());

function interact() {
  const reader = createInterface({
    input : process.stdin,
    output: process.stdout
  });

  let buffer = "";
  reader.setPrompt("> ");
  reader.prompt();

  reader.on("line", line => {
    buffer += line + "\n";
    const semi = buffer.indexOf(";");
    if (semi >= 0) {
      try {
        const stmts = parse("<interactive>", buffer);
        for (let i = 0; i < stmts.length; i++) {
          const stmt = stmts[i];
          state = stmt.exec(state);
        }
      }
      catch (err) {
        if (err instanceof Error) {
          process.stdout.write(err.message + "\n");
        }
        else {
          process.stdout.write(String(err));
        }
      }
      buffer = "";
      reader.setPrompt("> ");
      reader.prompt();
    }
    else {
      reader.setPrompt("| ");
      reader.prompt();
    }
  });

  reader.on("close", () => {
    interact();
  });

  reader.on("SIGINT", () => {
    process.stdout.write("\n");
    process.exit(0);
  });
}

interact();
