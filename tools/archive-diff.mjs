/** Compare archived Git blob identities with a GitHub tree; never infer history restoration. */
export function compareArchivedTree(manifest, remoteFiles) {
  if (!Number.isInteger(manifest?.trackedFileCount) ||
      !Array.isArray(manifest.files) ||
      manifest.files.length !== manifest.trackedFileCount) {
    throw new Error('Invalid archived manifest count');
  }
  const expected = new Map();
  for (const entry of manifest.files) {
    if (typeof entry.path !== 'string' || !entry.path ||
        !/^[0-9a-f]{40}$/.test(entry.blobSha) || expected.has(entry.path)) {
      throw new Error('Invalid or duplicate archived path/blob');
    }
    expected.set(entry.path, entry.blobSha);
  }
  if (remoteFiles == null || typeof remoteFiles[Symbol.iterator] !== 'function') {
    throw new TypeError('Remote Git entries must be iterable');
  }
  const actual = new Map();
  for (const entry of remoteFiles) {
    if (!Array.isArray(entry) || entry.length !== 2 ||
        typeof entry[0] !== 'string' || !entry[0] ||
        typeof entry[1] !== 'string' || !/^[0-9a-f]{40}$/.test(entry[1]) ||
        actual.has(entry[0])) {
      throw new Error('Invalid or duplicate remote path/blob');
    }
    actual.set(entry[0], entry[1]);
  }
  const exact = [], changed = [], missing = [], added = [];
  for (const [path, sha] of expected) {
    if (!actual.has(path)) missing.push(path);
    else if (actual.get(path) === sha) exact.push(path);
    else changed.push(path);
  }
  for (const path of actual.keys()) if (!expected.has(path)) added.push(path);
  return {
    archived: expected.size, remote: actual.size,
    exact, changed, missing, added,
    completeTreeMatch: missing.length === 0 && changed.length === 0,
    originalGitAncestryRestored: false
  };
}
