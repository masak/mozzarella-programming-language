import test from "ava";
import {
    E506_UndeclaredError,
    E507_CannotAssignError,
    run,
} from "../src/go";

test("assignment expression", (t) => {
    t.is(run("my a = [1, 2]; a[1] = 99; a"), "[1, 99]");
    t.is(run("my x; x = 5; x"), "5");
    t.is(
        run("my a = 1; my b = 2; my c = 3; a = b = c; [a, b, c]"),
        "[3, 3, 3]",
    );
    t.is(run("my L = []; L = [L]; L"), "[[]]");
    t.is(run('my L = ["rec"]; L[0] = L; L'), "[[...]]");
    t.is(run('my L = [0, "rec"]; L[1] = L; L'), "[0, [...]]");
    t.is(run("(do { my y = 10; y }) = 20"), "20");
    t.is(run("my x = 1; (do if false { x } else { x }) = 2; x"), "2");
    t.is(run("my L = [1, 2]; L[1] = do { L = [4, 5]; none }; L"), "[4, 5]");
    t.is(run("my a = [7, 8]; my b = a; a[0] = -1; b"), "[-1, 8]");

    t.throws(() => run("x = 21"), { instanceOf: E506_UndeclaredError });
    t.throws(
        () => run("[1, 2, 3] = 4"),
        { instanceOf: E507_CannotAssignError },
    );
    t.throws(() => run("2 + 2 = 4"), { instanceOf: E507_CannotAssignError });
    t.throws(
        () => run("true = false"),
        { instanceOf: E507_CannotAssignError },
    );
    t.throws(() => run("my L = [0]; L[3] = 5"));
    t.throws(() => run('for x in [1, 2, 3] { x = "tomato"; }'));
    t.throws(() => run("for x in x = [1, 2, 3] {}"));
});

