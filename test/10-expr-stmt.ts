import test from "ava";
import {
    run,
} from "../src/run";

test("expression statements", (t) => {
    t.is(run("12345;"), "12345");
    t.is(run('"abc";'), '"abc"');
    t.is(run("false;"), "false");
    t.is(run("none;"), "none");
    t.is(run("102 % 5;"), "2");
    t.is(run('0 ~ 0 ~ "" ~ false;'), '"00false"');
    t.is(run('"moo" && true;'), "true");
    t.is(run('"crab" <= "fusion" <= "indigo";'), "true");
    t.is(run("3 <= 6 == 9 <= 6;"), "false");
    t.is(run("3 < (7 && 1) < 4;"), "false");
});

