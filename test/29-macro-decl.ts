import test from "ava";
import {
    E301_RedeclarationError,
    E601_ZeroDivisionError,
    E608_ReadonlyError,
    E609_LastOutsideLoopError,
    E610_NextOutsideLoopError,
    E611_TooManyArgumentsError,
    E612_NotEnoughArgumentsError,
    E614_MacroAtRuntimeError,
    run,
} from "../src/go";

test("macro declaration", (t) => {
    t.is(run("macro m() {}"), "none");
    t.is(run("macro m() {}; m"), "<macro m()>");
    t.is(run("macro m() { m; }; m"), "<macro m()>");
    t.is(run("macro m() { my m; }; m"), "<macro m()>");
    t.is(run("macro m() {}; macro n() {}"), "none");
    t.is(run("macro m() { n; }; macro n() { m; }"), "none");
    t.is(run("macro m() { macro m() {} }"), "none");
    t.is(run("macro m() { macro n() {} }"), "none");

    t.throws(
        () => run("my m; macro m() {}"),
        { instanceOf: E301_RedeclarationError },
    );
    t.throws(
        () => run("macro m() {}; my m;"),
        { instanceOf: E301_RedeclarationError },
    );
    t.throws(
        () => run("macro m() {}; macro m() {}"),
        { instanceOf: E301_RedeclarationError },
    );
    t.throws(
        () => run("macro m() {}; func m() {}"),
        { instanceOf: E301_RedeclarationError },
    );
    t.throws(
        () => run("macro m() {}; m = 19;"),
        { instanceOf: E608_ReadonlyError },
    );
    t.throws(
        () => run("m = false; macro m() {}"),
        { instanceOf: E608_ReadonlyError },
    );

    t.is(run("macro m() {}; m()"), "none");
    t.is(run("m(); func m() {}"), "none");
    t.is(run("macro m() { 5; }; m()"), "none");

    t.throws(
        () => run("macro m() {}; m(5)"),
        { instanceOf: E611_TooManyArgumentsError },
    );
    t.throws(
        () => run("macro m() { 1 // 0 }; m()"),
        { instanceOf: E601_ZeroDivisionError },
    );
    t.throws(
        () => run("macro m() { last; }; m()"),
        { instanceOf: E609_LastOutsideLoopError },
    );
    t.throws(
        () => run("macro m() { next; }; m()"),
        { instanceOf: E610_NextOutsideLoopError },
    );

    t.is(run("macro m(x) { x; }; m(1)"), "none");
    t.is(run("my y = 29; macro m(x) { x; }; m(y)"), "none");
    t.is(run("macro m(x, y) { x; y; }; m(1, 2)"), "none");
    t.is(run("macro m(x, y) {}; m"), "<macro m(x, y)>");

    t.throws(
        () => run("macro m(x) {}; m()"),
        { instanceOf: E612_NotEnoughArgumentsError },
    );
    t.throws(
        () => run("macro m(x) {}; m(1, 2)"),
        { instanceOf: E611_TooManyArgumentsError },
    );
    t.throws(
        () => run("macro m(x, y) {}; m(1)"),
        { instanceOf: E612_NotEnoughArgumentsError },
    );
    t.throws(
        () => run("macro m(x, y) {}; m()"),
        { instanceOf: E612_NotEnoughArgumentsError },
    );

    t.is(run("macro m(x) { return x; }; m(1)"), "1");
    t.is(run("my y = 29; macro m(x) { return x; }; m(y)"), "29");
    t.is(run("macro m(x, y) { x; return y; }; m(1, 2)"), "2");

    t.is(run("macro m() { return; }; m()"), "none");
    t.is(run("macro m() { return none }; m()"), "none");
    t.is(run("m(); macro m() { return }"), "none");
    t.is(run("m(); macro m() { return none; }"), "none");

    t.is(run("macro m() { return 1; }; m()"), "1");
    t.is(run("macro m() { return 2 }; m()"), "2");
    t.is(run("m(); macro m() { return 3 }"), "none");
    t.is(run("m(); macro m() { return 4; }"), "none");
    t.is(run('macro m() { return "glib"; }; m()'), '"glib"');
    t.is(run('macro m() { return "sundry" }; m()'), '"sundry"');
    t.is(run("macro m() { return true; }; m()"), "true");
    t.is(run("macro m() { return false }; m()"), "false");

    t.throws(
        () => run("macro m() {}; (m)()"),
        { instanceOf: E614_MacroAtRuntimeError },
    );
    t.throws(
        () => run("macro m() {}; (do m)()"),
        { instanceOf: E614_MacroAtRuntimeError },
    );
    t.throws(
        () => run("macro m() {}; func f(p) { p() }; f(m)"),
        { instanceOf: E614_MacroAtRuntimeError },
    );

    t.is(run('my v; macro m() { v = "set" }; m(); v'), '"set"');
    t.is(
        run('my v = "runtime"; macro m() { v = "compile time" }; m(); v'),
        '"runtime"',
    );
    t.is(
        run("my d; macro m(x) { d = x }; m(3000); d"),
        "<syntax IntLitExpr>",
    );
    t.is(
        run("my d; macro m(x) { d = x }; m(3 || 4); ~d"),
        '"<syntax InfixOpExpr>"',
    );

    t.is(run('my b; macro m(x) { b = x == x }; m("foo"); b'), "true");
    t.is(run("my d; macro m(x) { d = x }; m([1, 2]); d == d"), "true");
    t.is(run("my b; macro m(x, y) { b = x == y }; m(3, 3); b"), "false");

    {
        let program = `
            my d;
            my b;

            macro m1(x) {
                d = x;
            }

            macro m2(y) {
                b = d == y;
            }

            m1(true);
            m2(true);

            b;
        `;
        t.is(run(program), "false");
    }

    {
        let program = `
            my result;

            macro m() {
                result = "outer";
            }

            {
                m();
            }

            result;
        `;
        t.is(run(program), '"outer"');
    }

    {
        let program = `
            my result;

            macro m() {
                result = "outer";
            }

            {
                m();

                macro m() {
                    result = "inner";
                }
            }

            result;
        `;
        t.is(run(program), '"inner"');
    }
});

