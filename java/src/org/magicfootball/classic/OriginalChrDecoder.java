package org.magicfootball.classic;

/**
 * Native Java NES 2-bitplane 8x8 tile decoder mirroring NesBinaryAssets.decodeTile.
 * Expects externally supplied CHR bytes; contains no proprietary artwork.
 * Sprite attributes, palettes, OAM, and frame timing are separate and unverified.
 */
public final class OriginalChrDecoder {
    private OriginalChrDecoder() {}

    public static int tileCount(byte[] chr) {
        if (chr == null || chr.length % 16 != 0)
            throw new IllegalArgumentException("CHR data must be 16-byte tile aligned");
        return chr.length / 16;
    }

    /** Returns 64 palette indexes (0..3), row-major, not final RGBA pixels. */
    public static byte[] decodeTile(byte[] chr, int tileIndex) {
        int count = tileCount(chr);
        if (tileIndex < 0 || tileIndex >= count)
            throw new IllegalArgumentException("Tile index outside CHR data");
        byte[] pixels = new byte[64];
        int base = tileIndex * 16;
        for (int y = 0; y < 8; y++) {
            int low = chr[base + y] & 255;
            int high = chr[base + y + 8] & 255;
            for (int x = 0; x < 8; x++) {
                int bit = 7 - x;
                pixels[y * 8 + x] = (byte) (((low >>> bit) & 1) | (((high >>> bit) & 1) << 1));
            }
        }
        return pixels;
    }
}
