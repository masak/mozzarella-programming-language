import test from "ava";
import {
    run,
} from "../src/run";

test("function declaration", (t) => {
    t.is(run("func f() {}"), "none");
    t.is(run("func f() {}; f"), "<func f()>");
    t.is(run("func f() { f; }; f"), "<func f()>");
    t.is(run("func f() { my f; }; f"), "<func f()>");
    t.is(run("func f() {}; func g() {}"), "none");
    t.is(run("func f() { g; }; func g() { f; }"), "none");
    t.is(run("func f() { func f() {} }"), "none");
    t.is(run("func f() { func g() {} }"), "none");

    t.throws(() => run("my f; func f() {}"));
    t.throws(() => run("func f() {}; my f;"));
    t.throws(() => run("func f() {}; func f() {}"));
});

