import test from "ava";
import {
    run,
} from "../src/run";

test("array indexing", (t) => {
    t.is(run("[10, 20, 30][1]"), "20");
    t.is(run("[[1, 2], [3, 4]][1][0]"), "3");
    t.is(run("[true, false][0]"), "true");
    t.is(run('["broccoli"][0]'), '"broccoli"');

    t.throws(() => run("false[2]"));
    t.throws(() => run("[1, 2, 3][none]"));
    t.throws(() => run('[4, 5, 6]["asparagus"]'));
    t.throws(() => run("[][0]"));
    t.throws(() => run("[true, false, true][-3]"));
    t.throws(() => run("[none, none][9]"));
});

