const SHEET_ID = '1k47LHV0C0c-KVN_00M-gIss1mznLnzLmAJul8x1qTU8';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const sheetName = 'STORY PROMPTS';
    const gid = '0'; // First sheet tab
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${gid}`;

    const response = await fetch(url);
    const csv = await response.text();
    const lines = csv.split('\n');

    const headers = lines[0].split(',');
    const episodes = lines.slice(1)
      .filter(line => line.trim())
      .map((line, idx) => {
        const values = line.split(',');
        return {
          date: values[0] || '',
          title: values[1] || '',
          premise: values[2] || '',
          characters: values[3] || '',
          length: values[4] || '',
          status: values[7] || 'pending',
          timestamp: values[8] || '',
        };
      });

    return res.status(200).json({ episodes });
  } catch (error) {
    console.error('Error reading Granny sheet:', error);
    return res.status(500).json({ error: 'Failed to read sheet', details: error.message });
  }
}
