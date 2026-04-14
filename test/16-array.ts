import test from "ava";
import {
    E201_SyntaxError,
    run,
} from "../src/go";

test("arrays", (t) => {
    t.is(run("[]"), "[]");
    t.is(run("[1, 2, 3]"), "[1, 2, 3]");
    t.is(run("[1, 2, 3,]"), "[1, 2, 3]");

    t.is(run("[] == []"), "true");
    t.is(run("[] == [1, 2]"), "false");
    t.is(run("[1, 2] == [1, 2, 3]"), "false");
    t.is(run('[1, 2] == [1, "2"]'), "false");

    t.is(run("[1, 2, 1] < [1, 2, 2]"), "true");
    t.is(run("[1, 2] < [1, 2, 1]"), "true");
    t.is(run("[1] < [1, 2] < [1, 2, 1] <= [1, 2, 1]"), "true");
    t.is(run("[1, 2, 2] < [1, 2, 1]"), "false");
    t.is(run("[1, 2, 3] < [1, 2, 3]"), "false");
    t.is(run("[1, 2, 1] < [1, 2]"), "false");
    t.is(run("[1, 2, 1] <= [1, 2, 2]"), "true");
    t.is(run("[1, 2] <= [1, 2, 1]"), "true");
    t.is(run("[1] <= [1, 2] <= [1, 2, 1] < [1, 2, 1]"), "false");
    t.is(run("[1, 2, 2] <= [1, 2, 1]"), "false");
    t.is(run("[1, 2, 3] <= [1, 2, 3]"), "true");
    t.is(run("[1, 2, 1] <= [1, 2]"), "false");

    t.is(run("~[]"), '"[]"');
    t.is(run("~[1, 2, 3]"), '"[1, 2, 3]"');

    t.is(run("?[]"), "false");
    t.is(run("?[1, 2, 3]"), "true");
    t.is(run("![]"), "true");
    t.is(run("![1, 2, 3]"), "false");
    t.is(run("if [] { 1 } else if [2, 3] { 4 } else { 5 }"), "4");

    t.throws(() => run("[,]"), { instanceOf: E201_SyntaxError });
});

