import test from "ava";
import {
    run,
} from "../src/go";

test("string operators", (t) => {
    t.is(run("~7"), '"7"');
    t.is(run("~0"), '"0"');
    t.is(run("~-5"), '"-5"');

    t.is(run('~"abc"'), '"abc"');
    t.is(run('~"  "'), '"  "');
    t.is(run('~""'), '""');

    t.is(run("~true"), '"true"');
    t.is(run("~false"), '"false"');

    t.is(run("~none"), '"none"');

    t.is(run("true ~ none ~ -6"), '"truenone-6"');
    t.is(run('0 ~ 0 ~ "" ~ false'), '"00false"');
});

