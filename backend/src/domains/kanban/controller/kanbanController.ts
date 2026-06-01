// ---------------------------------------------------------------------------
// Kanban Controller — columns, cards, comments, templates (PostgreSQL)
// ---------------------------------------------------------------------------

import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { createLogger, logError } from '../../../utils/logger.js';
import { query, queryOne, execute } from '../../../utils/db.js';

const logger = createLogger('kanban', 'controller');

// ---- Activity Logging Helper ----

async function logActivity(
  cardId: string,
  action: string,
  userName: string,
  details?: string,
): Promise<void> {
  try {
    await query(
      `INSERT INTO kanban_activity (id, card_id, action, user_name, details) VALUES ($1, $2, $3, $4, $5)`,
      [uuidv4(), cardId, action, userName, details || ''],
    );
  } catch (err) {
    logError(err, { context: 'logActivity', cardId });
  }
}

function getUserName(req: Request): string {
  const u = req.user as any;
  return u?.firstName && u?.lastName ? `${u.firstName} ${u.lastName}` : 'Unknown';
}

// ---- Columns ----

export async function createColumn(req: Request, res: Response): Promise<void> {
  const { priority, tagColor, columnName, cardNumbers } = req.body;
  try {
    const columnId = uuidv4();

    await query(
      `INSERT INTO kanban_columns (id, column_name, tag_color, priority, card_count)
       VALUES ($1, $2, $3, $4, $5)`,
      [columnId, columnName, tagColor, priority, cardNumbers || 0],
    );

    res.json({ columnId, tagColor, columnName, priority, cardNumbers });
  } catch (error) {
    logError(error, { context: 'createColumn' });
    res.status(500).json({ error: 'Failed to save column' });
  }
}

export async function getColumns(_req: Request, res: Response): Promise<void> {
  try {
    const rows = await query(
      `SELECT id as "columnId", column_name as "ColumnName", tag_color as "tagColor",
              priority, card_count as "CardNumber"
       FROM kanban_columns ORDER BY priority ASC`,
    );

    res.json({ columns: rows });
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
    for (const col of columns as { columnId: string; priority: number }[]) {
      await execute(
        `UPDATE kanban_columns SET priority = $1, updated_at = now() WHERE id = $2`,
        [col.priority, col.columnId],
      );
    }
    res.status(200).json({ success: true, message: 'Priorities updated successfully' });
  } catch (error) {
    logError(error, { context: 'updateColumnPriority' });
    res.status(500).json({ error: 'Failed to update priority' });
  }
}

