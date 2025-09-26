import test from "ava";
import {
    run,
} from "../src/run";

test("integer operators", (t) => {
    t.is(run("10203 + 4050"), "14253");
    t.is(run("+777"), "777");
    t.is(run("1000 - 400"), "600");
    t.is(run("200 - 700"), "-500");
    t.is(run("-54321"), "-54321");
    t.is(run("111 * 111"), "12321");
    t.is(run("100 // 5"), "20");
    t.is(run("102 // 5"), "20");
    t.is(run("97 // 5"), "19");
    t.is(run("100 % 5"), "0");
    t.is(run("102 % 5"), "2");
    t.is(run("98 % 5"), "3");

    t.throws(() => run("5 // 0"));
    t.throws(() => run("19 % 0"));
});

