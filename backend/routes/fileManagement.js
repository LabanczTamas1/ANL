const express = require("express");
const router = express.Router();
const multer = require("multer");
const { getRedisClient } = require("../config/database");
const authenticateJWT = require("../middleware/authenticateJWT");

const upload = multer({ storage: multer.memoryStorage() });

router.post("/upload", upload.single("file"), async (req, res) => {
  const file = req.file;
  console.log(file);

  if (!file) {
    return res.status(400).json({ error: "No file uploaded!" });
  }

  if (file.mimetype !== "application/json") {
    return res.status(400).json({ error: "Only JSON files are allowed!" });
  }

  try {
    const jsonData = JSON.parse(file.buffer.toString("utf8"));

    console.log("JSON Data structure:", Object.keys(jsonData));

    const isNewFormat = jsonData.kanbanTable && jsonData.boardData;
    const isOldFormat = jsonData.lists && jsonData.cards;

    if (!isNewFormat && !isOldFormat) {
      return res.status(400).json({
        error: "Invalid JSON format. Must contain kanbanTable/boardData or lists/cards",
      });
    }

    if (isNewFormat) {
      await processNewFormat(jsonData);
    } else {
      await processOldFormat(jsonData);
    }

    res.json({
      message: "File uploaded and processed successfully!",
      format: isNewFormat ? "new" : "old",
    });
  } catch (error) {
    console.error("Error processing JSON:", error);
    res.status(400).json({
      error: "Error processing JSON file: " + error.message,
    });
  }
});

async function processNewFormat(jsonData) {
  const redisClient = getRedisClient();
  const { kanbanTable, boardData, cardDetails } = jsonData;

  console.log("Processing new format data");
  console.log("KanbanTable entries:", kanbanTable.length);
  console.log("Board entries:", Object.keys(boardData).length);

  if (kanbanTable && kanbanTable.length) {
    const entries = kanbanTable.map((item) => ({
      score: Number(item.score),
      value: String(item.value),
    }));

    if (entries.length > 0) {
      await redisClient.zAdd("KanbanTable", entries);
    }
  }

  if (boardData) {
    for (const [boardId, data] of Object.entries(boardData)) {
      await redisClient.hSet(`Boards:${boardId}`, {
        ColumnName: data.ColumnName,
        tagColor: data.tagColor,
        CardNumber: data.CardNumber,
      });
    }
  }

  if (cardDetails) {
    for (const [cardId, data] of Object.entries(cardDetails)) {
      await redisClient.hSet(`CardDetails:${cardId}`, {
        ColumnId: data.ColumnId,
        ContactName: data.ContactName,
        BusinessName: data.BusinessName,
        DateOfAdded: data.DateOfAdded,
        FirstContact: data.FirstContact,
        PhoneNumber: data.PhoneNumber,
        Email: data.Email,
        Website: data.Website,
        Instagram: data.Instagram,
        Facebook: data.Facebook,
        IsCommented: data.IsCommented,
      });

      const BoardKey = `SortedCards:${data.ColumnId}`;
      await redisClient.zAdd(BoardKey, {
        score: data.DateOfAdded,
        value: cardId,
      });
    }
  }
}

async function processOldFormat(jsonData) {
  const redisClient = getRedisClient();
  const lists = jsonData.lists || [];
  const cards = jsonData.cards || [];

  console.log("Processing old format data");
  console.log("Lists found:", lists.length);

  for (const list of lists) {
    if (!list.id || list.pos === undefined) {
      console.warn("Skipping list with invalid id or pos:", list);
      continue;
    }

    const posScore = Number(list.pos);
    if (isNaN(posScore)) {
      console.warn("Skipping list with invalid pos:", list.pos);
      continue;
    }

    try {
      await redisClient.zAdd("KanbanTable", {
        score: posScore,
        value: list.id,
      });

      await redisClient.hSet(`Boards:${list.id}`, {
        ColumnName: list.name || "",
        tagColor: list.color || "",
        CardNumber: list.cardCount || 0,
      });
    } catch (redisError) {
      console.error("Error storing list in Redis:", redisError);
    }
  }

  if (cards.length > 0) {
    console.log("Cards found:", cards.length);

    for (const card of cards) {
      try {
        const cardId = card.id || uuidv4();
        const columnId = card.listId;

        await redisClient.hSet(`CardDetails:${cardId}`, {
          ColumnId: columnId,
          ContactName: card.name || "",
          BusinessName: card.company || "",
          DateOfAdded: card.createdAt || Date.now(),
          FirstContact: card.firstContact || "",
          PhoneNumber: card.phone || "",
          Email: card.email || "",
          Website: card.website || "",
          Instagram: card.instagram || "",
          Facebook: card.facebook || "",
          IsCommented: card.hasComments ? "true" : "false",
        });

        const BoardKey = `SortedCards:${columnId}`;
        await redisClient.zAdd(BoardKey, {
          score: card.position || 0,
          value: cardId,
        });
      } catch (error) {
        console.error("Error storing card in Redis:", error);
      }
    }
  } else {
    console.log("No cards found in the uploaded JSON.");
  }
}

router.get("/export", async (req, res) => {
  try {
    const redisClient = getRedisClient();
    const kanbanTable = await redisClient.zRangeWithScores(
      "KanbanTable",
      0,
      -1
    );

    const lists = [];
    for (const board of kanbanTable) {
      const boardData = await redisClient.hGetAll(`Boards:${board.value}`);
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
      const cardIds = await redisClient.zRange(
        `SortedCards:${board.value}`,
        0,
        -1
      );
      for (const cardId of cardIds) {
        const cardData = await redisClient.hGetAll(`CardDetails:${cardId}`);
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

    const exportData = {
      lists,
      cards,
    };

    console.log(exportData);

    res.json(exportData);
  } catch (error) {
    console.error("Error exporting data:", error);
    res.status(500).json({ error: "Failed to export data!" });
  }
});

module.exports = router;
