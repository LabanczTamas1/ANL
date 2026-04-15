// ---------------------------------------------------------------------------
// Kanban Controller — columns, cards, comments
// ---------------------------------------------------------------------------

import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getRedisClient } from '../../../config/database.js';
import { createLogger, logError } from '../../../utils/logger.js';

const logger = createLogger('kanban', 'controller');

// ---- Activity Logging Helper ----

async function logActivity(
  cardId: string,
  action: string,
  userName: string,
  details?: string,
): Promise<void> {
  try {
    const r = getRedisClient();
    const entry = JSON.stringify({
      action,
      userName,
      details: details || '',
      timestamp: Date.now(),
    });
    await r.lPush(`CardActivity:${cardId}`, entry);
  } catch (err) {
    logError(err, { context: 'logActivity', cardId });
  }
}

// ---- Columns ----

export async function createColumn(req: Request, res: Response): Promise<void> {
  const { priority, tagColor, columnName, cardNumbers } = req.body;
  try {
    const r = getRedisClient();
    const columnId = uuidv4();

    await r.zAdd('KanbanTable', { score: priority, value: columnId });
    await r.hSet(`Boards:${columnId}`, {
      ColumnName: columnName,
      tagColor: tagColor,
      CardNumber: String(cardNumbers),
    });

    res.json({ columnId, tagColor, columnName, priority, cardNumbers });
  } catch (error) {
    logError(error, { context: 'createColumn' });
    res.status(500).json({ error: 'Failed to save column' });
  }
}

export async function getColumns(_req: Request, res: Response): Promise<void> {
  try {
    const r = getRedisClient();
    const columnIds = await r.zRange('KanbanTable', 0, -1);

    const columnDetails = await Promise.all(
      columnIds.map(async (columnId) => {
        const details = await r.hGetAll(`Boards:${columnId}`);
        return { columnId, ...details };
      }),
    );

    res.json({ columns: columnDetails });
  } catch (error) {
    logError(error, { context: 'getColumns' });
    res.status(500).json({ error: 'Failed to fetch columns' });
  }
}

export async function updateColumnPriority(req: Request, res: Response): Promise<void> {
  const columns = req.body.columns;
  if (!Array.isArray(columns) || columns.length === 0) {
    res.status(400).json({ error: 'Invalid request: columns array is required' });
    return;
  }

  try {
    const r = getRedisClient();
    await Promise.all(
      columns.map((col: { columnId: string; priority: number }) =>
        r.zAdd('KanbanTable', { score: col.priority, value: col.columnId }),
      ),
    );
    res.status(200).json({ success: true, message: 'Priorities updated successfully' });
  } catch (error) {
    logError(error, { context: 'updateColumnPriority' });
    res.status(500).json({ error: 'Failed to update priority' });
  }
}

export async function deleteColumn(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  try {
    const r = getRedisClient();
    await r.zRem('KanbanTable', id);
    await r.del(`Boards:${id}`);
    res.status(200).json({ success: true, message: 'Column deleted successfully' });
  } catch (error) {
    logError(error, { context: 'deleteColumn' });
    res.status(500).json({ error: 'Failed to delete column' });
  }
}

// ---- Cards ----

