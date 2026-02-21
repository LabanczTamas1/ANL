const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
const { getRedisClient } = require("../config/database");
const authenticateJWT = require("../middleware/authenticateJWT");

router.post("/columns", authenticateJWT, async (req, res) => {
  const { priority, tagColor, columnName, cardNumbers } = req.body;

  try {
    const redisClient = getRedisClient();
    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    const columnId = `${uuidv4()}`;

    await redisClient.zAdd(`KanbanTable`, { score: priority, value: columnId });

    await redisClient.hSet(`Boards:${columnId}`, {
      ColumnName: columnName,
      tagColor: tagColor,
      CardNumber: cardNumbers,
    });

    console.log(req.body);
    res.json({ columnId, tagColor, columnName, priority, cardNumbers });
  } catch (error) {
    console.error("Error saving column:", error);
    res.status(500).json({ error: "Failed to save column" });
  }
});

router.get("/columns", authenticateJWT, async (req, res) => {
  try {
    const redisClient = getRedisClient();
    const columnIds = await redisClient.zRange("KanbanTable", 0, -1);

    const columnDetails = await Promise.all(
      columnIds.map(async (columnId) => {
        const details = await redisClient.hGetAll(`Boards:${columnId}`);
        return { columnId, ...details };
      })
    );

    res.json({ columns: columnDetails });
  } catch (error) {
    console.error("Error fetching columns:", error);
    res.status(500).json({ error: "Failed to fetch columns" });
  }
});

router.put("/columns/priority", authenticateJWT, async (req, res) => {
  const columns = req.body.columns;

  if (!Array.isArray(columns) || columns.length === 0) {
    return res
      .status(400)
      .json({ error: "Invalid request: columns array is required" });
  }

  try {
    const redisClient = getRedisClient();
    const updatePromises = columns.map((column) => {
      return redisClient.zAdd("KanbanTable", {
        score: column.priority,
        value: column.columnId,
      });
    });

    await Promise.all(updatePromises);
    res.status(200).json({
      success: true,
      message: "Priorities updated successfully",
    });
  } catch (error) {
    console.error("Error updating column priority:", error);
    res.status(500).json({ error: "Failed to update priority" });
  }
});

