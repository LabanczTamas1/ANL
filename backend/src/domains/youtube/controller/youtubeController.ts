import { Request, Response } from 'express';
import { getRedisClient } from '../../../config/database.js';
import { createLogger, logError } from '../../../utils/logger.js';

const logger = createLogger('youtube', 'controller');

const CHANNEL_HANDLE = '@Ads_AndLeads';
const CACHE_KEY = 'youtube:videos:latest';
const CHANNEL_ID_CACHE_KEY = 'youtube:channelId:AdsAndLeads';
const VIDEO_CACHE_TTL = 3600;       // 1 hour
const CHANNEL_ID_CACHE_TTL = 86400; // 24 hours

interface VideoItem {
  id: string;
  title: string;
  thumbnail: string;
  publishedAt: string;
}

async function resolveChannelId(): Promise<string> {
  const r = getRedisClient();
  const cached = await r.get(CHANNEL_ID_CACHE_KEY);
  if (cached) return cached;

  const response = await fetch(`https://www.youtube.com/${CHANNEL_HANDLE}`, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept-Language': 'en-US,en;q=0.9',
    },
  });

  const html = await response.text();

  const patterns = [
    /"channelId":"([A-Za-z0-9_-]{24})"/,
    /"externalId":"([A-Za-z0-9_-]{24})"/,
    /\/channel\/([A-Za-z0-9_-]{24})/,
  ];

  let channelId: string | null = null;
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) {
      channelId = match[1];
      break;
    }
  }

  if (!channelId) {
    throw new Error('Could not resolve YouTube channel ID from handle');
  }

  logger.info({ channelId }, 'Resolved YouTube channel ID');
  await r.setEx(CHANNEL_ID_CACHE_KEY, CHANNEL_ID_CACHE_TTL, channelId);
  return channelId;
}

async function fetchVideosFromRss(channelId: string): Promise<VideoItem[]> {
  const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
  const response = await fetch(rssUrl);
  if (!response.ok) {
    throw new Error(`YouTube RSS feed responded with ${response.status}`);
  }

  const xml = await response.text();
  const videos: VideoItem[] = [];
  const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
  let match: RegExpExecArray | null;

  while ((match = entryRegex.exec(xml)) !== null) {
    const entry = match[1];
    const idMatch = entry.match(/<yt:videoId>([^<]+)<\/yt:videoId>/);
    const titleMatch =
      entry.match(/<title><!\[CDATA\[([^\]]*)\]\]><\/title>/) ||
      entry.match(/<title>([^<]*)<\/title>/);
    const publishedMatch = entry.match(/<published>([^<]+)<\/published>/);

    if (idMatch && titleMatch) {
      const id = idMatch[1].trim();
      videos.push({
        id,
        title: titleMatch[1].trim(),
        thumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
        publishedAt: publishedMatch ? publishedMatch[1].trim() : '',
      });
    }

    if (videos.length >= 6) break;
  }

  return videos;
}

export async function getLatestVideos(_req: Request, res: Response): Promise<void> {
  try {
    const r = getRedisClient();
    const cached = await r.get(CACHE_KEY);
    if (cached) {
      res.json(JSON.parse(cached));
      return;
    }

    const channelId = await resolveChannelId();
    const videos = await fetchVideosFromRss(channelId);
    await r.setEx(CACHE_KEY, VIDEO_CACHE_TTL, JSON.stringify(videos));
    res.json(videos);
  } catch (err) {
    logError(err, { context: 'getLatestVideos' });
    res.status(500).json({ error: 'Failed to fetch YouTube videos' });
  }
}
