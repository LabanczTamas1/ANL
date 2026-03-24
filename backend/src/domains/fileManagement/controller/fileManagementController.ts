// ---------------------------------------------------------------------------
// File Management Controller — Kanban import/export
// ---------------------------------------------------------------------------

import { Request, Response } from 'express';
import multer from 'multer';
import { getRedisClient } from '../../../config/database.js';
import { createLogger, logError } from '../../../utils/logger.js';

const logger = createLogger('fileManagement', 'controller');

export const upload = multer({ storage: multer.memoryStorage() });

async function processNewFormat(jsonData: any): Promise<void> {
  const r = getRedisClient();
  const { kanbanTable, boardData, cardDetails } = jsonData;

  if (kanbanTable?.length) {
    const entries = kanbanTable.map((item: any) => ({
      score: Number(item.score),
      value: String(item.value),
    }));
    if (entries.length > 0) await r.zAdd('KanbanTable', entries);
  }

  if (boardData) {
    for (const [boardId, data] of Object.entries(boardData) as any) {
      await r.hSet(`Boards:${boardId}`, {
        ColumnName: data.ColumnName,
        tagColor: data.tagColor,
        CardNumber: String(data.CardNumber),
      });
    }
  }

  if (cardDetails) {
    for (const [cardId, data] of Object.entries(cardDetails) as any) {
      await r.hSet(`CardDetails:${cardId}`, {
        ColumnId: data.ColumnId,
        ContactName: data.ContactName,
        BusinessName: data.BusinessName,
        DateOfAdded: String(data.DateOfAdded),
        FirstContact: data.FirstContact,
        PhoneNumber: data.PhoneNumber,
        Email: data.Email,
        Website: data.Website,
        Instagram: data.Instagram,
        Facebook: data.Facebook,
        IsCommented: data.IsCommented,
      });

      await r.zAdd(`SortedCards:${data.ColumnId}`, {
        score: Number(data.DateOfAdded),
        value: cardId,
      });
    }
  }
}

async function processOldFormat(jsonData: any): Promise<void> {
  const r = getRedisClient();
  const lists = jsonData.lists || [];
  const cards = jsonData.cards || [];

  for (const list of lists) {
    if (!list.id || list.pos === undefined) continue;
    const posScore = Number(list.pos);
    if (isNaN(posScore)) continue;

    try {
      await r.zAdd('KanbanTable', { score: posScore, value: list.id });
      await r.hSet(`Boards:${list.id}`, {
        ColumnName: list.name || '',
        tagColor: list.color || '',
        CardNumber: String(list.cardCount || 0),
      });
    } catch (err) {
      logger.error({ err, listId: list.id }, 'Error storing list in Redis');
    }
  }

  for (const card of cards) {
    try {
      const cardId = card.id || crypto.randomUUID();
      const columnId = card.listId;

      await r.hSet(`CardDetails:${cardId}`, {
        ColumnId: columnId,
        ContactName: card.name || '',
        BusinessName: card.company || '',
        DateOfAdded: String(card.createdAt || Date.now()),
        FirstContact: card.firstContact || '',
        PhoneNumber: card.phone || '',
        Email: card.email || '',
        Website: card.website || '',
        Instagram: card.instagram || '',
        Facebook: card.facebook || '',
        IsCommented: card.hasComments ? 'true' : 'false',
      });

      await r.zAdd(`SortedCards:${columnId}`, {
        score: card.position || 0,
        value: cardId,
      });
    } catch (err) {
      logger.error({ err }, 'Error storing card in Redis');
    }
  }
}

export async function uploadFile(req: Request, res: Response): Promise<void> {
  const file = req.file;
  if (!file) {
    res.status(400).json({ error: 'No file uploaded!' });
    return;
  }

  if (file.mimetype !== 'application/json') {
    res.status(400).json({ error: 'Only JSON files are allowed!' });
    return;
  }

  try {
    const jsonData = JSON.parse(file.buffer.toString('utf8'));

    const isNewFormat = jsonData.kanbanTable && jsonData.boardData;
    const isOldFormat = jsonData.lists && jsonData.cards;

    if (!isNewFormat && !isOldFormat) {
      res.status(400).json({
        error:
          'Invalid JSON format. Must contain kanbanTable/boardData or lists/cards',
      });
      return;
    }

    if (isNewFormat) await processNewFormat(jsonData);
    else await processOldFormat(jsonData);

    res.json({
      message: 'File uploaded and processed successfully!',
      format: isNewFormat ? 'new' : 'old',
    });
  } catch (error: any) {
    logError(error, { context: 'uploadFile' });
    res.status(400).json({ error: 'Error processing JSON file: ' + error.message });
  }
}

export async function exportData(_req: Request, res: Response): Promise<void> {
  try {
    const r = getRedisClient();
    const kanbanTable = await r.zRangeWithScores('KanbanTable', 0, -1);

    const lists = [];
    for (const board of kanbanTable) {
      const boardData = await r.hGetAll(`Boards:${board.value}`);
      lists.push({
        id: board.value,
        name: boardData.ColumnName,
        pos: board.score,
        color: boardData.tagColor,
        cardCount: boardData.CardNumber,
      });
    }

    const cards = [];
    for (const board of kanbanTable) {
      const cardIds = await r.zRange(`SortedCards:${board.value}`, 0, -1);
      for (const cardId of cardIds) {
        const cardData = await r.hGetAll(`CardDetails:${cardId}`);
        cards.push({
          id: cardId,
          name: cardData.ContactName,
          company: cardData.BusinessName,
          listId: board.value,
          position: 0,
          email: cardData.Email,
          phone: cardData.PhoneNumber,
        });
      }
    }

    res.json({ lists, cards });
  } catch (error) {
    logError(error, { context: 'exportData' });
    res.status(500).json({ error: 'Failed to export data!' });
  }
}
