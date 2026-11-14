import { Router } from 'express';
import { getDatabase, missionRoomsTable, teamMembersTable } from '@orbital/database';
import { roomService } from '../services/roomService';
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
  const code = (req.params.code || '').trim().toUpperCase();

  // Check active in-memory room first
  const activeSnapshot = roomService.getRoomSnapshot(code);
  if (activeSnapshot) {
    return res.json(activeSnapshot);
  }

  // Fallback to database
  try {
    const db = getDatabase();
    const rooms = await db.select().from(missionRoomsTable).where(eq(missionRoomsTable.code, code));

    if (rooms.length === 0) {
      return res.status(404).json({ error: 'Room not found' });
    }

    const members = await db.select().from(teamMembersTable).where(eq(teamMembersTable.roomCode, code));

    // Strip sensitive hashes
    const publicMembers = members.map((m: any) => ({
      id: m.id,
      name: m.name,
      role: m.role,
      isReady: m.isReady,
      isHost: m.isHost,
      connected: m.connected,
      joinedAt: m.joinedAt,
      lastActiveAt: m.lastActiveAt
    }));

    return res.json({
      ...rooms[0],
      members: publicMembers
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});
