import test from "ava";
import {
    E509_LastOutsideLoopError,
    run,
} from "../src/go";

test("'last' statement", (t) => {
    t.is(run("my n = 10; while n > 5 { n = n - 1; last; }; n"), "9");
    t.is(run("my n = 20; while n > 5 { last; n = n - 1; }; n"), "20");
    t.is(run('while true { last; }; "alive"'), '"alive"');

    {
        let program = `
            my n = 100;
            while n > 90 {
                if n % 11 == 0 {
                    last;
                }
                n = n - 1;
            }
            n;
        `;
        t.is(run(program), "99");
    }

    {
        let program = `
            my n = 9;
            while true {
                if n % 5 == 0 {
                    last;
                }
                n = n - 1;
            }
            n;
        `;
        t.is(run(program), "5");
    }

    {
        let program = `
            my a = [0, 0, 0, 0];
            for i in [0, 1, 2, 3] {
                a[i] = 9;
                last;
            }
            a;
        `;
        t.is(run(program), "[9, 0, 0, 0]");
    }

    {
        let program = `
            my a = [0, 0, 0, 0];
            for i in [0, 1, 2, 3] {
                last;
                a[i] = 14;
            }
            a;
        `;
        t.is(run(program), "[0, 0, 0, 0]");
    }

    t.throws(() => run("last;"), { instanceOf: E509_LastOutsideLoopError });
});

