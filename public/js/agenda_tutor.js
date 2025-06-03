// Updated script.js - Frontend with better error handling and user feedback
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.start-class').forEach(btn => {
    btn.addEventListener('click', async () => {
      const evt = btn.closest('.event');
      const title = evt.dataset.title;
      const host = evt.dataset.host;
      const guest = evt.dataset.guest;

      // Validate data
      if (!title || !host || !guest) {
        alert('Erro: Dados da aula incompletos');
        return;
      }

      // Show loading state
      const originalText = btn.innerText;
      btn.disabled = true;
      btn.innerText = 'Criando reunião...';
      btn.style.opacity = '0.7';

      try {
        console.log('Creating meeting:', { title, host, guest });
        
        const response = await fetch('/api/create-meeting', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 
            title, 
            host, 
            guest,
            start_time: new Date().toISOString(), // Current time, you can modify this
            duration: 60 // 60 minutes, you can modify this
          })
        });

        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || `Erro HTTP: ${response.status}`);
        }

        if (!data.success) {
          throw new Error(data.message || 'Falha desconhecida');
        }

        // Success feedback
        showSuccessMessage(data, host, guest);
        
        // Optional: Update button to show success
        btn.innerText = '✓ Reunião criada';
        btn.style.backgroundColor = '#4CAF50';
        
        // Reset button after 3 seconds
        setTimeout(() => {
          btn.innerText = originalText;
          btn.style.backgroundColor = '';
          btn.disabled = false;
          btn.style.opacity = '1';
        }, 3000);

      } catch (error) {
        console.error('Error creating meeting:', error);
        
        // Show error message
        showErrorMessage(error.message);
        
        // Reset button
        btn.disabled = false;
        btn.innerText = originalText;
        btn.style.opacity = '1';
      }
    });
  });
});

function showSuccessMessage(data, host, guest) {
  const message = `
✅ Reunião criada com sucesso!

🔗 Link: ${data.join_url}
📧 E-mails enviados para:
   • ${host}
   • ${guest}

📅 ID da Reunião: ${data.meeting_id}
⏰ Horário: ${new Date(data.start_time).toLocaleString('pt-PT')}

Os participantes receberão todos os detalhes por e-mail.
  `.trim();

  alert(message);
}

function showErrorMessage(errorMessage) {
  const message = `
❌ Erro ao criar reunião

Detalhes: ${errorMessage}

Possíveis soluções:
• Verifique sua conexão com a internet
• Tente novamente em alguns segundos
• Contacte o suporte se o problema persistir
  `.trim();

  alert(message);
}

// Optional: Add a function to copy meeting link to clipboard
function copyToClipboard(text) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(() => {
      console.log('Link copied to clipboard');
    });
  }
}