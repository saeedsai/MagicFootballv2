package org.magicfootball.classic;

/** Exhaustive per-row two-plane graphics vectors, without original CHR data. */
public final class OriginalChrDecoderTest {
    private static void eq(int actual, int expected, String where) {
        if (actual != expected) throw new AssertionError(where + ": " + actual + " != " + expected);
    }

    public static void main(String[] args) {
        byte[] source = new byte[32];
        eq(OriginalChrDecoder.tileCount(source), 2, "tile count");
        for (int low = 0; low < 256; low++) {
            for (int high = 0; high < 256; high++) {
                source[16] = (byte) low;
                source[24] = (byte) high;
                byte[] pixels = OriginalChrDecoder.decodeTile(source, 1);
                for (int x = 0; x < 8; x++) {
                    int expected = ((low >>> (7 - x)) & 1) | (((high >>> (7 - x)) & 1) << 1);
                    eq(pixels[x] & 255, expected, "2bpp pixel");
                }
                for (int x = 8; x < 64; x++) eq(pixels[x], 0, "non-first row");
            }
        }
        try { OriginalChrDecoder.decodeTile(source, 2); throw new AssertionError("missing index check"); }
        catch (IllegalArgumentException expected) { /* expected */ }
        try { OriginalChrDecoder.tileCount(new byte[15]); throw new AssertionError("missing alignment check"); }
        catch (IllegalArgumentException expected) { /* expected */ }
        System.out.println("PASS: Java CHR 2bpp decode, 65,536 exhaustive low/high tile-row patterns");
    }
}
