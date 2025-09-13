document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const eventId = urlParams.get("id");
  const eventContainer = document.getElementById("event-details");

  fetch("https://json-backend-take-my-ticket.onrender.com")
    .then(res => res.json())
    .then(data => {
      
      const events = data.events || [];
      const event = events.find(e => e.id === eventId);

      if (!event) {
        eventContainer.innerHTML = "<p>Event not found!</p>";
        return;
      }

      eventContainer.innerHTML = `
        <div class="event-card">
          <img src="${event.image}" alt="${event.title || 'Event Image'}" />
          <h2>${event.title || 'Event'}</h2>
          <p><strong>Venue:</strong> ${event.venue}</p>
          <p><strong>Date:</strong> ${event.date}</p>
          <p><strong>Time:</strong> ${event.time}</p>
          <p><strong>Price:</strong> ₹${event.price}</p>
          <p><strong>Tickets Available:</strong> ${event.availableTickets}</p>
          <div class="buttons">
            <button onclick="goBack()">⬅ Back</button>
            <button onclick="bookNow('${event.id}')">🎟️ Book Ticket</button>
          </div>
        </div>
      `;
    })
    .catch(err => {
      eventContainer.innerHTML = "<p>Error loading event details!</p>";
      console.error(err);
    });
});

function goBack() {
  window.location.href = "index.html";
}

function bookNow(id) {
  window.location.href = `booking.html?id=${id}`;
}
