import { Router } from 'express';
import itemsRouters from './items.routes';
import locationsRouter from './locations.routes';

const routes = Router();

routes.use('/items', itemsRouters);
routes.use('/locations', locationsRouter)

export default routes;