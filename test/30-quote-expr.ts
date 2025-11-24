import test from "ava";
import {
    run,
} from "../src/go";

test("quote expression", (t) => {
    t.is(run("my s = code`9`; s"), "<syntax IntLitExpr>");
    t.is(run("my s = code`1 + 2`; s"), "<syntax InfixOpExpr>");
    t.is(run("my s = code`-1000`; s"), "<syntax PrefixOpExpr>");
    t.is(run("my s = code`code`31``; s"), "<syntax QuoteExpr>");
    t.is(run("my s = code`do { 1; 2; }`; s"), "<syntax DoExpr>");

    t.is(run("my s = code`if 1 { 2 }`; s"), "<syntax IfStatement>");
    t.is(run("my s = code`{}`; s"), "<syntax BlockStatement>");
    t.is(run("my s = code`next;`; s"), "<syntax NextStatement>");
    t.is(run("my s = code`last`; s"), "<syntax LastStatement>");

    t.is(run("my s = code``; s"), "<syntax Block>");
    t.is(run("my s = code`1; 2;`; s"), "<syntax Block>");

    t.is(run('my x; { my s = code`x`; my x = 2; }; "alive"'), '"alive"');
    t.is(run('my x; { my s = code`x = 1`; my x = 2; }; "alive"'), '"alive"');

    t.is(run("macro m() { return code`1 + 2`; }; m()"), "3");
    t.is(run("macro m() { code`1 + 2`; }; m()"), "none");
    t.is(run("macro m() { return code`if 1 { 2 }`; }; m()"), "2");
    t.is(run("macro m() { return code`if 3 { 4 } else { 5 }`; }; m()"), "4");
    t.is(run("macro m() { return code`if 0 { 6 } else { 7 }`; }; m()"), "7");
    t.is(run("macro m() { code``; }; m()"), "none");

    {
        let program = `
            macro m() {
                return code\`next\`;
            }

            my array = [-1, -1, -1];
            for i in [0, 1, 2] {
                m();
                array[i] = i;
            }

            array
        `;

        t.is(run(program), "[-1, -1, -1]");
    }

    {
        let program = `
            macro m() {
                return code\`last\`;
            }

            my array = [-1, -1, -1];
            for i in [0, 1, 2] {
                array[i] = i;
                m();
            }

            array
        `;

        t.is(run(program), "[0, -1, -1]");
    }

    {
        let program = `
            macro m() {
                return code\`return\`;
            }

            my x = "unchanged";
            my y = "unchanged";

            func f() {
                x = "changed";
                m();
                y = "changed";
            }

            f();

            [x, y]
        `;

        t.is(run(program), '["changed", "unchanged"]');
    }

    {
        let program = `
            macro m() {
                return code\`
                    func g() {
                        return 7;
                    }

                    g();
                \`;
            }

            m();
        `;

        t.is(run(program), "7");
    }

    t.is(run("my code = false; code || !code"), "true");

    t.is(run("macro m(x) { return x; }; m(12)"), "12");
    t.is(run("macro m(x) { return x; }; code`m(12)`"), "<syntax CallExpr>");
    t.is(run("macro m(x) { return x; }; code`m(false)`"), "<syntax CallExpr>");
});

