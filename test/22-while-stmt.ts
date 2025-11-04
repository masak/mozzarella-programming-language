import test from "ava";
import {
    OutOfFuel,
    run,
    runWithFuel,
} from "../src/go";

test("'while' statement", (t) => {
    t.is(run("while false {}"), "none");
    t.is(run('while false { 1 // 0 }; "alive"'), '"alive"');
    t.is(run("my n = 4; while n > 0 { n = n - 1 }; n"), "0");

    {
        let program = `
            my a = [1, 0, 0, 0];
            my i = 1;
            while i < 4 {
                a[i] = 2 * a[i-1];
                i = i + 1;
            }
            a;
        `;
        t.is(run(program), "[1, 2, 4, 8]");
    }

    t.throws(
        () => runWithFuel("while true {}", 100),
        { instanceOf: OutOfFuel },
    );
});

