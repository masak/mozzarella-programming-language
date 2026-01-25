import test from "ava";
import {
    E500_OutOfFuel,
    E601_ZeroDivisionError,
    E609_LastOutsideLoopError,
    E610_NextOutsideLoopError,
    E611_TooManyArgumentsError,
    run,
    runWithFuel,
} from "../src/go";

test("call expression", (t) => {
    t.is(run("func f() {}; f()"), "none");
    t.is(run("f(); func f() {}"), "none");
    t.is(run("my x = 0; func f() { x = 1; }; x"), "0");
    t.is(run("my x = 0; func f() { x = 1; }; f(); x"), "1");
    t.is(run("func f() { 5; }; f()"), "none");

    {
        let program = `
            my n = 0;
            func f() {
                n = n + 1;
            }
            for ff in [f, f, f] {
                ff();
            }
            n;
        `;
        t.is(run(program), "3");
    }

    t.throws(
        () => run("func f() {}; f(5)"),
        { instanceOf: E611_TooManyArgumentsError },
    );
    t.throws(
        () => run("func f() { 1 // 0 }; f()"),
        { instanceOf: E601_ZeroDivisionError },
    );
    t.throws(
        () => run("func f() { last; }; for x in [1] { f() }"),
        { instanceOf: E609_LastOutsideLoopError },
    );
    t.throws(
        () => run("func f() { next; }; for x in [1] { f() }"),
        { instanceOf: E610_NextOutsideLoopError },
    );

    t.throws(
        () => runWithFuel("func f() { f() }; f()", 100),
        { instanceOf: E500_OutOfFuel },
    );
});

