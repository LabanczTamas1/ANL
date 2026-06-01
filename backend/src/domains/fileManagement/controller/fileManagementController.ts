// ---------------------------------------------------------------------------
// File Management Controller — Kanban import/export (PostgreSQL)
// ---------------------------------------------------------------------------

import { Request, Response } from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { query, execute } from '../../../utils/db.js';
import { createLogger, logError } from '../../../utils/logger.js';

const logger = createLogger('fileManagement', 'controller');

export const upload = multer({ storage: multer.memoryStorage() });

async function processNewFormat(jsonData: any): Promise<void> {
  const { kanbanTable, boardData, cardDetails } = jsonData;

  if (kanbanTable?.length) {
    for (const item of kanbanTable) {
      const colId = String(item.value);
      const board = boardData?.[colId];
      await execute(
        `INSERT INTO kanban_columns (id, column_name, tag_color, priority, card_count)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (id) DO UPDATE SET column_name = $2, tag_color = $3, priority = $4, card_count = $5`,
        [colId, board?.ColumnName || '', board?.tagColor || '', Number(item.score), Number(board?.CardNumber || 0)],
      );
    }
  }

  if (cardDetails) {
    for (const [cardId, data] of Object.entries(cardDetails) as any) {
      const fieldsJson = data.Fields ? JSON.stringify(
        typeof data.Fields === 'string' ? JSON.parse(data.Fields) : data.Fields
      ) : null;

      await execute(
        `INSERT INTO kanban_cards (id, column_id, name, sort_order, is_commented, contact_name,
           business_name, first_contact, phone_number, email, website, instagram, facebook, fields)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
         ON CONFLICT (id) DO UPDATE SET column_id = $2, name = $3, sort_order = $4`,
        [
          cardId, data.ColumnId, data.Name || data.ContactName || '', Number(data.DateOfAdded || 0),
          data.IsCommented === 'true' || data.IsCommented === true,
          data.ContactName || '', data.BusinessName || '', data.FirstContact || '',
          data.PhoneNumber || '', data.Email || '', data.Website || '',
          data.Instagram || '', data.Facebook || '', fieldsJson,
        ],
      );
    }
  }
}

async function processOldFormat(jsonData: any): Promise<void> {
  const lists = jsonData.lists || [];
  const cards = jsonData.cards || [];

  for (const list of lists) {
    if (!list.id || list.pos === undefined) continue;
    const posScore = Number(list.pos);
    if (isNaN(posScore)) continue;

    try {
      await execute(
        `INSERT INTO kanban_columns (id, column_name, tag_color, priority, card_count)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (id) DO UPDATE SET column_name = $2, tag_color = $3, priority = $4, card_count = $5`,
        [list.id, list.name || '', list.color || '', posScore, Number(list.cardCount || 0)],
      );
    } catch (err) {
      logger.error({ err, listId: list.id }, 'Error storing list');
    }
  }

  for (const card of cards) {
    try {
      const cardId = card.id || uuidv4();
      await execute(
        `INSERT INTO kanban_cards (id, column_id, name, sort_order, is_commented, contact_name,
           business_name, first_contact, phone_number, email, website, instagram, facebook)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
         ON CONFLICT (id) DO UPDATE SET column_id = $2, name = $3`,
        [
          cardId, card.listId, card.name || '', Number(card.position || 0),
          card.hasComments === true,
          card.name || '', card.company || '', card.firstContact || '',
          card.phone || '', card.email || '', card.website || '',
          card.instagram || '', card.facebook || '',
        ],
      );
    } catch (err) {
      logger.error({ err }, 'Error storing card');
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
        error: 'Invalid JSON format. Must contain kanbanTable/boardData or lists/cards',
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
    const columns = await query(
      `SELECT id, column_name, tag_color, priority, card_count
       FROM kanban_columns ORDER BY priority ASC`,
    );

    const lists = columns.map((c: any) => ({
      id: c.id,
      name: c.column_name,
      pos: c.priority,
      color: c.tag_color,
      cardCount: c.card_count,
    }));

    const allCards = await query(
      `SELECT id, column_id, name, contact_name, business_name, sort_order,
              phone_number, email
       FROM kanban_cards ORDER BY sort_order ASC`,
    );

    const cards = allCards.map((c: any) => ({
      id: c.id,
      name: c.contact_name || c.name,
      company: c.business_name,
      listId: c.column_id,
      position: c.sort_order,
      email: c.email,
      phone: c.phone_number,
    }));

    res.json({ lists, cards });
  } catch (error) {
    logError(error, { context: 'exportData' });
    res.status(500).json({ error: 'Failed to export data!' });
  }
}
