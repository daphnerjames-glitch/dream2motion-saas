export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Token is stored client-side, so logout just confirms the action
  return res.status(200).json({ message: 'Logged out successfully' });
}
