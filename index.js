const express = require('express');
const cors = require('cors');
const port = process.env.PORT || 3000;

const app = express();

const jsonBodyMiddleware = express.json();
app.use(cors());
app.use(jsonBodyMiddleware);

const db = {
    products: [
        {name: 'Кросы', id: 1, price: 10},
        {name: 'футболка', id: 2, price: 20},
    ],
    basket: {
        products: 0,
        price: 0,
        contains: [],
    }
}

async function calcBasket() {
    db.basket.value = await db.basket.contains.reduce((init, current) => init + current.price, 0);

    db.basket.products = await db.basket.contains.length;
}

app.get('/', (req, res) => {
    res.send(`Example app listening on port ${port}`);
})

app.get('/products', (req, res) => {
    try {
        const findedProducts = db.products.filter((el) => {
            return el.name.includes(req.query.name);
        });

        const current = req.query.name ? findedProducts : db.products;

        res.json(current);
    } catch(e) {
        res.sendStatus(400);
    }
});

app.get('/product/:id', (req, res) => {
    try {
        console.log(req.params)
        const current = db.products.find((el) => el.id === +req.params.id);

        if (!current) {
            res.sendStatus(404);
            return;
        }

        res.status(200).json(current);
    } catch(e) {
      res.sendStatus(404);
    }
});

app.get('/search', (req, res) => {
});

app.get('/basket', (req, res) => {
    try {
        res.status(200).json(db.basket);
    } catch (e) {
        res.sendStatus(400);
    }
});

app.post('/basket', async (req, res) => {
    const currentProduct = db.products.find((el) => el.id === +req.body.id);

    try {
        if (currentProduct) {
            currentProduct.inBasket = true;
            db.basket.contains.push(currentProduct);
            await calcBasket();
        } else {
            res.sendStatus(404);
            return;
        }

        res.status(201).json(db.basket);
    } catch (e) {
        res.sendStatus(400);
    }
});

app.delete('/basket/:id', async (req, res) => {
    try {
        const currentProduct = db.products.find((el) => el.id === +req.params.id);
        const currentInBasket = db.basket.contains.find((el) => el.id === +req.params.id);

        if (currentProduct && currentInBasket) {
            delete currentProduct.inBasket;
            db.basket.contains = db.basket.contains.filter((el) => el.id !== currentProduct.id);

            await calcBasket();
        } else {
            res.sendStatus(404);
            return;
        }

        res.status(202).json(db.basket);
    } catch (e) {
        res.sendStatus(400);
    }
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
})