export async function createCard(req: Request, res: Response): Promise<void> {
  const {
    name, isCommented, columnId, contactName, businessName, firstContact,
    phoneNumber, email, website, instagram, facebook,
  } = req.body;

  if (!name || !columnId) {
    res.status(400).json({ error: 'Card name and column ID are required' });
    return;
  }

  try {
    const r = getRedisClient();
    const cardId = uuidv4();
    const timestamp = Date.now();

    await r.zAdd(`SortedCards:${columnId}`, [{ score: timestamp, value: cardId }]);

    const columnData = await r.hGetAll(`Boards:${columnId}`);
    await r.hSet(`Boards:${columnId}`, {
      CardNumber: String(parseInt(columnData.CardNumber, 10) + 1),
    });

    // Support dynamic fields
    const { fields, templateId } = req.body;

    const hash: Record<string, string> = {
      ColumnId: columnId,
      Name: name,
      DateOfAdded: String(timestamp),
      IsCommented: String(isCommented ?? false),
    };

    if (fields && Array.isArray(fields)) {
      // new-style dynamic fields
      hash.Fields = JSON.stringify(fields);
      if (templateId) hash.TemplateId = templateId;
    } else {
      // legacy hardcoded fields
      hash.ContactName = contactName || '';
      hash.BusinessName = businessName || '';
      hash.FirstContact = firstContact || '';
      hash.PhoneNumber = phoneNumber || '';
      hash.Email = email || '';
      hash.Website = website || '';
      hash.Instagram = instagram || '';
      hash.Facebook = facebook || '';
    }

    await r.hSet(`CardDetails:${cardId}`, hash);

    // Update LastUsedAt on the template so it sorts to the top next time
    if (templateId) {
      const templateExists = await r.exists(`KanbanTemplate:${templateId}`);
      if (templateExists) {
        await r.hSet(`KanbanTemplate:${templateId}`, 'LastUsedAt', String(timestamp));
      }
    }

    // Log activity
    const userName =
      (req as any).user?.firstName && (req as any).user?.lastName
        ? `${(req as any).user.firstName} ${(req as any).user.lastName}`
        : 'Unknown';
    await logActivity(cardId, 'created', userName, `Card "${name}" created`);

    res.status(200).json({ message: 'Card saved successfully', cardId });
  } catch (error) {
    logError(error, { context: 'createCard' });
    res.status(500).json({ error: 'Failed to save card' });
  }
}

export async function updateCard(req: Request, res: Response): Promise<void> {
  const { name, updatedValue } = req.body;
  const { cardId } = req.params;

  if (!name || !updatedValue) {
    res.status(400).json({ error: 'Input field id and value are missing' });
    return;
  }

  try {
    const r = getRedisClient();

    // Support updating dynamic Fields array
    if (name === 'Fields' && typeof updatedValue === 'object') {
      await r.hSet(`CardDetails:${cardId}`, 'Fields', JSON.stringify(updatedValue));
    } else {
      await r.hSet(`CardDetails:${cardId}`, name, updatedValue);
    }

    // Log activity
    const userName =
      (req as any).user?.firstName && (req as any).user?.lastName
        ? `${(req as any).user.firstName} ${(req as any).user.lastName}`
        : 'Unknown';
    await logActivity(cardId, 'updated', userName, `Updated field "${name}"`);

    res.status(200).json({ message: 'Update was successful', cardId });
  } catch (error) {
    logError(error, { context: 'updateCard' });
    res.status(500).json({ error: 'Failed to save card' });
  }
}

export async function deleteCard(req: Request, res: Response): Promise<void> {
  const { cardId } = req.params;
  const { columnId } = req.body;

  if (!columnId) {
    res.status(400).json({ error: 'Column ID is required' });
    return;
  }

  try {
    const r = getRedisClient();
    const cardExists = await r.exists(`CardDetails:${cardId}`);
    if (!cardExists) {
      res.status(404).json({ error: 'Card not found' });
      return;
    }

    await r.zRem(`SortedCards:${columnId}`, cardId);
    await r.del(`CardDetails:${cardId}`);

    const columnData = await r.hGetAll(`Boards:${columnId}`);
    await r.hSet(`Boards:${columnId}`, {
      CardNumber: String(parseInt(columnData.CardNumber, 10) - 1),
    });

    res.status(200).json({ message: 'Card deleted successfully' });
  } catch (error) {
    logError(error, { context: 'deleteCard' });
    res.status(500).json({ error: 'An error occurred while deleting the card' });
  }
}

export async function getCards(req: Request, res: Response): Promise<void> {
  const { columnId } = req.params;
  try {
    const r = getRedisClient();
    const cardIds = await r.zRange(`SortedCards:${columnId}`, 0, -1);
    const cardDetails = await Promise.all(
      cardIds.map((id) => r.hGetAll(`CardDetails:${id}`)),
    );
    res.json({ cardDetails, cardIds });
  } catch (error) {
    logError(error, { context: 'getCards' });
    res.status(500).json({ error: 'Failed to fetch cards' });
  }
}

