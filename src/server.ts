import express from 'express';
import cors from 'cors';
import path from 'path';
import routes from './routes';


const app = express();

//em ambiente de produção
// app.use(cors({
//     origin: ['dominio.com.br', 'outro.com.br']
// }));
         
app.use(cors());

app.use(express.json());

app.use(routes);

app.use('/uploads', express.static(path.resolve(__dirname, '..', 'uploads')));

app.listen(3333, () => {
    console.log("Server started on port 3333!");
})

