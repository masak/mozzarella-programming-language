import test from "ava";
import {
    E303_UnquoteOutsideQuoteError,
    E503_TypeError,
    run,
} from "../src/go";

test("unquote expression", (t) => {
    t.is(run("my s = code`${9}`; s"), "<syntax IntLitExpr>");
    t.is(run("my r = false; code`${r = true}`; r"), "true");
    t.is(run('my s = code`${"rhubarb"}`; s'), "<syntax StrLitExpr>");
    t.is(run("my s = code`${none}`; s"), "<syntax NoneLitExpr>");

    t.is(run("macro m(x) { return code`${x} + ${x}`; }; m(2 * 3)"), "12");
    t.is(run("macro m(x) { return code`${x} * ${x}`; }; m(4 + 5)"), "81");

    t.is(
        run("my s1 = code`if 1 { 2 }`; my s2 = code`${s1}`; s2"),
        "<syntax DoExpr>",
    );

    t.is(
        run("macro m() { my s = code`if 1 { 2 }`; return code`${s}`; }; m()"),
        "2",
    );

    {
        let program = `
            my s = code\`true\`;
            for i in [1, 2, 3] {
                s = code\`\${i} + \${do next}\`;
            }
            s
        `;

        t.is(run(program), "<syntax BoolLitExpr>");
    }

    t.is(run("my g = 0; func f() { code`1 + ${g = 51}`; }; f(); g"), "51");
    t.is(run("my g = 0; code`1 + code`2 + ${g = 98}``; g"), "0");

    {
        let program = `
            macro m1() {
                my v = 23;
                return code\`
                    macro m2() {
                        return code\` \${ \${ v } } \`;
                    }

                    m2();
                \`;
            }

            m1()
        `;

        t.is(run(program), "23");
    }

    t.throws(
        () => run("${13}"),
        { instanceOf: E303_UnquoteOutsideQuoteError },
    );
    t.throws(
        () => run("${ ${none} }"),
        { instanceOf: E303_UnquoteOutsideQuoteError },
    );
    t.throws(
        () => run("code` ${ ${7} } `"),
        { instanceOf: E303_UnquoteOutsideQuoteError },
    );
    t.throws(
        () => run("func f() {}; code` ${ f } `"),
        { instanceOf: E503_TypeError },
    );
});

