var app = require('express')();
var http = require('http').Server(app);
var httpCrawler = require('http');
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;
var respRequisicao; 
var listResp = [];
const { MongoClient } = require("mongodb");
var mongoose = require('mongoose'); 
var lstTopicos = ["Arquivo", "Remessa","Retorno",  "Código","Barra","Certificado","Boleto", "Layout","Carteira", "CNAB", 
                  "PDF", "Carnê", "Impressão", "Caixa","Itaú","Bradesco","Santander","Votorantim", "Ajuda","Dúvida","Erro","Problema"];
/***************************  Socket.io     ************************************/
/*******************************************************************************/
app.get('/', function(req, res)
{
  res.sendFile(__dirname + '/index.html');
});

app.get('/listIssues', function(req, res)
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
   ResponseModel.findOne({ 'name.last': 'Ghost' }, function (err, responses)
   {
       if (err) return handleError(err);
		
	   res.send(responses);	    		
   });  
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
		var tipoTopico = "indefinido";  
		$ = cheerio.load(body);				
		$('a').each(function (index, element) 
		{			
			if($(element).attr('id') != undefined)
			{				
				for(var i=0;i<lstTopicos.length;i++)
				{
					if($(element).text().includes(lstTopicos[i]))
					{
					  	tipoTopico = lstTopicos[i];
						i = lstTopicos.length;
					}
				}				
				respRequisicao = { id : $(element).attr('id'), content: $(element).text() , tipoTopico : tipoTopico};				
			    listResp.push(respRequisicao);
				console.log(respRequisicao); 
			}			
			tipoTopico = "indefinido";  
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