export async function moveCard(req: Request, res: Response): Promise<void> {
  const { sourceColumnId, destinationColumnId, cardId, newIndex } = req.body;

  if (!sourceColumnId || !destinationColumnId || !cardId || newIndex === undefined) {
    res.status(400).json({ error: 'Invalid request body' });
    return;
  }

  try {
    const r = getRedisClient();
    const srcKey = `SortedCards:${sourceColumnId}`;
    const dstKey = `SortedCards:${destinationColumnId}`;

    if (sourceColumnId !== destinationColumnId) {
      await r.zRem(srcKey, cardId);
    }

    await r.zAdd(dstKey, [{ score: newIndex, value: cardId }]);

    const destinationCards = await r.zRangeWithScores(dstKey, 0, -1);
    const reordered = destinationCards.filter((c) => c.value !== cardId);
    reordered.splice(newIndex, 0, { score: newIndex, value: cardId });

    for (let i = 0; i < reordered.length; i++) reordered[i].score = i;

    await r.zRemRangeByRank(dstKey, 0, -1);
    for (const card of reordered) {
      await r.zAdd(dstKey, [{ score: card.score, value: card.value }]);
    }

    const timestamp = Date.now();
    await r.hSet(`CardDetails:${cardId}`, {
      ColumnId: destinationColumnId,
      DateOfAdded: String(timestamp),
    });

    if (sourceColumnId !== destinationColumnId) {
      const dstData = await r.hGetAll(`Boards:${destinationColumnId}`);
      await r.hSet(`Boards:${destinationColumnId}`, {
        CardNumber: String(parseInt(dstData.CardNumber, 10) + 1),
      });
      const srcData = await r.hGetAll(`Boards:${sourceColumnId}`);
      await r.hSet(`Boards:${sourceColumnId}`, {
        CardNumber: String(parseInt(srcData.CardNumber, 10) - 1),
      });
    }

    // Log activity
    const userName =
      (req as any).user?.firstName && (req as any).user?.lastName
        ? `${(req as any).user.firstName} ${(req as any).user.lastName}`
        : 'Unknown';
    await logActivity(cardId, 'moved', userName,
      sourceColumnId === destinationColumnId
        ? 'Reordered within column'
        : `Moved from column ${sourceColumnId} to ${destinationColumnId}`);

    res.status(200).json({ message: 'Card priority updated successfully' });
  } catch (error) {
    logError(error, { context: 'moveCard' });
    res.status(500).json({ error: 'Failed to update card priority' });
  }
}

// ---- Comments ----

export async function createComment(req: Request, res: Response): Promise<void> {
  const { userName, body } = req.body;
  const { cardId } = req.params;

  try {
    const r = getRedisClient();
    const commentId = uuidv4();
    const timestamp = Date.now();

    await r.hSet(`Comments:${commentId}`, {
      CommentId: commentId,
      UserName: userName,
      DateAdded: String(timestamp),
      Body: body,
    });

    await r.hSet(`CardDetails:${cardId}`, { IsCommented: 'true' });
    await r.sAdd(`CardComments:${cardId}`, commentId);

    // Log activity
    await logActivity(cardId, 'commented', userName, `Added a comment`);

    res.status(200).json({ message: 'Comment saved successfully', commentId });
  } catch (error) {
    logError(error, { context: 'createComment' });
    res.status(500).json({ error: 'Failed to save comment' });
  }
}

