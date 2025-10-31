import test from "ava";
import {
    run,
} from "../src/run";

test("call expression", (t) => {
    t.is(run("func f() {}; f()"), "none");
    t.is(run("f(); func f() {}"), "none");
    t.is(run("my x = 0; func f() { x = 1; }; x"), "0");
    t.is(run("my x = 0; func f() { x = 1; }; f(); x"), "1");

    t.throws(() => run("func f() {}; f(5)"));
    t.throws(() => run("func f() { 1 // 0 }; f()"));
});

