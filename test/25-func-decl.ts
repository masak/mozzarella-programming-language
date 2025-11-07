import test from "ava";
import {
    E301_RedeclarationError,
    run,
} from "../src/go";

test("function declaration", (t) => {
    t.is(run("func f() {}"), "none");
    t.is(run("func f() {}; f"), "<func f()>");
    t.is(run("func f() { f; }; f"), "<func f()>");
    t.is(run("func f() { my f; }; f"), "<func f()>");
    t.is(run("func f() {}; func g() {}"), "none");
    t.is(run("func f() { g; }; func g() { f; }"), "none");
    t.is(run("func f() { func f() {} }"), "none");
    t.is(run("func f() { func g() {} }"), "none");

    t.throws(
        () => run("my f; func f() {}"),
        { instanceOf: E301_RedeclarationError },
    );
    t.throws(
        () => run("func f() {}; my f;"),
        { instanceOf: E301_RedeclarationError },
    );
    t.throws(
        () => run("func f() {}; func f() {}"),
        { instanceOf: E301_RedeclarationError },
    );
    t.throws(() => run("func f() {}; f = 19;"));
    t.throws(() => run("f = false; func f() {}"));
});