export async function deleteColumn(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  try {
    await execute(`DELETE FROM kanban_columns WHERE id = $1`, [id]);
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
    phoneNumber, email, website, instagram, facebook, fields, templateId,
  } = req.body;

  if (!name || !columnId) {
    res.status(400).json({ error: 'Card name and column ID are required' });
    return;
  }

  try {
    const cardId = uuidv4();
    const timestamp = Date.now();

    let fieldsJson: any = null;
    if (fields && Array.isArray(fields)) {
      fieldsJson = JSON.stringify(fields);
    }

    await query(
      `INSERT INTO kanban_cards (id, column_id, name, sort_order, is_commented, template_id,
         contact_name, business_name, first_contact, phone_number, email, website, instagram, facebook, fields)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
      [
        cardId, columnId, name, timestamp, isCommented ?? false, templateId || null,
        contactName || '', businessName || '', firstContact || '',
        phoneNumber || '', email || '', website || '', instagram || '', facebook || '',
        fieldsJson,
      ],
    );

    // Update card count
    await execute(
      `UPDATE kanban_columns SET card_count = card_count + 1 WHERE id = $1`,
      [columnId],
    );

    // Update template last used
    if (templateId) {
      await execute(
        `UPDATE kanban_templates SET last_used_at = now() WHERE id = $1`,
        [templateId],
      );
    }

    await logActivity(cardId, 'created', getUserName(req), `Card "${name}" created`);

    res.status(200).json({ message: 'Card saved successfully', cardId });
  } catch (error) {
    logError(error, { context: 'createCard' });
    res.status(500).json({ error: 'Failed to save card' });
  }
}

export async function updateCard(req: Request, res: Response): Promise<void> {
  const { name: fieldName, updatedValue } = req.body;
  const { cardId } = req.params;

  if (!fieldName || !updatedValue) {
    res.status(400).json({ error: 'Input field id and value are missing' });
    return;
  }

  try {
    if (fieldName === 'Fields' && typeof updatedValue === 'object') {
      await execute(
        `UPDATE kanban_cards SET fields = $1, updated_at = now() WHERE id = $2`,
        [JSON.stringify(updatedValue), cardId],
      );
    } else {
      // Map frontend field names to DB columns
      const fieldMap: Record<string, string> = {
        Name: 'name',
        ContactName: 'contact_name',
        BusinessName: 'business_name',
        FirstContact: 'first_contact',
        PhoneNumber: 'phone_number',
        Email: 'email',
        Website: 'website',
        Instagram: 'instagram',
        Facebook: 'facebook',
        IsCommented: 'is_commented',
        ColumnId: 'column_id',
      };

      const col = fieldMap[fieldName];
      if (col) {
        await execute(
          `UPDATE kanban_cards SET ${col} = $1, updated_at = now() WHERE id = $2`,
          [updatedValue, cardId],
        );
      }
    }

    await logActivity(cardId, 'updated', getUserName(req), `Updated field "${fieldName}"`);

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
    const card = await queryOne(`SELECT id FROM kanban_cards WHERE id = $1`, [cardId]);
    if (!card) {
      res.status(404).json({ error: 'Card not found' });
      return;
    }

    await execute(`DELETE FROM kanban_cards WHERE id = $1`, [cardId]);

    await execute(
      `UPDATE kanban_columns SET card_count = GREATEST(card_count - 1, 0) WHERE id = $1`,
      [columnId],
    );

    res.status(200).json({ message: 'Card deleted successfully' });
  } catch (error) {
    logError(error, { context: 'deleteCard' });
    res.status(500).json({ error: 'An error occurred while deleting the card' });
  }
}

export async function getCards(req: Request, res: Response): Promise<void> {
  const { columnId } = req.params;
  try {
    const rows = await query(
      `SELECT id, column_id as "ColumnId", name as "Name", sort_order as "DateOfAdded",
              is_commented as "IsCommented", template_id as "TemplateId",
              contact_name as "ContactName", business_name as "BusinessName",
              first_contact as "FirstContact", phone_number as "PhoneNumber",
              email as "Email", website as "Website", instagram as "Instagram",
              facebook as "Facebook", fields as "Fields"
       FROM kanban_cards WHERE column_id = $1 ORDER BY sort_order ASC`,
      [columnId],
    );

    const cardIds = rows.map((r: any) => r.id);
    const cardDetails = rows.map((r: any) => {
      const result: Record<string, any> = { ...r };
      if (result.Fields && typeof result.Fields === 'string') {
        result.Fields = JSON.parse(result.Fields);
      }
      result.IsCommented = String(result.IsCommented);
      result.DateOfAdded = String(result.DateOfAdded);
      return result;
    });

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
    // Update the card's column and sort order
    await execute(
      `UPDATE kanban_cards SET column_id = $1, sort_order = $2, updated_at = now() WHERE id = $3`,
      [destinationColumnId, newIndex, cardId],
    );

    // Reorder destination column cards
    const destCards = await query<{ id: string }>(
      `SELECT id FROM kanban_cards WHERE column_id = $1 AND id != $2 ORDER BY sort_order ASC`,
      [destinationColumnId, cardId],
    );

    const reordered = [...destCards.map(c => c.id)];
    reordered.splice(newIndex, 0, cardId);

    for (let i = 0; i < reordered.length; i++) {
      await execute(
        `UPDATE kanban_cards SET sort_order = $1 WHERE id = $2`,
        [i, reordered[i]],
      );
    }

    // Update column card counts if cross-column move
    if (sourceColumnId !== destinationColumnId) {
      await execute(
        `UPDATE kanban_columns SET card_count = card_count + 1 WHERE id = $1`,
        [destinationColumnId],
      );
      await execute(
        `UPDATE kanban_columns SET card_count = GREATEST(card_count - 1, 0) WHERE id = $1`,
        [sourceColumnId],
      );
    }

    await logActivity(cardId, 'moved', getUserName(req),
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
    const commentId = uuidv4();

    await query(
      `INSERT INTO kanban_comments (id, card_id, user_name, body) VALUES ($1, $2, $3, $4)`,
      [commentId, cardId, userName, body],
    );

    await execute(
      `UPDATE kanban_cards SET is_commented = true WHERE id = $1`,
      [cardId],
    );

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
    const rows = await query(
      `SELECT id as "CommentId", user_name as "UserName", body as "Body",
              EXTRACT(EPOCH FROM created_at)::bigint * 1000 as "DateAdded",
              EXTRACT(EPOCH FROM updated_at)::bigint * 1000 as "DateUpdated"
       FROM kanban_comments WHERE card_id = $1 ORDER BY created_at ASC`,
      [cardId],
    );

    if (rows.length > 0) {
      res.status(200).json({ CommentsDetails: rows });
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
    const count = await execute(
      `UPDATE kanban_comments SET body = $1, updated_at = now() WHERE id = $2`,
      [body, commentId],
    );

    if (count === 0) {
      res.status(404).json({ error: 'Comment not found' });
      return;
    }

    res.status(200).json({ message: 'Comment updated successfully' });
  } catch (error) {
    logError(error, { context: 'updateComment' });
    res.status(500).json({ error: 'Failed to update comment' });
  }
}

export async function deleteComment(req: Request, res: Response): Promise<void> {
  const { commentId } = req.params;

  try {
    const comment = await queryOne<{ card_id: string; user_name: string; body: string }>(
      `SELECT card_id, user_name, body FROM kanban_comments WHERE id = $1`,
      [commentId],
    );

    if (!comment) {
      res.status(404).json({ error: 'Comment not found' });
      return;
    }

    await execute(`DELETE FROM kanban_comments WHERE id = $1`, [commentId]);

    // Check remaining comments on the card
    const remaining = await queryOne<{ count: string }>(
      `SELECT COUNT(*) as count FROM kanban_comments WHERE card_id = $1`,
      [comment.card_id],
    );

    if (parseInt(remaining?.count || '0', 10) === 0) {
      await execute(
        `UPDATE kanban_cards SET is_commented = false WHERE id = $1`,
        [comment.card_id],
      );
    }

    await logActivity(comment.card_id, 'comment_deleted', getUserName(req), 'Deleted a comment');

    res.status(200).json({
      message: 'Comment deleted successfully',
      deletedComment: {
        commentId,
        userName: comment.user_name,
        body: comment.body,
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
    const templateId = uuidv4();

    await query(
      `INSERT INTO kanban_templates (id, name, fields) VALUES ($1, $2, $3)`,
      [templateId, name, JSON.stringify(fields)],
    );

    res.status(200).json({ templateId, name, fields });
  } catch (error) {
    logError(error, { context: 'createTemplate' });
    res.status(500).json({ error: 'Failed to create template' });
  }
}

export async function getTemplates(_req: Request, res: Response): Promise<void> {
  try {
    const rows = await query(
      `SELECT id, name, fields, created_at as "createdAt", last_used_at as "lastUsedAt"
       FROM kanban_templates ORDER BY COALESCE(last_used_at, created_at) DESC`,
    );

    const templates = rows.map((t: any) => ({
      id: t.id,
      name: t.name,
      fields: typeof t.fields === 'string' ? JSON.parse(t.fields) : t.fields,
      createdAt: t.createdAt,
      lastUsedAt: t.lastUsedAt,
    }));

    res.status(200).json({ templates });
  } catch (error) {
    logError(error, { context: 'getTemplates' });
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
}

export async function deleteTemplate(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  try {
    await execute(`DELETE FROM kanban_templates WHERE id = $1`, [id]);
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
    const rows = await query(
      `SELECT action, user_name as "userName", details,
              EXTRACT(EPOCH FROM created_at)::bigint * 1000 as "timestamp"
       FROM kanban_activity WHERE card_id = $1 ORDER BY created_at DESC LIMIT 100`,
      [cardId],
    );

    res.status(200).json({ activities: rows });
  } catch (error) {
    logError(error, { context: 'getCardActivity' });
    res.status(500).json({ error: 'Failed to fetch activity' });
  }
}