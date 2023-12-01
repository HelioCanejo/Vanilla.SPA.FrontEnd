// Inicializa uma string com uma opção padrão para o dono (owner) no formato de um elemento de opção HTML.
var ownerOptions = '<option value="">-- Selecione --</option>';

// Função principal chamada quando o documento HTML está pronto.
function myHome() {
    // Muda o título para 'Novo Documento'.
    changeTitle('Novo Documento');

    // Obtém as opções de donos para preencher o menu suspenso.
    getOwnersToSelect();

    // Verifica se há uma guia aberta na sessão e a exibe.
    if (sessionStorage.openTab == undefined)
        sessionStorage.openTab = 'item';
    showTab(sessionStorage.openTab);

    // Adiciona eventos de clique aos botões para mostrar as guias de dono (owner) e item.
    $('#btnNewOwner').click(() => { showTab('owner'); });
    $('#btnNewItem').click(() => { showTab('item'); });

    // Adiciona um evento de envio de formulário para processar e enviar dados.
    $('.tabs form').submit(sendData);
}

// Função para processar e enviar dados do formulário.
function sendData(ev) {
    ev.preventDefault();

    // Inicializa um objeto JSON vazio.
    var formJSON = {};

    // Obtém os dados do formulário e os adiciona ao objeto JSON, removendo tags HTML.
    const formData = new FormData(ev.target);
    formData.forEach((value, key) => {
        formJSON[key] = stripTags(value);
        $('#' + key).val(formJSON[key]);
    });

    // Verifica se algum campo está vazio e retorna false se houver.
    for (const key in formJSON)
        if (formJSON[key] == '')
            return false;

    // Chama a função para salvar os dados.
    saveData(formJSON);
    return false;
}

// Função para salvar dados no servidor.
function saveData(formJSON) {
    // Constrói a URL da solicitação com base no tipo de formulário.
    var requestURL = `${app.apiBaseURL}/${formJSON.type}s`;
    delete formJSON.type;

    // Modifica propriedades para garantir consistência no envio de dados.
    if (formJSON.ownerName != undefined) {
        formJSON['name'] = formJSON.ownerName;
        delete formJSON.ownerName;
    }

    if (formJSON.itemName != undefined) {
        formJSON['name'] = formJSON.itemName;
        delete formJSON.itemName;
    }

    // Faz uma solicitação AJAX usando jQuery para enviar dados ao servidor.
    $.ajax({
        type: "POST",
        url: requestURL,
        data: JSON.stringify(formJSON),
        contentType: "application/json; charset=utf-8",
        dataType: "json"
    })
        .done(() => {
            // Se bem-sucedido, atualiza o conteúdo da guia com uma mensagem de sucesso.
            var viewHTML = `
                <form>
                    <h3>Oba!</h3>
                    <p>Cadastro efetuado com sucesso.</p>
                    <p>Obrigado...</p>
                </form>
            `;
        })
        .fail((error) => {
            // Se falhar, mostra uma mensagem de erro no console.
            console.error('Erro:', error.status, error.statusText, error.responseJSON);
            var viewHTML = `
                <form>
                    <h3>Oooops!</h3>
                    <p>Não foi possível realizar o cadastro. Ocorreu uma falha no servidor.</p>
                </form>
            `;
        })
        .always(() => {
            // Atualiza o conteúdo da guia com o resultado da solicitação.
            $('.tabBlock').html(viewHTML);
            // Reseta os formulários de dono (owner) e item.
            $('#formNewOwner').trigger('reset');
            $('#formNewItem').trigger('reset');
        });

    return false;
}

// Função para alternar entre as guias de dono (owner) e item.
function showTab(tabName) {
    // Reseta os formulários de dono (owner) e item.
    $('#formNewOwner').trigger('reset');
    $('#formNewItem').trigger('reset');

    // Exibe a guia correspondente com base no nome fornecido.
    switch (tabName) {
        case 'owner':
            $('#tabOwner').show();
            $('#tabItem').hide();
            $('#btnNewOwner').attr('class', 'active');
            $('#btnNewItem').attr('class', 'inactive');
            sessionStorage.openTab = 'owner';
            break;
        case 'item':
            $('#tabItem').show();
            $('#tabOwner').hide();
            $('#btnNewItem').attr('class', 'active');
            $('#btnNewOwner').attr('class', 'inactive');
            break;
    }
}

// Função para obter opções de dono (owner) para preenchimento do menu suspenso.
function getOwnersToSelect() {
    // Constrói a URL da solicitação para obter donos (owners).
    var requestURL = `${app.apiBaseURL}/owners`;

    // Faz uma solicitação GET usando jQuery para obter dados de donos (owners).
    $.get(requestURL)
        .done((apiData) => {
            // Processa os dados obtidos e adiciona opções ao menu suspenso de dono (owner).
            apiData.forEach((item) => {
                ownerOptions += `<option value="${item.id}">${item.id} - ${item.name}</option>`;
            });

            // Atualiza o conteúdo do menu suspenso de dono (owner) no formulário.
            $('#owner').html(ownerOptions);
        })
        .fail((error) => {
            // Em caso de falha, exibe uma mensagem de erro no console.
            console.error('Erro:', error.status, error.statusText, error.responseJSON);
        });
}

// Executa a função myHome quando o documento estiver pronto.
$(document).ready(myHome);