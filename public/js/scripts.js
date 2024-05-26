document.addEventListener('DOMContentLoaded', () => {
  if (window.location.pathname === '/tickets') {
    fetch('/api/tickets')
      .then(response => response.json())
      .then(tickets => {
        const ticketsTable = document.getElementById('ticketsTable');
        tickets.forEach(ticket => {
          const row = document.createElement('tr');
          row.innerHTML = `
            <td>${ticket.number}</td>
            <td>${new Date(ticket.date.toDate()).toLocaleDateString()}</td>
            <td>${new Date(ticket.date.toDate()).toLocaleTimeString()}</td>
          `;
          ticketsTable.appendChild(row);
        });
      });

    document.getElementById('ticketForm').addEventListener('submit', event => {
      event.preventDefault();
      const ticketNumber = event.target.ticketNumber.value;
      fetch('/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ticketNumber })
      })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            alert('Ticket validado correctamente');
          } else {
            alert('Error: ' + data.message);
          }
        });
    });
  }

  if (window.location.pathname === '/resumen') {
    fetch('/api/resumen')
      .then(response => response.json())
      .then(resumen => {
        const resumenContainer = document.getElementById('resumenContainer');
        Object.keys(resumen).forEach(month => {
          const monthDiv = document.createElement('div');
          monthDiv.innerHTML = `<h2>Mes: ${month}</h2>`;
          Object.keys(resumen[month]).forEach(week => {
            const weekDiv = document.createElement('div');
            weekDiv.innerHTML = `<h3>Semana ${week}</h3>`;
            const list = document.createElement('ul');
            resumen[month][week].forEach(ticket => {
              const listItem = document.createElement('li');
              listItem.textContent = `Ticket: ${ticket.number} - Fecha: ${new Date(ticket.date.toDate()).toLocaleDateString()} - Hora: ${new Date(ticket.date.toDate()).toLocaleTimeString()}`;
              list.appendChild(listItem);
            });
            weekDiv.appendChild(list);
            monthDiv.appendChild(weekDiv);
          });
          resumenContainer.appendChild(monthDiv);
        });
      });
  }
});
