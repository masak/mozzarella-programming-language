import test from "ava";
import {
    run,
} from "../src/go";

test("'next' statement", (t) => {
    t.is(run("my n = 10; while n > 5 { n = n - 1; next; }; n"), "5");
    t.is(
        run("my n = 10; while n > 5 { n = n - 1; next; n = n + 3; }; n"),
        "5",
    );
    t.is(run('while true { last; next; }; "alive"'), '"alive"');

    {
        let program = `
            my sum = 0;
            my i = 0;
            while i < 6 {
                i = i + 1;
                if i % 2 == 0 {
                    next;
                }
                sum = sum + i;
            }
            sum;
        `;
        t.is(run(program), "9");
    }

    {
        let program = `
            my sum = 0;
            for i in [1, 2, 3, 4, 5, 6] {
                if i % 2 == 0 {
                    next;
                }
                sum = sum + i;
            }
            sum;
        `;
        t.is(run(program), "9");
    }

    t.throws(() => run("next;"));
});

