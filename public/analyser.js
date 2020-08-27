  var socket = io();
  var etapa = 0; 	  
  var fimPaginacao = 0;   	  	  
  var lstModulos = [];	  
  var topicosGeral = [];
  var contador = 0; 
  
  $( document ).ready(function()
  {
	 $('#txtModulos').val('{}');
  });
  
  function iniciarCrawler(inicio)
  {
	$('#iniciarCrawler').text('Aguarde...'); 
	$('#iniciarCrawler').prop("disabled", true); 					
	try{
		if($('#txtModulos').val() === '')
		{
			throw('Você precisa inserir algum json na caixa de texto');
		}else{		
			jQuery.each(JSON.parse($('#txtModulos').val()), function(i, val)
			{
				lstModulos.push(i); 					
			});
			interarCrawler(inicio);
		}		
	}catch(exception){
		alert(exception); 			
		$('#iniciarCrawler').text('Iniciar'); 
		$('#iniciarCrawler').prop("disabled", false); 			
	} 				
  }	  
  function interarCrawler(inicio)
  {
	fim = lstModulos.length; 
	socket.emit('messageBroadcast',lstModulos[inicio]);		
	inicio = inicio + 1; 		
	console.log(inicio); 
	
	if(inicio < lstModulos.length)
	   interarCrawler(inicio);		        				
  }  
  socket.on('messageBroadcast', function(msg)
  { 		
	if((msg ==='FIM'))
	{			
		try{
			filtraRetornos()
		}catch(exception){
			console.log(exception); 
		}finally{
			$('#iniciarCrawler').text('Iniciar'); 
			$('#iniciarCrawler').prop("disabled", false); 			
		} 	  			
	}			  
	topicosGeral.push(msg); 							
  });	  
  function filtraRetornos()
  {
	if((contador + 1) < lstModulos.length)
	{
	   contador++; 	
	}else{
	   var lstTopicos = lstModulos;
	   for(var i = 0; i< lstTopicos.length;i++)			
		  criaUlClassificacao(lstTopicos[i],topicosGeral.filter(x => x.tipoTopico === lstTopicos[i]));																			
	}
  }	  
  function criaUlClassificacao(tipoTopico,array)
  {		
	if (array.length > 0)
	{ 
		var list = $("#divResultados").append("<ul class=\"list-group\"></ul>");
		list.append("<li class=\"\list-group-item active\">"+ tipoTopico +"</li>");	
		
		for (var i = 1; i < 2; i++)		
			list.append("<li class=\"\list-group-item\">"+ array[i].content +"</li>");			
	}
  } 	   