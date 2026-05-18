const SHEET_ID = '1k47LHV0C0c-KVN_00M-gIss1mznLnzLmAJul8x1qTU8';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const gid = '0'; // First sheet tab
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${gid}`;

    const response = await fetch(url);
    const csv = await response.text();
    const lines = csv.split('\n');

    // Find the STORY PROMPTS section (starts with "STORY PROMPTS")
    let storyPromptsIndex = -1;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('STORY PROMPTS')) {
        storyPromptsIndex = i + 1; // Headers are on next row
        break;
      }
    }

    if (storyPromptsIndex === -1) {
      return res.status(400).json({ error: 'STORY PROMPTS section not found' });
    }

    // Parse headers from the STORY PROMPTS section
    const headerLine = lines[storyPromptsIndex];
    const headers = headerLine.split(',');

    // Parse episodes from STORY PROMPTS
    const episodes = [];
    for (let i = storyPromptsIndex + 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue; // Skip empty lines

      const values = line.split(',');
      if (values[0]) { // Only if there's a date
        episodes.push({
          date: values[0] || '',
          title: values[1] || '',
          premise: values[2] || '',
          characters: values[3] || '',
          length: values[4] || '',
          status: values[5] || 'pending',
          timestamp: new Date().toISOString(),
        });
      }
    }

    return res.status(200).json({ episodes });
  } catch (error) {
    console.error('Error reading Granny sheet:', error);
    return res.status(500).json({ error: 'Failed to read sheet', details: error.message });
  }
}
