import test from "ava";
import {
    run,
} from "../src/run";

test("'do' expression", (t) => {
    t.is(run("do 42"), "42");
    t.is(run("do ;"), "none");
    t.is(run("(do ;) == none"), "true");
    t.is(run("do ; == none"), "true");
    t.is(run("do { 1; 2; 3 }"), "3");
    t.is(run("do true || none"), "true");
    t.is(run("{ 1; do 2 }"), "2");
    t.is(run("{ 1; do 2; }"), "2");
    t.is(run("{ 1; do { 2 } }"), "2");
    t.is(run("{ 1; do { 2; } }"), "2");

    t.throws(() => run("do 1 2"));
    t.throws(() => run("do 1; 2"));
});

