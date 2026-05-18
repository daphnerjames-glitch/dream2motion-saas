import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() =