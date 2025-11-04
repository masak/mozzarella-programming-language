import test from "ava";
import {
    run,
} from "../src/go";

test("parameters", (t) => {
    t.is(run("func f(x) { x; }; f(1)"), "none");
    t.is(run("func f(x, y) { x; y; }; f(1, 2)"), "none");

    t.throws(() => run("func f(x) {}; f()"));
    t.throws(() => run("func f(x) {}; f(1, 2)"));
    t.throws(() => run("func f(x, y) {}; f(1)"));
    t.throws(() => run("func f(x, y) {}; f()"));
});