export async function getComments(req: Request, res: Response): Promise<void> {
  const { cardId } = req.params;

  try {
    const r = getRedisClient();
    const isCommented = await r.hGet(`CardDetails:${cardId}`, 'IsCommented');

    if (isCommented) {
      const commentIds = await r.sMembers(`CardComments:${cardId}`);
      const CommentsDetails = await Promise.all(
        commentIds.map((id) => r.hGetAll(`Comments:${id}`)),
      );
      res.status(200).json({ CommentsDetails });
    } else {
      res.status(200).json({ message: 'No comment found.' });
    }
  } catch (error) {
    logError(error, { context: 'getComments' });
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
}

export async function updateComment(req: Request, res: Response): Promise<void> {
  const { body } = req.body;
  const { commentId } = req.params;

  try {
    const r = getRedisClient();
    const exists = await r.exists(`Comments:${commentId}`);
    if (!exists) {
      res.status(404).json({ error: 'Comment not found' });
      return;
    }

    await r.hSet(`Comments:${commentId}`, {
      Body: body,
      DateUpdated: String(Date.now()),
    });

    res.status(200).json({ message: 'Comment updated successfully' });
  } catch (error) {
    logError(error, { context: 'updateComment' });
    res.status(500).json({ error: 'Failed to update comment' });
  }
}

export async function deleteComment(req: Request, res: Response): Promise<void> {
  const { commentId } = req.params;

  try {
    const r = getRedisClient();
    const commentData = await r.hGetAll(`Comments:${commentId}`);

    if (!commentData || Object.keys(commentData).length === 0) {
      res.status(404).json({ error: 'Comment not found' });
      return;
    }

    const cardKeys = await r.keys('CardComments:*');
    let associatedCardId: string | null = null;

    for (const cardKey of cardKeys) {
      const isMember = await r.sIsMember(cardKey, commentId);
      if (isMember) {
        associatedCardId = cardKey.replace('CardComments:', '');
        break;
      }
    }

    if (!associatedCardId) {
      res.status(404).json({ error: 'Associated card not found for the comment' });
      return;
    }

    await r.del(`Comments:${commentId}`);
    await r.sRem(`CardComments:${associatedCardId}`, commentId);

    const remaining = await r.sCard(`CardComments:${associatedCardId}`);
    if (remaining === 0) {
      await r.hSet(`CardDetails:${associatedCardId}`, { IsCommented: 'false' });
    }

    // Log activity
    const userName =
      (req as any).user?.firstName && (req as any).user?.lastName
        ? `${(req as any).user.firstName} ${(req as any).user.lastName}`
        : 'Unknown';
    await logActivity(associatedCardId, 'comment_deleted', userName, 'Deleted a comment');

    res.status(200).json({
      message: 'Comment deleted successfully',
      deletedComment: {
        commentId,
        userName: commentData.UserName,
        body: commentData.Body,
      },
    });
  } catch (error) {
    logError(error, { context: 'deleteComment' });
    res.status(500).json({ error: 'Failed to delete comment' });
  }
}

// ---- Templates ----

export async function createTemplate(req: Request, res: Response): Promise<void> {
  const { name, fields } = req.body;
  if (!name || !Array.isArray(fields) || fields.length === 0) {
    res.status(400).json({ error: 'Template name and at least one field are required' });
    return;
  }

  try {
    const r = getRedisClient();
    const templateId = uuidv4();
    const timestamp = Date.now();

    await r.hSet(`KanbanTemplate:${templateId}`, {
      Name: name,
      Fields: JSON.stringify(fields),
      CreatedAt: String(timestamp),
    });
    await r.sAdd('KanbanTemplates', templateId);

    res.status(200).json({ templateId, name, fields });
  } catch (error) {
    logError(error, { context: 'createTemplate' });
    res.status(500).json({ error: 'Failed to create template' });
  }
}

export async function getTemplates(_req: Request, res: Response): Promise<void> {
  try {
    const r = getRedisClient();
    const templateIds = await r.sMembers('KanbanTemplates');

    const templates = await Promise.all(
      templateIds.map(async (id) => {
        const data = await r.hGetAll(`KanbanTemplate:${id}`);
        return {
          id,
          name: data.Name,
          fields: JSON.parse(data.Fields || '[]'),
          createdAt: data.CreatedAt,
          lastUsedAt: data.LastUsedAt || null,
        };
      }),
    );

    // Sort: most recently used first, then most recently created
    templates.sort((a, b) => {
      const aT = Number(a.lastUsedAt) || 0;
      const bT = Number(b.lastUsedAt) || 0;
      if (bT !== aT) return bT - aT;
      return Number(b.createdAt || 0) - Number(a.createdAt || 0);
    });

    res.status(200).json({ templates });
  } catch (error) {
    logError(error, { context: 'getTemplates' });
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
}

export async function deleteTemplate(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  try {
    const r = getRedisClient();
    await r.del(`KanbanTemplate:${id}`);
    await r.sRem('KanbanTemplates', id);
    res.status(200).json({ message: 'Template deleted successfully' });
  } catch (error) {
    logError(error, { context: 'deleteTemplate' });
    res.status(500).json({ error: 'Failed to delete template' });
  }
}

// ---- Card Activity ----

export async function getCardActivity(req: Request, res: Response): Promise<void> {
  const { cardId } = req.params;
  try {
    const r = getRedisClient();
    const raw = await r.lRange(`CardActivity:${cardId}`, 0, 99);
    const activities = raw.map((entry) => JSON.parse(entry));
    res.status(200).json({ activities });
  } catch (error) {
    logError(error, { context: 'getCardActivity' });
    res.status(500).json({ error: 'Failed to fetch activity' });
  }
}
