import test from "ava";
import {
    run,
} from "../src/go";

test("boolean operators", (t) => {
    t.is(run("?0"), "false");
    t.is(run("?5"), "true");
    t.is(run('?""'), "false");
    t.is(run('?"gorgonzola"'), "true");
    t.is(run("?true"), "true");
    t.is(run("?false"), "false");

    t.is(run("!0"), "true");
    t.is(run("!5"), "false");
    t.is(run('!""'), "true");
    t.is(run('!"gorgonzola"'), "false");
    t.is(run("!true"), "false");
    t.is(run("!false"), "true");

    t.is(run("5 && 0"), "0");
    t.is(run("0 && 5"), "0");
    t.is(run('true && "moo"'), '"moo"');
    t.is(run('"moo" && true'), "true");
    t.is(run('false && "blue"'), "false");
    t.is(run('"blue" && false'), "false");

    t.is(run("5 || 0"), "5");
    t.is(run("0 || 5"), "5");
    t.is(run('true || "moo"'), "true");
    t.is(run('"moo" || true'), '"moo"');
    t.is(run('false || "blue"'), '"blue"');
    t.is(run('"blue" || false'), '"blue"');
});

