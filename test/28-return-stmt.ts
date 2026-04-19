import test from "ava";
import {
    E613_ReturnOutsideRoutineError,
    run,
} from "../src/go";

test("'return' statement", (t) => {
    t.is(run("func f() { return; }; f()"), "none");
    t.is(run("func f() { return none }; f()"), "none");
    t.is(run("f(); func f() { return }"), "none");
    t.is(run("f(); func f() { return none; }"), "none");
    t.is(run("my x = 0; func f() { x = 1; return x; }; f()"), "1");
    t.is(run("my x = 0; func f() { return x; x = 1; }; f()"), "0");
    t.is(run("my x = 0; func f() { return x; x = 1; }; f(); x"), "0");

    {
        let program = `
            my closures = [none, none, none];

            for index in [0, 1, 2] {
                func f() {
                    return 10 + index;
                }

                closures[index] = f;
            }

            my result = [none, none, none];

            for index in [0, 1, 2] {
                result[index] = closures[index]();
            }

            result;
        `;
        t.is(run(program), "[10, 11, 12]");
    }

    t.throws(
        () => run("return 10;"),
        { instanceOf: E613_ReturnOutsideRoutineError },
    );
});

