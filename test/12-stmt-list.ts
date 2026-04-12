import test from "ava";
import {
    E201_SyntaxError,
    run,
} from "../src/go";

test("statement list", (t) => {
    t.is(run(""), "none");
    t.is(run(";"), "none");
    t.is(run('42; "plum"'), '"plum"');
    t.is(run("1 + 1; 2 + 2; 3 + 3"), "6");
    t.is(run('"finch"; ;;;; ; ; "trophy"'), '"trophy"');
    t.is(run('true; ;;;;'), "none");

    t.throws(() => run("1 2"), { instanceOf: E201_SyntaxError });
});

