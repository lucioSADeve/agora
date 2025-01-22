// Configuração da API
const API_URL = 'http://localhost:3000/api';

// Carrega os números na tabela ao iniciar
async function loadNumbers() {
    try {
        const response = await fetch(`${API_URL}/numbers`);
        const numbers = await response.json();
        document.getElementById('numbersContainer').innerHTML = '';
        numbers.forEach(item => addNumberToTable(item));
    } catch (error) {
        console.error('Erro ao carregar números:', error);
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

        console.log('Enviando dados:', { phoneNumber, operator, message }); // Debug

        const response = await fetch(`${API_URL}/numbers`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                phoneNumber,
                operator,
                message,
                type: "Tipo Exemplo",
                status: "Ativo"
            })
        });

        console.log('Status da resposta:', response.status); // Debug

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
        <td><a href="https://wa.me/${item.phoneNumber}?text=${encodeURIComponent(item.message || 'oii vi seu anuncio')}" target="_blank">Link Original</a></td>
        <td class="status">${item.status || 'Ativo'}</td>
        <td>
            <button onclick="removeNumber(this)">Excluir</button>
            <button onclick="toggleStatus(this)">Desativar</button>
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
            method: 'DELETE'
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
            headers: {
                'Content-Type': 'application/json',
            },
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
fallbackUrlInput.value = localStorage.getItem('fallbackUrl') || '';

fallbackUrlInput.addEventListener('input', function() {
    let url = fallbackUrlInput.value.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://') && url.length > 0) {
        url = 'http://' + url;
    }
    localStorage.setItem('fallbackUrl', url);
});