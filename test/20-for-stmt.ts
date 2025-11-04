import test from "ava";
import {
    run,
} from "../src/go";

test("'for' statement", (t) => {
    t.is(run("for x in [1, 2, 3] { x }"), "none");
    t.is(run("my a = [4, 5, 6]; for x in a { }"), "none");
    t.is(run("for n in [] { n }"), "none");
    t.is(run("for r in [[1, 2], [3, 4]] { for c in r { } }"), "none");

    t.throws(() => run("for x in 42 { }"));
    t.throws(() => run("my x = [1, 2]; for x in x {}"));
    t.throws(() => run("for r in [[1, 2], [3, 4]] { for c in 42 { } }"));
});

