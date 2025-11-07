import test from "ava";
import {
    E503_TypeError,
    E505_UninitializedError,
    run,
} from "../src/go";

test("'for' statement", (t) => {
    t.is(run("for x in [1, 2, 3] { x }"), "none");
    t.is(run("my a = [4, 5, 6]; for x in a { }"), "none");
    t.is(run("for n in [] { n }"), "none");
    t.is(run("for r in [[1, 2], [3, 4]] { for c in r { } }"), "none");

    t.throws(() => run("for x in 42 { }"), { instanceOf: E503_TypeError });
    t.throws(
        () => run("my x = [1, 2]; for x in x {}"),
        { instanceOf: E505_UninitializedError },
    );
    t.throws(
        () => run("for r in [[1, 2], [3, 4]] { for c in 42 { } }"),
        { instanceOf: E503_TypeError },
    );
});

