// Configuração da API
const API_URL = 'https://agora-production-900d.up.railway.app/api';

// Headers padrão para todas as requisições
const defaultHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Access-Control-Allow-Origin': '*'
};

// Carrega os números na tabela ao iniciar
async function loadNumbers() {
    try {
        const response = await fetch(`${API_URL}/numbers`, {
            headers: defaultHeaders
        });
        const numbers = await response.json();
        document.getElementById('numbersContainer').innerHTML = '';
        numbers.forEach(item => addNumberToTable(item));

        // Carrega a URL de fallback do servidor
        const fallbackResponse = await fetch(`${API_URL}/fallback-url`, {
            headers: defaultHeaders
        });
        const fallbackData = await fallbackResponse.json();
        document.getElementById('fallbackUrl').value = fallbackData.url || '';
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
    }
}

// Carrega os números ao iniciar a página
window.onload = loadNumbers;

// Adiciona evento de submit ao formulário
document.getElementById('whatsappForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    
    try {
        const phoneNumber = document.getElementById('phoneNumber').value.trim();
        const operator = document.getElementById('operator').value.trim();
        const message = document.getElementById('message').value.trim() || "oii vi seu anuncio";

        const response = await fetch(`${API_URL}/numbers`, {
            method: 'POST',
            headers: defaultHeaders,
            body: JSON.stringify({
                phoneNumber,
                operator,
                message,
                type: "Tipo Exemplo",
                status: "Ativo"
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Erro ao adicionar número');
        }
        
        const newNumber = await response.json();
        addNumberToTable(newNumber);
        document.getElementById('whatsappForm').reset();
    } catch (error) {
        console.error('Erro detalhado:', error);
        alert('Erro ao adicionar número: ' + error.message);
    }
});

// Função para adicionar número à tabela
function addNumberToTable(item) {
    const newRow = document.createElement('tr');
    newRow.dataset.id = item._id;
    newRow.innerHTML = `
        <td>${item.phoneNumber}</td>
        <td>${item.operator}</td>
        <td>${item.type || 'Tipo Exemplo'}</td>
        <td><a href="redirect.html?phone=${item.phoneNumber}&message=${encodeURIComponent(item.message || 'oii vi seu anuncio')}" target="_blank">Link Original</a></td>
        <td class="status">${item.status || 'Ativo'}</td>
        <td>
            <button onclick="removeNumber(this)">Excluir</button>
            <button onclick="toggleStatus(this)">${item.status === 'Ativo' ? 'Desativar' : 'Ativar'}</button>
        </td>
    `;
    document.getElementById('numbersContainer').appendChild(newRow);
}

// Função para excluir número
async function removeNumber(button) {
    try {
        const row = button.parentNode.parentNode;
        const id = row.dataset.id;

        const response = await fetch(`${API_URL}/numbers/${id}`, {
            method: 'DELETE',
            headers: defaultHeaders
        });

        if (!response.ok) {
            throw new Error('Erro ao deletar número');
        }
        
        row.remove();
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao deletar número');
    }
}

// Função para alternar status
async function toggleStatus(button) {
    try {
        const row = button.parentNode.parentNode;
        const id = row.dataset.id;
        const statusCell = row.querySelector('.status');
        const newStatus = statusCell.textContent === 'Ativo' ? 'Inativo' : 'Ativo';

        const response = await fetch(`${API_URL}/numbers/${id}`, {
            method: 'PUT',
            headers: defaultHeaders,
            body: JSON.stringify({ status: newStatus })
        });

        if (!response.ok) {
            throw new Error('Erro ao atualizar status');
        }
        
        statusCell.textContent = newStatus;
        button.textContent = newStatus === 'Ativo' ? 'Desativar' : 'Ativar';
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao atualizar status');
    }
}

// Gerenciamento da URL de fallback
const fallbackUrlInput = document.getElementById('fallbackUrl');

fallbackUrlInput.addEventListener('input', async function() {
    try {
        let url = fallbackUrlInput.value.trim();
        if (!url.startsWith('http://') && !url.startsWith('https://') && url.length > 0) {
            url = 'http://' + url;
        }

        // Salva a URL no servidor
        const response = await fetch(`${API_URL}/fallback-url`, {
            method: 'POST',
            headers: defaultHeaders,
            body: JSON.stringify({ url })
        });

        if (!response.ok) {
            throw new Error('Erro ao salvar URL');
        }
    } catch (error) {
        console.error('Erro ao salvar URL:', error);
    }
});