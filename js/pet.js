//app.initialize();

var db = window.openDatabase("Database", "1.0", "Petgato", 2000);
db.transaction(createDB, errorDB, successDB);
document.addEventListener("deviceready", onDeviceReady, false);


function onDeviceReady() {
	db.transaction(createDB, errorDB, successDB);
}


// Trata erro de criação do Banco de Dados
function errorDB(err) {
	alert("Erro: " + err);
}

// Executa se criou o Banco de Dados com sucesso
function successDB() { }


//Cria a tabela se a mesma não existir    
function createDB(tx) {
	tx.executeSql('CREATE TABLE IF NOT EXISTS Pet (id INTEGER PRIMARY KEY, nome VARCHAR(50), qtd int, preco float )');
    tx.executeSql('CREATE TABLE IF NOT EXISTS Carrinho (id INTEGER PRIMARY KEY, nome VARCHAR(50), qtd int, preco float )');
}

//CRIAÇÃO DO BANCO TERMINA AQUI
 //VALIDAR O FORMS
 (function(){
    
    'use strict';
    window.addEventListener('load', function() {
    // Fetch all the forms we want to apply custom Bootstrap validation styles to
    var forms = document.getElementsByClassName('needs-validation');
    // Loop over them and prevent submission
    var validation = Array.prototype.filter.call(forms, function(form) {
        
    form.addEventListener('submit', function(event) {
    if (form.checkValidity() === false) {
        event.preventDefault();
        event.stopPropagation();
    }
    form.classList.add('was-validated');
    }, false);
    });
    }, false);
 
 })();
 function SomenteNumero(e){
    var tecla=(window.event)?event.keyCode:e.which;   
      if((tecla>47 && tecla<58)) return true;
      else{
         if (tecla==8 || tecla==0) return true;
      else  
         alert ( "Este campo aceita apenas números.");
         return false;
      }
}
//FIM VALIDAR O FORMS

// Prepara para incluir registro na tabela Pet
function pet_insert() {
	db.transaction(pet_insert_db, errorDB, successDB);
}

// Inclui registro na tabela Pet
function pet_insert_db(tx) {

	var nome = $("#pet_nome").val();
    var qtd = $("#pet_qtd").val();
    var preco = $("#pet_preco").val();

    //converter 
    qtd = parseInt(qtd); 
    preco = parseFloat(preco);

    //parar a inserção chama validação do forms jquery
    if(nome.length < 3 || qtd <=0 || preco <=0 ){
        return false;
    }
    if(nome =='' || qtd =='' || preco ==''){
        return false;
    }
    

    //-------------------------------------------------
    tx.executeSql('INSERT INTO Pet (nome, qtd, preco) VALUES ("' + nome.toUpperCase() + '", "' + qtd + '", "' + preco + '")');
    
    cadastrado();

	pet_view();
}
function cadastrado(){
    alert("CADASTRADO COM SUCESSO!")
}
//--------------------------------------------
//MONTA A MATRIZ COM OS REGISTRO DA TABELA PET
function pet_view(){
    db.transaction(pet_view_db, errorDB, successDB); 
}

//monta a matriz com os registros da tabela pet
function pet_view_db(tx){
    tx.executeSql('SELECT * FROM Pet',[], pet_view_data, errorDB);
}


function pet_view_data(tx, results){

    $("#pet_listagem").empty();
    var len = results.rows.length;
    if (len === "" || len === 0) {
        $("#alert_visualizar").append(
            "<div class='alert alert-warning' role='alert'>" +
                 "NENHUM PET DISPONÍVEL NO MOMENTO!" +
             "</div>"
        )
    }else{
        for (var i = 0; i < len; i++){
            $("#pet_listagem").append("<tr class='pet_item_lista'>"+

            "<td><h6 id='id_id'>"+ results.rows.item(i).id + "</h6></td>"+
            "<td><h6 class='.id_nome'>"+ results.rows.item(i).nome + "</h6></td>"+
            "<td><h6>"+ results.rows.item(i).qtd + "</h6></td>"+
            "<td><h6 id='id_preco'>"+"R$ "+results.rows.item(i).preco+ "</h6></td>"+
            "<td><input type='button' class='btn btn-success btn-sm' data-toggle='modal' data-target='#tela_carrinho' value='+' onclick='pet_carrinho_abrir_tela(" + results.rows.item(i).id + ")'></input>"+
            "</td></tr>");
        }
    }

}

//FUNÇÕES DO CARRINHO DE COMPRAS
// Prepara para incluir registro na tabela Pet
function pet_carrinho_abrir_tela(pet_id) {
    
    $("#tela_carrinho").show();

    $("#pet_id_update").val(pet_id); // id repassado na função
    pet_exibecart(); // chamando função de exibir carrinho

}

