package org.magicfootball.classic;

/**
 * Native Java translation of pinned bank_FF.asm sub_EE35 ($EE35-$EE59).
 * Mirrors JS OriginalRandom: two 8-bit RAM cells $0045/$0046.
 * This is a port of an isolated routine, not an NES interpreter or a
 * verification of the original game's RNG seed or distribution.
 */
public final class OriginalRandom {
    private OriginalRandom() {}

    public static final class State {
        private int byte45;
        private int byte46;

        public State(int byte45, int byte46) {
            check(byte45);
            check(byte46);
            this.byte45 = byte45;
            this.byte46 = byte46;
        }

        public int byte45() { return byte45; }
        public int byte46() { return byte46; }
    }

    private static void check(int value) {
        if (value < 0 || value > 255) {
            throw new IllegalArgumentException("random state requires 8-bit bytes");
        }
    }

    /** Mutates the caller-owned state and returns the new $0045 byte. */
    public static int step(State state) {
        if (state == null) throw new IllegalArgumentException("state is null");
        int a = state.byte45;
        int b = state.byte46;
        int feedback = ((a ^ b) >>> 1) & 1;
        state.byte45 = (a >>> 1) | (feedback << 7);
        state.byte46 = (b >>> 1) | ((a & 1) << 7);
        return state.byte45;
    }
}
