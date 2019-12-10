const express = require('express');
const fs = require("fs");
const oracledb = require('oracledb');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.json());

const knexORCL = require('knex')({
        client: 'oracledb',
        connection: {
        user : 'PEGLEITURA',
        password : 'p3gr320019#',
        connectString : '(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=192.168.0.191)(PORT=1521))(CONNECT_DATA=(SERVER=DEDICATED)(SERVICE_NAME=orcl)))',
        listener: 'ORCL',
}});
    
const knexMySQL = require('knex')({
    client: 'mysql',
    connection: {
    host: '192.168.0.99',
    user : 'user',
    password : 'Password01!',
    database: 'applications'
    }
});

app.use('/files', express.static(path.resolve(__dirname, 'images')));

app.listen(70, function() {
    console.log('Olá developers! Servidor iniciado com sucesso!');
})

// Rotas

app.get('/',(req, res, next) => {    
    res.send('Dados!!');
});

app.get('/shop',(req, res, next) => {
    knexORCL.select('NROEMPRESA as value','NROEMPRESA as key', 'NOMEREDUZIDO as label')
    .from('CONSINCO.MAX_EMPRESA')
    .orderBy('NROEMPRESA')
    .then((dados) => {
        res.send(dados);    
    },next)
});

app.get('/departaments/:shop_id',(req, res, next) => {
    knexORCL.select('NRODEPARTAMENTO as value','NRODEPARTAMENTO as key', 'DESCRICAO as label')
    .from('CONSINCO.MRL_DEPARTAMENTO')
    .where('NROEMPRESA', (req.params.shop_id))
    .orderBy('NROEMPRESA')
    .then((dados) => {
        res.send(dados);    
    },next)
});

app.get('/background/:shop_id/:depto_id',(req, res, next) => {
    var subquery = knexMySQL.select('media')
    .from('applications.mipp_media')
    .whereRaw('mipp_media.id = mipp_departament.media_id')
    .as('media');

    knexMySQL.select('media_id', 'mipp_media.media_version', subquery )
    .from('mipp_departament')
    .innerJoin('mipp_media', 'mipp_media.id', 'mipp_departament.media_id')
    .where('shop_id', (req.params.shop_id))
    .andWhere('departament_id', (req.params.depto_id))
    .then((dados) => {
        const x = dados[0].media.toString('base64');   
        const name = `./images/background_${req.params.shop_id}_${req.params.depto_id}.jpeg`;
        fs.writeFile(name, x, {encoding: 'base64'}, function(err) {
            res.send(`http://187.35.128.157:70/files/background_${req.params.shop_id}_${req.params.depto_id}.jpeg`)
        });
    },next)
});

app.get('/screens/:shop_id/:depto_id', (req, res, next) => {
    knexMySQL.select('mipp_screen.id AS id', 'mipp_screen.timer AS timer', 'normal_product_color', 'promotional_product_color', 'mipp_media.type', 'media_version',
     'mipp_media.id as media_id', `loop`, 
     knexMySQL.raw('SUM(`mipp_product_screen`.`screen_id`)/`mipp_screen`.`id` AS quantity_products'))
    .from('mipp_screen')
    .innerJoin('mipp_media', 'mipp_media.id', 'mipp_screen.media_id')
    .leftJoin('mipp_product_screen',function() {
        this.on('mipp_product_screen.screen_id', '=', 'mipp_screen.id')
        .andOn('mipp_product_screen.departament_id', '=', 'mipp_screen.departament_id')
        .andOn('mipp_product_screen.shop_id', '=', 'mipp_screen.shop_id')
    })
    .where({
        'mipp_screen.shop_id': req.params.shop_id,
        'mipp_screen.departament_id': req.params.depto_id
    })
    .whereRaw('((NOW() BETWEEN initial_date AND final_date) OR (initial_date IS NULL))')
    .groupBy('mipp_screen.id')
    .then(async (dados) => {
        let productID = await getProduct_ID(req.params.shop_id, req.params.depto_id, dados);
        res.send(productID);
    },next)
});

