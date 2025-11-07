import test from "ava";
import {
    E505_UninitializedError,
    run,
} from "../src/go";

test("variable reference", (t) => {
    t.is(run("my x = 5; x"), "5");
    t.is(run("my z = 1; { my z = 2; z }"), "2");
    t.is(run("my z = 1; { my z = 2 }; z"), "1");
    t.is(run("my z = 1; { my z }; z"), "1");
    t.is(run("my x = 4; my y = x; y"), "4");
    t.is(run("my w = 11; { w }"), "11");

    t.throws(() => run("my x; x"), { instanceOf: E505_UninitializedError });
    t.throws(() => run("x"));
    t.throws(() => run("x; my x = 3"));
    t.throws(() => run("my x = 1; { x; my x = 2 }"));
    t.throws(() => run("{ x; my x = 99 }"));
});

