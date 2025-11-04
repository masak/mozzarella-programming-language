import test from "ava";
import {
    run,
} from "../src/go";

test("parentheses", (t) => {
    t.is(run("2 + 3 * 4"), "14");
    t.is(run("(2 + 3) * 4"), "20");

    t.is(run('~(1 + 2) ~ "bottles"'), '"3bottles"');
    t.throws(() => run('~1 + 2 ~ "bottles"'));

    t.is(run("true || false && none"), "true");
    t.is(run("(true || false) && none"), "none");

    t.is(run("3 < 7 && 1 < 4"), "true");
    t.is(run("3 < (7 && 1) < 4"), "false");
});

