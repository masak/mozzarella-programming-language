import test from "ava";
import {
    E302_UseBeforeDeclarationError,
    E605_UninitializedError,
    E606_UndeclaredError,
    run,
} from "../src/go";

test("variable reference", (t) => {
    t.is(run("my x = 5; x"), "5");
    t.is(run("my z = 1; { my z = 2; z }"), "2");
    t.is(run("my z = 1; { my z = 2 }; z"), "1");
    t.is(run("my z = 1; { my z }; z"), "1");
    t.is(run("my x = 4; my y = x; y"), "4");
    t.is(run("my w = 11; { w }"), "11");

    t.throws(() => run("my x; x"), { instanceOf: E605_UninitializedError });
    t.throws(() => run("x"), { instanceOf: E606_UndeclaredError });
    t.throws(
        () => run("x; my x = 3"),
        { instanceOf: E302_UseBeforeDeclarationError },
    );
    t.throws(
        () => run("my x = 1; { x; my x = 2 }"),
        { instanceOf: E302_UseBeforeDeclarationError },
    );
    t.throws(
        () => run("{ x; my x = 99 }"),
        { instanceOf: E302_UseBeforeDeclarationError },
    );
});

