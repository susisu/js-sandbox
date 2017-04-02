// @flow

import { Point, genPointClass } from "./point.js";

const p : Point = new Point(1, 2);

const P1 = genPointClass();
const P2 = genPointClass();
const p1 : P1 = new P2(1, 2);
