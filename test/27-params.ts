import test from "ava";
import {
    E511_TooManyArgumentsError,
    E512_NotEnoughArgumentsError,
    run,
} from "../src/go";

test("parameters", (t) => {
    t.is(run("func f(x) { x; }; f(1)"), "none");
    t.is(run("func f(x, y) { x; y; }; f(1, 2)"), "none");
    t.is(run("func f(x, y) {}; f"), "<func f(x, y)>");

    t.throws(
        () => run("func f(x) {}; f()"),
        { instanceOf: E512_NotEnoughArgumentsError },
    );
    t.throws(
        () => run("func f(x) {}; f(1, 2)"),
        { instanceOf: E511_TooManyArgumentsError },
    );
    t.throws(
        () => run("func f(x, y) {}; f(1)"),
        { instanceOf: E512_NotEnoughArgumentsError },
    );
    t.throws(
        () => run("func f(x, y) {}; f()"),
        { instanceOf: E512_NotEnoughArgumentsError },
    );
});

