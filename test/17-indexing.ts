import test from "ava";
import {
    E603_TypeError,
    E604_IndexError,
    run,
} from "../src/go";

test("array indexing", (t) => {
    t.is(run("[10, 20, 30][1]"), "20");
    t.is(run("[[1, 2], [3, 4]][1][0]"), "3");
    t.is(run("[true, false][0]"), "true");
    t.is(run('["broccoli"][0]'), '"broccoli"');

    t.throws(() => run("false[2]"), { instanceOf: E603_TypeError });
    t.throws(() => run("[1, 2, 3][none]"), { instanceOf: E603_TypeError });
    t.throws(
        () => run('[4, 5, 6]["asparagus"]'),
        { instanceOf: E603_TypeError },
    );
    t.throws(() => run("[][0]"), { instanceOf: E604_IndexError });
    t.throws(
        () => run("[true, false, true][-3]"),
        { instanceOf: E604_IndexError },
    );
    t.throws(() => run("[none, none][9]"), { instanceOf: E604_IndexError });
});

