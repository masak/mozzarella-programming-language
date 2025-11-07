import test from "ava";
import {
    E500_OutOfFuel,
    E501_ZeroDivisionError,
    E509_LastOutsideLoopError,
    E510_NextOutsideLoopError,
    E511_TooManyArgumentsError,
    run,
    runWithFuel,
} from "../src/go";

test("call expression", (t) => {
    t.is(run("func f() {}; f()"), "none");
    t.is(run("f(); func f() {}"), "none");
    t.is(run("my x = 0; func f() { x = 1; }; x"), "0");
    t.is(run("my x = 0; func f() { x = 1; }; f(); x"), "1");
    t.is(run("func f() { 5; }; f()"), "none");

    t.throws(
        () => run("func f() {}; f(5)"),
        { instanceOf: E511_TooManyArgumentsError },
    );
    t.throws(
        () => run("func f() { 1 // 0 }; f()"),
        { instanceOf: E501_ZeroDivisionError },
    );
    t.throws(
        () => run("func f() { last; }; for x in [1] { f() }"),
        { instanceOf: E509_LastOutsideLoopError },
    );
    t.throws(
        () => run("func f() { next; }; for x in [1] { f() }"),
        { instanceOf: E510_NextOutsideLoopError },
    );

    t.throws(
        () => runWithFuel("func f() { f() }; f()", 100),
        { instanceOf: E500_OutOfFuel },
    );
});

