import test from "ava";
import {
    E301_RedeclarationError,
    E501_ZeroDivisionError,
    run,
} from "../src/go";

test("variable declaration", (t) => {
    t.is(run("my x"), "none");
    t.is(run("my y;"), "none");
    t.is(run("my z = 5"), "none");
    t.is(run('my w = "soup"; -19'), "-19");
    t.is(run("my outer = 1; { my inner = 2 }"), "none");
    t.is(run("my shadow; { my shadow }"), "none");
    t.is(run("my shadow = 1; { my shadow = 2 }"), "none");
    t.is(run("my hasDigits12345 = 6"), "none");
    t.is(run("my _ = 42"), "none");

    t.throws(() => run("my x; my x"), { instanceOf: E301_RedeclarationError });
    t.throws(
        () => run("my y; my y;"),
        { instanceOf: E301_RedeclarationError },
    );
    t.throws(
        () => run("my divByZero = 1 // 0;"),
        { instanceOf: E501_ZeroDivisionError },
    );
});

