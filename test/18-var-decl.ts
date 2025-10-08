import test from "ava";
import {
    run,
} from "../src/run";

test("variable declaration", (t) => {
    t.is(run("my x"), "none");
    t.is(run("my y;"), "none");
    t.is(run("my z = 5"), "none");
    t.is(run('my w = "soup"; -19'), "-19");
    t.is(run("my outer = 1; { my inner = 2 }"), "none");
    t.is(run("my shadow; { my shadow }"), "none");
    t.is(run("my shadow = 1; { my shadow = 2 }"), "none");

    t.throws(() => run("my x; my x"));
    t.throws(() => run("my y; my y;"));
    t.throws(() => run("my divByZero = 1 // 0;"));
});

