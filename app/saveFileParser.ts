import uzip from 'uzip';

const inventoryPatternRegex = new RegExp(
  '/Game/Characters/Player/Base/Character_Master_Player.Character_Master_Player_C(?<inventory>.*?)Character_Master_Player_C',
  'gs',
);
// const itemRegex = [
//   /\/Items\/Trinkets\/(?<itemType>\w+)\/(?:\w+\/)+(?<itemName>\w+)(?:\.|$)/g, // rings and amulets
//   /\/Items\/(?<itemType>Mods)\/\w+\/(?<itemName>\w+)(?:\.|$)/g, // weapon mods
//   /\/Items\/(?<itemType>Archetypes)\/\w+\/(?<itemName>Archetype_\w+)(?:\.|$)/g, // archetypes
//   /\/Items\/Archetypes\/(?<archetypeName>\w+)\/(?<itemType>\w+)\/\w+\/(?<itemName>\w+)(?:\.|$)/g, // perks and skills
//   /\/Items\/(?<itemType>Traits)\/(?<traitType>\w+?\/)?\w+?\/(?<itemName>\w+)(?:\.|$)/g, // traits
//   /\/Items\/Archetypes\/(?<archetypeName>\w+)\/PerksAnd(?<itemType>Traits)\/(?<itemName>\w+)/g, // archetype traits dlc2
//   /\/Items\/Archetypes\/(?<armorSet>\w+)\/(?<itemType>Armor)\/(?<itemName>\w+)(?:\.|$)/g, // armors
//   /\/Items\/(?<itemType>Armor)\/(?:\w+\/)?(?:(?<armorSet>\w+)\/)?(?<itemName>\w+)(?:\.|$)/g, // armor
//   /\/Items\/(?<itemType>Weapons)\/(?:\w+\/)+(?<itemName>\w+)(?:\.|$)/g, // weapons
//   /\/Items\/(?<itemType>Gems)\/(?:\w+\/)+(?<itemName>\w+)(?:\.|$)/g, // gems
//   /\/Items\/Armor\/(?:\w+\/)?(?<itemType>Relic)Testing\/(?:\w+\/)+(?<itemName>\w+)(?:\.|$)/g, // relics
//   /\/Items\/(?<itemType>Relics)\/(?:\w+\/)+(?<itemName>\w+)(?:\.|$)/g, // relics
//   /\/Items\/Materials\/(?<itemType>Engrams)\/(?<itemName>\w+)(?:\.|$)/g, // engrams
//   /(?<itemType>Quests)\/Quest_\w+\/Items\/(?<itemName>\w+)(?:\.|$)/g, // quest items
//   /\/Items\/(?<itemType>Materials)\/World\/\w+\/(?<itemName>\w+)(?:\.|$)/g, // materials
// ];

export type Character = {
  inventory: string[];
};

/**
 * Processes a Remnant game save, either from a buffer or a file path.
 * @param input Buffer containing the save data or a string containing the file path.
 * @returns Promise with an object containing the type and characters of the save.
 */
export async function processRemnantSave(
  data: Uint8Array,
  itemData: Array<{ name: string; saveFileSlug: string }>,
): Promise<Array<Character>> {
  const decodedData = await decompressSave(data);
  const characters = extractCharacters(decodedData, itemData);

  return characters;
}

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
function extractCharacters(
  data: string,
  itemData: Array<{ name: string; saveFileSlug: string }>,
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
    for (const item of itemData) {
      if (inventory.includes(item.saveFileSlug)) {
        items.push(item.name);
      }
    }

    characters.push({
      inventory: items,
    });
  }
  console.log('characters: ', characters);
  return characters;
}
