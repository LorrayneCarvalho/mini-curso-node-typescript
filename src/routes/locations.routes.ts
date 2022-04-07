import { Router } from "express";
import knex from "../database/connection";


const locationsRouter = Router();

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


export default locationsRouter;

