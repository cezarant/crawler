var app = require('express')();
var http = require('http').Server(app);
var httpCrawler = require('http');
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;
var respRequisicao; 
var listResp = [];
const { MongoClient } = require("mongodb");
var mongoose = require('mongoose'); 
/***************************  Socket.io     ************************************/
/*******************************************************************************/
app.get('/', function(req, res)
{
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket)
{
  socket.on('chat message', function(etapaAtual)
  {	
	mediadorCrawler(etapaAtual);	       
  });
});

http.listen(port, function(){
  console.log('listening on *:'+ port);
});

function comunicaAoCliente(msg)
{
	io.emit('chat message', msg);
} 
/********************** Funções HTTP *************************************/
function requisicaoServidor(url,listaAnalise,callback)
{
	httpCrawler.get(url, function(res)
	{
		var data = "";
		res.on('data', function (chunk)
		{
			data += chunk;			
		});
		res.on("end", function()
		{			
			callback(data);
		});
	}).on("error", function()
	{        
			callback(null);
	});
}
/***************************** Específicas do Crawler *****************************/
var cheerio = require("cheerio");
function mediadorCrawler(etapa)
{
	console.log("Executando a etapa:"+ etapa); 		
	makeRequest(etapa);			
} 
function makeRequest(indice)
{ 	
	const request = require('request');	
	request('https://github.com/BoletoNet/boletonet/issues?page='+ indice, { json: false }, (err, res, body) => 
	{		
		$ = cheerio.load(body);				
		$('a').each(function (index, element) 
		{			
			if($(element).attr('id') != undefined)
			{
				respRequisicao = { id : $(element).attr('id'), content: $(element).text() };
			    listResp.push(respRequisicao);
				console.log(respRequisicao); 
			}			
		});						
		if((indice + 1) === 11)
		   saveList(); 	
			
		comunicaAoCliente('Indice:' + indice + ' executado');					
	});	
}
function saveList()
{
	mongoose.connect(process.env.MONGO_URI);		
    var Schema = mongoose.Schema;   
    var responseSchema = new Schema
	(
	  {
		responses:[Object]
	  }
	);  	
	var ResponseModel = mongoose.model('responses', responseSchema);  
	var responseDB = new ResponseModel({responses : listResp});
	responseDB.save(function (err)
	{
		if (err) return console.log(err);		
	});
} 