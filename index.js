	const express = require('express');
	const path = require('path');
	const app = express();
	var http = require('http').Server(app);
	var httpCrawler = require('http');
	var io = require('socket.io')(http);
	var port = process.env.PORT || 3002;
	var respRequisicao; 
	var listResp = [];
	var urlBase = 'https://www.npmjs.com/search?q=';
	app.use(express.static(path.join(__dirname, 'public')));
	/***************************  Socket.io     ************************************/
	/*******************************************************************************/
	app.get('/', function(req, res)
	{
	  res.sendFile(__dirname + '/index.html');
	});
	io.on('connection', function(socket)
	{
	  socket.on('messageBroadcast', function(etapaAtual)
	  {	
		mediadorCrawler(etapaAtual);	       
	  });
	});
	http.listen(port, function(){
		console.log('listening on *:'+ port);
	});
	function comunicaAoCliente(msg)
	{
		io.emit('messageBroadcast', msg);
	} 
	/***************************** Específicas do Crawler *****************************/
	var cheerio = require("cheerio");
	function mediadorCrawler(lib)
	{		
		if(lib === null){ 
		    comunicaAoCliente('FIM');	
	    }else{
			console.log("Analisando a biblioteca:"+ lib); 		
			makeRequest(lib);
		}				
	} 
	function makeRequest(indice)
	{ 	
		const request = require('request');	
		request(urlBase + indice,{ json: false },(err, res, body) => 
		{	
			$ = cheerio.load(body);				
			$('p').each(function (index, element) 
			{		
				var desc = $(element).text(); 	
				respRequisicao = { content: $(element).text() , tipoTopico : indice};							
				comunicaAoCliente(respRequisicao);							
			});			
			comunicaAoCliente('FIM');
		});	
	}