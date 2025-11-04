import test from "ava";
import {
    run,
} from "../src/go";

test("'return' statement", (t) => {
    t.is(run("func f() { return; }; f()"), "none");
    t.is(run("func f() { return none }; f()"), "none");
    t.is(run("f(); func f() { return }"), "none");
    t.is(run("f(); func f() { return none; }"), "none");
    t.is(run("my x = 0; func f() { x = 1; return x; }; f()"), "1");
    t.is(run("my x = 0; func f() { return x; x = 1; }; f()"), "0");
    t.is(run("my x = 0; func f() { return x; x = 1; }; f(); x"), "0");

    t.throws(() => run("return 10;"));
});

