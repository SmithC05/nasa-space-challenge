import { Router } from 'express';
import { SPACECRAFT_COMPONENTS } from '@orbital/game-data';

export const componentsRouter = Router();

componentsRouter.get('/', (_req, res) => {
  res.json(SPACECRAFT_COMPONENTS);
});

componentsRouter.get('/:id', (req, res) => {
  const comp = SPACECRAFT_COMPONENTS.find((c) => c.id === req.params.id);
  if (!comp) {
    return res.status(404).json({ error: 'Component not found' });
  }
  return res.json(comp);
});
