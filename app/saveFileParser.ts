import uzip from 'uzip';

const inventoryPatternRegex = new RegExp(
  '/Game/Characters/Player/Base/Character_Master_Player.Character_Master_Player_C(?<inventory>.*?)Character_Master_Player_C',
  'gs',
);

export type Character = {
  inventory: string[];
};

export async function decompressSave(rawData: Uint8Array): Promise<string> {
  const dataView = new DataView(rawData.buffer);
  // const crc32 = dataView.getUint32(0, true);
  const totalSize = dataView.getUint32(4, true);
  // const unknown = dataView.getUint32(8, true);

  let decompressedData = new Uint8Array(totalSize);

  let decompressedOffset = 0;
  let offset = 12;
  while (offset < rawData.length) {
    // const chunkHeaderTag = dataView.getBigUint64(offset, true);
    // const chunkSize = dataView.getBigUint64(offset + 8, true);
    // const decompressionMethod = dataView.getUint8(offset + 16);
    const compressedSize1 = dataView.getBigUint64(offset + 17, true);
    const decompressedSize1 = dataView.getBigUint64(offset + 25, true);
    // const compressedSize2 = dataView.getBigUint64(offset + 33, true);
    // const decompressedSize2 = dataView.getBigUint64(offset + 41, true);
    offset += 49; // Advance past the header

    const sizeToDecompress = Number(compressedSize1);
    // Read the compressed data
    const compressedData = rawData.subarray(offset, offset + sizeToDecompress);
    offset += sizeToDecompress;

    // Decompress the data
    const decompressedChunk = uzip.inflate(compressedData);

    // Copy decompressed data to the correct position in the total buffer
    decompressedData.set(decompressedChunk, decompressedOffset);
    decompressedOffset += Number(decompressedSize1);
  }

  const textDecoder = new TextDecoder('ascii');

  return textDecoder.decode(decompressedData);
}

/**
 * Extracts character information from the save data.
 * @param data Buffer of the save file data.
 * @returns Array containing characters.
 */
export function extractCharacters(
  data: string,
  collectibles: Array<{ name: string; saveFileFlag: string }>,
): Array<Character> {
  const characters: Character[] = [];

  const matches = data.matchAll(inventoryPatternRegex);

  for (const match of matches) {
    const inventory = match.groups?.inventory;
    // print match start and end idx
    if (!inventory) {
      console.warn('No inventory found for character');
      continue;
    }

    const items: Array<string> = [];
    for (const item of collectibles) {
      if (inventory.includes(item.saveFileFlag)) {
        items.push(item.name);
      }
    }

    characters.push({
      inventory: items,
    });
  }
  return characters;
}