async function getProduct_ID(shop_id, depto_id, data){
    const promises = data.map(async (dataScreen) => {
        return knexMySQL.select('id')
        .from('mipp_product_screen')
        .where('shop_id', (shop_id))
        .where({
            'shop_id': shop_id,
            'departament_id': depto_id,
            'screen_id': dataScreen.id
        })
        .orderBy('position')
        .then(async (dataProduct) => {
            var obj;
            let allProd = [];
            const promises = dataProduct.map(async (value) => {
                let product = await getProduct(shop_id, depto_id, value.id);
                allProd.push(product);
            });
            
            await Promise.all(promises);
            allProd = Object.assign({}, allProd);
            obj = await Object.assign({}, dataScreen, {'products':Object.assign({}, allProd)});
            return obj;
         }
        );
    });

    return await Promise.all(promises);
};

function getProduct(shop_id, depto_id, product_id){
    return knexORCL.raw(`SELECT p.desccompleta as description, pc.seqproduto AS id
    FROM CONSINCO.MAP_PRODCODIGO pc 
    JOIN CONSINCO.MAP_PRODUTO p ON p.seqproduto = pc.seqproduto 
    JOIN CONSINCO.MRL_PRODUTOEMPRESA pe ON pe.seqproduto = pc.seqproduto
    WHERE (TIPCODIGO='B') AND pe.nroempresa = '${shop_id}' AND NRODEPARTAMENTO = '${depto_id}' AND pc.codacesso = '${product_id}'`)
    .then((dados) => {
        let object = {'id' : `${dados[0].ID}`,'description': dados[0].DESCRIPTION}
        return getPrice(shop_id, product_id, object);
    })
};

function getPrice(shop_id, product_id, obj){
    return knexORCL.raw(`SELECT CONSINCO.fprecoembproduto ('${product_id}', 1, 1, ${shop_id}) preco, 
    CONSINCO.fprecoembpromoc('${product_id}',  1, 1, ${shop_id}) precoPromoc FROM DUAL`)
    .then((dados) => {
        let objectF = {'id' : obj.id, 'description': obj.description, 'price': formatter.format(parseFloat(dados[0].PRECO)), 'price_promo': formatter.format(parseFloat(dados[0].PRECOPROMOC))}
        return objectF; 
    })
};

const formatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2
});

app.get('/mediaInfo/:media_id', (req, res, next) => {
     knexMySQL.select('media_version').select('type')
    .from('mipp_media')
    .where('id', (req.params.media_id))
    .then((dados) => {
        res.send({'media_version': dados[0].media_version, 'type': dados[0].type});   
    },next)
});

app.get('/media/:shop_id/:depto_id/:media_id', (req, res, next) => {
     knexMySQL.select('media').select('media_version').select('type')
    .from('mipp_media')
    .where('id', (req.params.media_id))
    .then((dados) => {
        const x = dados[0].media.toString('base64');  
        if(dados[0].type == 2){
            const name = `./images/${req.params.shop_id}_${req.params.depto_id}_${req.params.media_id}_${dados[0].media_version}.mp4`;
            fs.writeFile(name, x, {encoding: 'base64'}, function(err) {
                res.send(`http://187.35.128.157:70/files/${req.params.shop_id}_${req.params.depto_id}_${req.params.media_id}_${dados[0].media_version}.mp4`)
            });
        } else{            
            const name = `./images/${req.params.shop_id}_${req.params.depto_id}_${req.params.media_id}_${dados[0].media_version}.jpeg`;
            fs.writeFile(name, x, {encoding: 'base64'}, function(err) {
                res.send(`http://187.35.128.157:70/files/${req.params.shop_id}_${req.params.depto_id}_${req.params.media_id}_${dados[0].media_version}.jpeg`)
            });
        }
    },next)
});
