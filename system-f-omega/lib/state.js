// @flow

import {
  Binding,
  type Context
} from "./context.js";
import type { Context as IxContext } from "./ixcontext.js";
import {
  toIndexedBinding,
  toIndexedContext
} from "./transform.js";

export class State {
  ctx: Context;
  ixctx: IxContext;

  constructor(ctx: Context, ixctx: IxContext) {
    this.ctx   = ctx;
    this.ixctx = ixctx;
  }

  static fromContext(ctx: Context): State {
    const ixctx = toIndexedContext(ctx);
    return new State(ctx, ixctx);
  }

  addBinding(bind: Binding): State {
    const ixbind = toIndexedBinding(this.ctx, bind);
    return new State(this.ctx.unshift(bind), this.ixctx.unshift(ixbind));
  }
}
