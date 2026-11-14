import { Router } from 'express';
import { getDatabase, missionRoomsTable, teamMembersTable } from '@orbital/database';
import { eq } from 'drizzle-orm';

export const roomsRouter = Router();

roomsRouter.get('/', async (_req, res) => {
  try {
    const db = getDatabase();
    const rooms = await db.select().from(missionRoomsTable);
    res.json(rooms);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

roomsRouter.get('/:code', async (req, res) => {
  try {
    const db = getDatabase();
    const code = req.params.code.toUpperCase();
    const rooms = await db.select().from(missionRoomsTable).where(eq(missionRoomsTable.code, code));

    if (rooms.length === 0) {
      return res.status(404).json({ error: 'Room not found' });
    }

    const members = await db.select().from(teamMembersTable).where(eq(teamMembersTable.roomCode, code));

    return res.json({
      ...rooms[0],
      members
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});
