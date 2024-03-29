import { response, Router } from "express";
import multer from "multer";
import knex from "../database/connection";
import multerConfig from '../config/multer';

const locationsRouter = Router();

const upload = multer(multerConfig);

locationsRouter.post('/', async (req, res) => {
    try{
        const { name, email, whatsapp, latitude, longitude, city, uf, items } = req.body;  

        const location = { image: "fake-image.jpeg", name, email, whatsapp, latitude, longitude, city, uf }

        const transaction = await knex.transaction();

        const newIds = await transaction('locations').insert(location);

        const location_id = newIds[0];

        const locationItems = items
            .map(async (item_id: number) => {
                const selectedItem = await transaction('items').where('id', item_id).first()

                if (!selectedItem) {
                    return res.status(400).json({ message: 'Item not found.' });
                }

                return {
                    item_id,
                    location_id
                }
            });    

        await transaction('location_items').insert(locationItems);

        await transaction.commit();
        
        return res.json({
            id: location_id,
            ...location
        });
    }catch(err){
        console.log(err)
    }
});

locationsRouter.get('/', async (req, res) => { 
    const { city, uf, items } = req.query;

    const parsedItems = <any> String(items).split(',').map(item => Number(item.trim()));

    const locations = await knex('locations')
        .join('location_items', 'locations.id', '=', 'location_items.location_id')
        .whereIn('location_items.item_id', parsedItems)
        .where('city', String(city))
        .where('uf', String(uf))
        .distinct()
        .select('locations.*');


    return res.json(locations);
});

locationsRouter.get('/:id', async (req, res) => {
    const { id } = req.params;

    const location = await knex('locations').where('id', id).first();

    if (!location){
        return res.status(400).json({ message: "Location not found!" })
    }

    const items = await knex('items')
        .join('location_items', 'items.id', '=', 'location_items.item_id')
        .where('location_items.location_id', id)
        .select('items.title');


    return res.json({
        location,
        items
    });
});

locationsRouter.put('/:id', upload.single("image"), async (req, res) => {
    const { id } = req.params;
    const image = req.file?.filename;

    const location = await knex('locations').where('id', id).first();

    if(!location){
        return response.status(400).json({
            message: "Location not found."
        });
    }

    const locationUpdate = { ...location, image }

    await knex('locations').update(locationUpdate).where('id', id);

    return res.json(locationUpdate);
});


export default locationsRouter;