// função executada quando clicada em efetutuar compra
function pet_exibecart() {
    db.transaction(pet_insert_carrinho_db, errorDB, successDB);
}
// função atualiza dados do estoque após compra
function pet_insert_carrinho_db(tx) {

    var pet_id_novo = $("#pet_id_update").val(); // pegando o valor do id

    // executa ações no bd
    tx.executeSql(
        'SELECT * FROM Pet WHERE id = ?', [pet_id_novo],
            function(tx, results){
                var nomeCartt = document.getElementById("nomeCart");
                var qtdCartt = document.getElementById("qtdCart");
                var valorCartt = document.getElementById("valorCart");
    
                for(var i = 0; i < results.rows.length; i++) {
                    var row = results.rows.item(i);
                    var nome_pet = row.nome;
                    var qtdEstoque = row.qtd;
                    var precoTot = row.preco;
                    nomeCartt.innerHTML += "<span class='font-weight-light'>" + row.nome + "</span>";
                    qtdCartt.innerHTML += "<span class='font-weight-light'>" + row.qtd +" UNIDADE(S)"+"</span>";
                    valorCartt.innerHTML += "<span class='font-weight-light'>" + row.preco + "</span>";
                    $("#pet_qtd_update").val(qtdEstoque);
                    $("#pet_preco").val(precoTot);
                    $("#nome_pet").val(nome_pet);
                }
            }
    );
}

// função exibe subtotal
function subTotalCompra() {
    var total = document.getElementById("subtot");

    var escQtdSub = $(".escQtdSub").val();
    var curso_preco_compra = $("#pet_preco").val();

    var subTotal = curso_preco_compra * escQtdSub; // subtotal

    console.log(subTotal)

    total.innerHTML = "<span class='font-weight-normal'>" + subTotal.toFixed(2) + "</span>"; // mostrando subtotal
    $("#pet_total").val(subTotal);
}



//FUNÇÕES DE INSERIR NA TABELA COMPRA 

// função executada ao efetuar compra
function pet_compra() {
    db.transaction(pet_update_db, errorDB, successDB);
}
// função que realiza ação de update de estoque
function pet_update_db(tx) {
    var pet_id_novo = $("#pet_id_update").val(); // pegando o valor do id
    var pet_qtd_novo = $("#pet_qtd_update").val();

    //DECREMENTANDO DO ESTOQUE
    var escQtd= $("#qtdEsc").val();
    var decEstoque = pet_qtd_novo - escQtd;
    
    //para nova tabela
    var pet_nome_novo = $("#nome_pet").val();
    var pet_preco_novo = $("#pet_total").val();

    // update do estoque na bd
    tx.executeSql('UPDATE Pet SET qtd = "' + decEstoque + '" WHERE id = "' + pet_id_novo + '" ');
    //cadastra na tabela carrinho
    tx.executeSql('INSERT INTO Carrinho (nome, qtd, preco) VALUES ("' + pet_nome_novo.toUpperCase() + '", "' + escQtd + '", "' + pet_preco_novo + '")');

    // exibe alerta de sucesso na compra
    $("#alert_visualizar").append(
        "<div class='alert alert-success bg-success' role='alert'>" +
            "<h5 class='text-white'>" + "ADICIONADO AO CARRINHO!" + "</h5>" +
         "</div>"
    );

    // telas exibição
    // recarrega pagina após quase 1seg
    setTimeout(function(){
        location.reload(1);
    }, 1000);
    $("#tela_carrinho").hide();
}

function modalClose() {
    location.reload(true);
}


//função FINAL DE COMPRAAAAAAAAAAA -------------------------------------------------------------------------------
//monta a matriz com os registros da tabela carrinho

function pet_view_carrinho(){
    db.transaction(pet_view_carrinho_db, errorDB, successDB); 
}

function pet_view_carrinho_db(tx){
    tx.executeSql('SELECT * FROM Carrinho',[], carrinho_view_data, errorDB);
}

function carrinho_view_data(tx, results){

    $("#pet_finaliza_compra").empty();
    var len = results.rows.length;
    if (len === "" || len === 0) {
        $("#alert").append(
            "<div class='alert alert-warning' role='alert'>" +
                 "NÃO FOI ADICIONADO NENHUM ANIMAL NO CARRINHO!" +
             "</div>"
        )
    }else{
        var total_carrinho = 0;
        for (var i = 0; i < len; i++){
            $("#pet_finaliza_compra").append("<tr class='pet_item_carrinho'>"+

            "<td><h6 id='id_id'>"+ results.rows.item(i).id + "</h6></td>"+
            "<td><h6 class='.id_nome'>"+ results.rows.item(i).nome + "</h6></td>"+
            "<td><h6>"+ results.rows.item(i).qtd + "</h6></td>"+
            "<td><h6 id='id_preco'>"+ "R$ "+results.rows.item(i).preco+ "</h6></td>"+
            "</td></tr>");
            total_carrinho= total_carrinho + results.rows.item(i).preco
        }
    }
    if(total_carrinho == undefined){
        total_carrinho=0;
    }
        $("#TotalCompra").append("<strong><h3> R$ "+total_carrinho.toFixed(2)+"</h3></strong>")
}



function reset_carrinho(){
    db.transaction(reset_carrinho_db, errorDB, successDB); 
}

function reset_carrinho_db(tx){
    var total_carrinho = $("#TotalCompra").val();
        
        $("#alert_reset_carrinho").append(
            "<div class='alert alert-success' role='alert'>" +
                 "COMPRA CONCLUÍDA COM SUCESSO!" +
             "</div>"
        )
        tx.executeSql('DELETE FROM Carrinho');
    
    setTimeout(function(){
        location.reload(1);
    }, 1000);
}

//FUNÇÃO PARA APAGAR TODOS OS DADOS APP

function reset(){
    db.transaction(reset_db, errorDB, successDB); 
}

function reset_db(tx){
    tx.executeSql('DELETE FROM Carrinho');
    tx.executeSql('DELETE FROM Pet');
    

    setTimeout(function(){
        location.reload(1);
    }, 50);
}