router.delete("/columns/:id", authenticateJWT, async (req, res) => {
  const { id } = req.params;

  try {
    const redisClient = getRedisClient();
    await redisClient.zRem("KanbanTable", id);
    await redisClient.del(`Boards:${id}`);

    res.status(200).json({
      success: true,
      message: "Column deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting column:", error);
    res.status(500).json({ error: "Failed to delete column" });
  }
});

router.post("/cards", authenticateJWT, async (req, res) => {
  const {
    name,
    isCommented,
    columnId,
    contactName,
    businessName,
    firstContact,
    phoneNumber,
    email,
    website,
    instagram,
    facebook,
  } = req.body;

  console.log("Received data:", req.body);
  console.log(name);

  if (!name || !columnId) {
    return res
      .status(400)
      .json({ error: "Card name and column ID are required" });
  }

  try {
    const redisClient = getRedisClient();
    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    const cardId = `${uuidv4()}`;
    const timestamp = Date.now();

    console.log(timestamp);
    const BoardKey = `SortedCards:${columnId}`;

    await redisClient.zAdd(BoardKey, [{ score: timestamp, value: cardId }]);

    const columnData = await redisClient.hGetAll(`Boards:${columnId}`);
    await redisClient.hSet(`Boards:${columnId}`, {
      CardNumber: parseInt(columnData.CardNumber, 10) + 1,
    });
    console.log(parseInt(columnData.CardNumber, 10));

    console.log(BoardKey);
    console.log(typeof timestamp);
    console.log(typeof cardId);
    console.log(isCommented.toString());

    await redisClient.hSet(`CardDetails:${cardId}`, {
      ColumnId: columnId,
      ContactName: contactName,
      BusinessName: businessName,
      DateOfAdded: timestamp,
      FirstContact: firstContact,
      PhoneNumber: phoneNumber,
      Email: email,
      Website: website,
      Instagram: instagram,
      Facebook: facebook,
      IsCommented: String(isCommented),
    });

    console.log(redisClient.hGetAll(`CardDetails:${cardId}`));

    res.status(200).json({ message: "Card saved successfully", cardId });
  } catch (error) {
    console.error("Error saving card:", error);
    res.status(500).json({ error: "Failed to save card" });
  }
});

router.put("/cards/:cardId", authenticateJWT, async (req, res) => {
  const { name, updatedValue } = req.body;
  const { cardId } = req.params;

  console.log(name, updatedValue);

  if (!name || !updatedValue) {
    return res
      .status(400)
      .json({ error: "Input field id and value are missing$" });
  }

  try {
    const redisClient = getRedisClient();
    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    const timestamp = Date.now();

    await redisClient.hSet(`CardDetails:${cardId}`, name, updatedValue);

    res.status(200).json({ message: "Update was successfull", cardId });
  } catch (error) {
    console.error("Error saving card:", error);
    res.status(500).json({ error: "Failed to save card" });
  }
});

router.delete("/cards/:cardId", authenticateJWT, async (req, res) => {
  const { cardId } = req.params;
  const { columnId } = req.body;

  console.log("CardId deleting:", cardId);
  console.log("ColumnId deleting:", columnId);

  if (!columnId) {
    return res.status(400).json({ error: "Column ID is required" });
  }

  try {
    const redisClient = getRedisClient();
    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    const cardDetailsKey = `CardDetails:${cardId}`;
    const boardKey = `SortedCards:${columnId}`;

    console.log(cardDetailsKey, boardKey);

    const cardExists = await redisClient.exists(cardDetailsKey);
    if (!cardExists) {
      return res.status(404).json({ error: "Card not found" });
    }

    await redisClient.zRem(boardKey, cardId);

    await redisClient.del(cardDetailsKey);

    const columnDataDestination = await redisClient.hGetAll(
      `Boards:${columnId}`
    );
    await redisClient.hSet(`Boards:${columnId}`, {
      CardNumber: parseInt(columnDataDestination.CardNumber, 10) - 1,
    });

    res.status(200).json({ message: "Card deleted successfully" });
  } catch (error) {
    console.error("Error deleting card:", error.message || error);
    res.status(500).json({
      error: "An error occurred while deleting the card",
    });
  }
});

router.post("/cards/comments/:cardId", authenticateJWT, async (req, res) => {
  const { userName, body } = req.body;
  const { cardId } = req.params;
  console.log(userName, body, cardId);

  try {
    const redisClient = getRedisClient();
    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    const commentId = `${uuidv4()}`;
    const timestamp = Date.now();

    await redisClient.hSet(`Comments:${commentId}`, {
      CommentId: commentId,
      UserName: userName,
      DateAdded: timestamp,
      Body: body,
    });

    await redisClient.hSet(`CardDetails:${cardId}`, {
      IsCommented: `true`,
    });

    const CardComments = `CardComments:${cardId}`;
    await redisClient.sAdd(CardComments, `${commentId}`);

    res.status(200).json({ message: "Comment saved succesfully" });
  } catch (error) {
    console.error("Error saving comment:", error);
    res.status(500).json({ error: "Failed to save comment" });
  }
});

router.get("/cards/comments/:cardId", authenticateJWT, async (req, res) => {
  const { cardId } = req.params;

  try {
    const redisClient = getRedisClient();
    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    const isCommented = await redisClient.hGet(
      `CardDetails:${cardId}`,
      `IsCommented`
    );

    console.log(isCommented);

    if (isCommented) {
      const CardComments = `CardComments:${cardId}`;
      const commentIds = await redisClient.sMembers(CardComments);
      console.log(commentIds);

      const CommentsDetails = await Promise.all(
        commentIds.map(async (Id) => {
          return await redisClient.hGetAll(`Comments:${Id}`);
        })
      );

      res.status(200).json({ CommentsDetails });
    } else {
      res.status(200).json({ message: "No comment found." });
    }
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({ error: "Failed to fetch comments" });
  }
});

router.put("/cards/comments/:commentId", authenticateJWT, async (req, res) => {
  const { body } = req.body;
  const { commentId } = req.params;
  console.log(commentId, body);

  try {
    const redisClient = getRedisClient();
    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    const commentKey = `Comments:${commentId}`;
    const commentExists = await redisClient.exists(commentKey);
    if (!commentExists) {
      return res.status(404).json({ error: "Comment not found" });
    }

    const timestamp = Date.now();
    await redisClient.hSet(commentKey, {
      Body: body,
      DateUpdated: timestamp,
    });

    res.status(200).json({ message: "Comment updated successfully" });
  } catch (error) {
    console.error("Error updating comment:", error);
    res.status(500).json({ error: "Failed to update comment" });
  }
});

router.delete("/cards/comments/:commentId", authenticateJWT, async (req, res) => {
  const { commentId } = req.params;

  try {
    const redisClient = getRedisClient();
    const commentData = await redisClient.hGetAll(`Comments:${commentId}`);

    if (!commentData || Object.keys(commentData).length === 0) {
      return res.status(404).json({ error: "Comment not found" });
    }

    const { UserName, Body } = commentData;

    const cardKeys = await redisClient.keys("CardComments:*");
    let associatedCardId = null;

    for (const cardKey of cardKeys) {
      const isMember = await redisClient.sIsMember(cardKey, commentId);
      if (isMember) {
        associatedCardId = cardKey.replace("CardComments:", "");
        break;
      }
    }

    if (!associatedCardId) {
      return res
        .status(404)
        .json({ error: "Associated card not found for the comment" });
    }

    await redisClient.del(`Comments:${commentId}`);

    await redisClient.sRem(
      `CardComments:${associatedCardId}`,
      commentId
    );

    const remainingComments = await redisClient.sCard(
      `CardComments:${associatedCardId}`
    );
    if (remainingComments === 0) {
      await redisClient.hSet(`CardDetails:${associatedCardId}`, {
        IsCommented: `false`,
      });
    }

    res.status(200).json({
      message: "Comment deleted successfully",
      deletedComment: {
        commentId,
        userName: UserName,
        body: Body,
      },
    });
  } catch (error) {
    console.error("Error deleting comment:", error);
    res.status(500).json({ error: "Failed to delete comment" });
  }
});

router.get("/cards/:columnId", authenticateJWT, async (req, res) => {
  const { columnId } = req.params;
  try {
    const redisClient = getRedisClient();
    const cardIds = await redisClient.zRange(`SortedCards:${columnId}`, 0, -1);

    const cardDetails = await Promise.all(
      cardIds.map(async (cardId) => {
        return await redisClient.hGetAll(`CardDetails:${cardId}`);
      })
    );

    res.json({ cardDetails, cardIds });
  } catch (error) {
    console.error("Error updating card:", error);
    res.status(500).json({ error: "Failed to update card" });
  }
});

router.put("/cards/change/priority", authenticateJWT, async (req, res) => {
  console.log("Debugginggggggggggggggggggggg");
  const {
    sourceColumnId,
    destinationColumnId,
    cardId,
    newIndex,
  } = req.body;

  if (
    !sourceColumnId ||
    !destinationColumnId ||
    !cardId ||
    newIndex === undefined
  ) {
    console.error("Invalid request body:", {
      sourceColumnId,
      destinationColumnId,
      cardId,
      newIndex,
    });
    return res.status(400).json({ error: "Invalid request body" });
  }

  try {
    const redisClient = getRedisClient();
    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    const sourceBoardKey = `SortedCards:${sourceColumnId}`;
    const destinationBoardKey = `SortedCards:${destinationColumnId}`;

    if (sourceColumnId !== destinationColumnId) {
      await redisClient.zRem(sourceBoardKey, cardId);
    }

    await redisClient.zAdd(destinationBoardKey, [
      { score: newIndex, value: cardId },
    ]);
    console.log(
      `Added card ${cardId} to column ${destinationColumnId} with priority ${newIndex}`
    );

    const destinationCards = await redisClient.zRangeWithScores(
      destinationBoardKey,
      0,
      -1
    );

    const reorderedCards = destinationCards.filter(
      (card) => card.value !== cardId
    );
    reorderedCards.splice(newIndex, 0, { score: newIndex, value: cardId });

    for (let i = 0; i < reorderedCards.length; i++) {
      reorderedCards[i].score = i;
    }

    await redisClient.zRemRangeByRank(destinationBoardKey, 0, -1);

    for (const card of reorderedCards) {
      await redisClient.zAdd(destinationBoardKey, [
        { score: card.score, value: card.value },
      ]);
    }

    console.log(
      `Successfully reordered cards in column ${destinationColumnId}`
    );

    const timestamp = Date.now();
    await redisClient.hSet(`CardDetails:${cardId}`, {
      ColumnId: destinationColumnId,
      DateOfAdded: timestamp,
    });

    const columnData = await redisClient.hGetAll(
      `Boards:${destinationColumnId}`
    );
    await redisClient.hSet(`Boards:${destinationColumnId}`, {
      CardNumber: parseInt(columnData.CardNumber, 10) + 1,
    });

    const columnDataDestination = await redisClient.hGetAll(
      `Boards:${sourceColumnId}`
    );
    await redisClient.hSet(`Boards:${sourceColumnId}`, {
      CardNumber: parseInt(columnDataDestination.CardNumber, 10) - 1,
    });

    console.log(
      `Updated card ${cardId}: moved to column ${destinationColumnId}`
    );
    res
      .status(200)
      .json({ message: "Card priority updated successfully" });
  } catch (error) {
    console.error("Error updating card priority:", error);
    res.status(500).json({ error: "Failed to update card priority" });
  }
});

module.exports = router;
