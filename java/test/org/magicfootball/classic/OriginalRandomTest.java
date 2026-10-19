package org.magicfootball.classic;

/** Dependency-free Java/JS algorithm equivalence vectors across every 16-bit state. */
public final class OriginalRandomTest {
    private static void eq(int actual, int expected, String where) {
        if (actual != expected) throw new AssertionError(where + ": " + actual + " != " + expected);
    }

    public static void main(String[] args) {
        for (int a = 0; a < 256; a++) {
            for (int b = 0; b < 256; b++) {
                OriginalRandom.State s = new OriginalRandom.State(a, b);
                int x = OriginalRandom.step(s);
                int expected45 = (a >>> 1) | ((((a ^ b) >>> 1) & 1) << 7);
                int expected46 = (b >>> 1) | ((a & 1) << 7);
                eq(x, expected45, "returned state byte45");
                eq(s.byte45(), expected45, "state byte45");
                eq(s.byte46(), expected46, "state byte46");
            }
        }
        OriginalRandom.State zero = new OriginalRandom.State(0, 0);
        for (int i = 0; i < 100; i++) eq(OriginalRandom.step(zero), 0, "zero state");
        try {
            new OriginalRandom.State(256, 0);
            throw new AssertionError("missing state bound check");
        } catch (IllegalArgumentException expected) { /* expected */ }
        System.out.println("PASS: 65,536 exhaustive original RNG state transitions + input checks");
    }
}
