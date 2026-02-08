import test from "ava";
import {
    run,
} from "../src/go";

test("'if' statement", (t) => {
    t.is(run("if true { 1 }"), "1");
    t.is(run("if false { 2 }"), "none");
    t.is(run('if "muffins" { 3 }'), "3");
    t.is(run('if "" { 4 }'), "none");
    t.is(run("if 5 { 6 }"), "6");
    t.is(run("if 0 { 7 }"), "none");
    t.is(run("if none { 8 }"), "none");

    t.is(run("if false { 9 } else if true { 10 }"), "10");
    t.is(run("if true { 11 } else if true { 12 }"), "11");
    t.is(run("if true { 13 } else if false { 14 }"), "13");
    t.is(run("if false { 15 } else if false { 16 }"), "none");

    t.is(run("if true { 17 } else { 18 }"), "17");
    t.is(run("if false { 19 } else { 20 }"), "20");
    t.is(run('if "muffins" { 21 } else { 22 }'), "21");
    t.is(run('if "" { 23 } else { 24 }'), "24");
    t.is(run("if 25 { 26 } else { 27 }"), "26");
    t.is(run("if 0 { 28 } else { 29 }"), "29");
    t.is(run("if none { 30 } else { 31 }"), "31");

    t.is(run("if false { 32 } else if true { 33 } else { 34 }"), "33");
    t.is(run("if false { 35 } else if false { 36 } else { 37 }"), "37");
});

