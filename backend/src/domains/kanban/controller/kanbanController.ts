// ---------------------------------------------------------------------------
// Kanban Controller — columns, cards, comments
// ---------------------------------------------------------------------------

import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getRedisClient } from '../../../config/database.js';
import { createLogger, logError } from '../../../utils/logger.js';

const logger = createLogger('kanban', 'controller');

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

    await r.hSet(`CardDetails:${cardId}`, {
      ColumnId: columnId,
      ContactName: contactName || '',
      BusinessName: businessName || '',
      DateOfAdded: String(timestamp),
      FirstContact: firstContact || '',
      PhoneNumber: phoneNumber || '',
      Email: email || '',
      Website: website || '',
      Instagram: instagram || '',
      Facebook: facebook || '',
      IsCommented: String(isCommented),
    });

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
    await r.hSet(`CardDetails:${cardId}`, name, updatedValue);
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

    res.status(200).json({ message: 'Comment saved successfully' });
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
