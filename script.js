const form = document.getElementById('tripForm');
const output = document.getElementById('planOutput');
const results = document.getElementById('results');
const resultTitle = document.getElementById('resultTitle');
const savedList = document.getElementById('savedList');
const STORAGE_KEY = 'trippilot_saved_plans_v1';
let currentPlanText = '';
let currentPlanData = null;

const activityBank = {
  default: {
    food: ['Try a locally loved lunch spot', 'Explore a food hall or market', 'Book a dinner near your hotel'],
    beaches: ['Beach or waterfront break', 'Sunset walk by the water', 'Easy morning by the shore'],
    history: ['Historic district walk', 'Museum or landmark visit', 'Guided walking tour'],
    adventure: ['Signature outdoor activity', 'Scenic tour or excursion', 'Active half-day experience'],
    nightlife: ['Rooftop, live music, or evening district', 'Dessert and late walk', 'Relaxed bar or lounge'],
    nature: ['Park, garden, or scenic overlook', 'Nature trail or waterfront path', 'Sunrise or sunset viewpoint'],
    shopping: ['Local shops and souvenirs', 'Boutique district stroll', 'Market stop'],
    family: ['Kid-friendly attraction', 'Interactive museum or easy activity', 'Flexible family downtime']
  },
  'puerto rico': {
    food: ['Old San Juan food stop', 'Piñones kiosks or casual local bites', 'Dinner in Condado or Distrito T-Mobile'],
    beaches: ['Condado or Isla Verde beach block', 'Luquillo Beach afternoon', 'Sunset walk near the water'],
    history: ['Castillo San Felipe del Morro', 'Old San Juan blue cobblestone walk', 'Castillo San Cristóbal'],
    adventure: ['El Yunque rainforest day', 'Zipline or ATV excursion', 'Bioluminescent bay tour'],
    nightlife: ['La Placita evening', 'Distrito T-Mobile night out', 'Old San Juan cocktail walk'],
    nature: ['El Yunque scenic stops', 'Lagoon or coastal walk', 'Rainforest waterfall stop'],
    shopping: ['Old San Juan boutiques', 'Plaza Las Américas shopping break', 'Local artisan shops'],
    family: ['Fort visit with easy pacing', 'Beach picnic', 'Family-friendly rainforest overlook']
  },
  miami: {
    food: ['Little Havana food walk', 'Wynwood lunch stop', 'Dinner in Brickell or South Beach'],
    beaches: ['South Beach morning', 'Key Biscayne beach break', 'Sunset waterfront walk'],
    history: ['Art Deco Historic District', 'Vizcaya Museum & Gardens', 'Little Havana cultural stop'],
    adventure: ['Everglades airboat tour', 'Jet ski or boat tour', 'Biscayne Bay cruise'],
    nightlife: ['South Beach night out', 'Brickell rooftop', 'Wynwood evening'],
    nature: ['Fairchild Tropical Botanic Garden', 'Key Biscayne scenic stop', 'Everglades half-day'],
    shopping: ['Design District', 'Lincoln Road', 'Bayside Marketplace'],
    family: ['Frost Science Museum', 'Zoo Miami', 'Beach + park day']
  },
  'new orleans': {
    food: ['French Quarter food crawl', 'Magazine Street lunch', 'Classic Creole dinner'],
    beaches: ['Riverfront walk', 'Lake Pontchartrain sunset', 'Waterfront coffee stop'],
    history: ['French Quarter walking tour', 'Garden District mansions', 'WWII Museum'],
    adventure: ['Swamp tour', 'Steamboat cruise', 'Ghost tour'],
    nightlife: ['Frenchmen Street music', 'Bourbon Street walk-through', 'Jazz club evening'],
    nature: ['City Park', 'Bayou St. John', 'Audubon Park'],
    shopping: ['Magazine Street shops', 'French Market', 'Royal Street galleries'],
    family: ['Audubon Aquarium', 'City Park day', 'Streetcar ride']
  },
  'baton rouge': {
    food: ['Local Cajun lunch', 'Downtown dinner stop', 'Casual Southern breakfast'],
    beaches: ['Mississippi Riverfront walk', 'Waterfront sunset stop', 'Easy outdoor break'],
    history: ['Louisiana State Capitol', 'Old State Capitol', 'USS Kidd Veterans Museum'],
    adventure: ['Bluebonnet Swamp Nature Center', 'LSU campus exploration', 'Riverfront bike/walk'],
    nightlife: ['Downtown Baton Rouge evening', 'Live music stop', 'Laid-back dessert and coffee'],
    nature: ['Bluebonnet Swamp Nature Center', 'LSU Lakes', 'BREC park stop'],
    shopping: ['Perkins Rowe', 'Local market or boutique stop', 'Mall of Louisiana'],
    family: ['Knock Knock Children’s Museum', 'USS Kidd', 'Bluebonnet Swamp']
  },
  orlando: {
    food: ['Disney Springs dinner', 'International Drive food stop', 'Local brunch spot'],
    beaches: ['Pool/resort break', 'Day trip to Cocoa Beach', 'Lake Eola walk'],
    history: ['Winter Park scenic boat tour', 'Orlando Museum of Art', 'Historic downtown Sanford'],
    adventure: ['Theme park day', 'Airboat ride', 'Water park day'],
    nightlife: ['Disney Springs evening', 'Universal CityWalk', 'Downtown Orlando'],
    nature: ['Lake Eola Park', 'Leu Gardens', 'Wekiwa Springs'],
    shopping: ['Disney Springs shops', 'Orlando outlets', 'Mall at Millenia'],
    family: ['Theme park day', 'Crayola Experience', 'ICON Park']
  },
  'new york': {
    food: ['Neighborhood pizza or bagel stop', 'Food hall lunch', 'Dinner near your evening activity'],
    beaches: ['Brooklyn waterfront', 'Hudson River Park', 'Coney Island add-on'],
    history: ['Lower Manhattan landmarks', 'Museum Mile', 'Statue of Liberty viewpoint'],
    adventure: ['Observation deck', 'Brooklyn Bridge walk', 'Bike Central Park'],
    nightlife: ['Broadway or comedy show', 'Rooftop view', 'Jazz club'],
    nature: ['Central Park', 'High Line', 'Brooklyn Botanic Garden'],
    shopping: ['SoHo shops', 'Chelsea Market', 'Fifth Avenue walk'],
    family: ['American Museum of Natural History', 'Central Park Zoo', 'Broadway matinee']
  }
};

const indoorBackups = [
  'Museum or cultural center',
  'Food hall or indoor market',
  'Shopping district or mall',
  'Coffee shop crawl with local desserts',
  'Scenic drive with photo stops',
  'Hotel pool, spa, or relaxed recovery block'
];

const packingBase = [
  'Comfortable walking shoes',
  'Portable phone charger',
  'Reusable water bottle',
  'Light jacket or layer',
  'Daily medications and copies of important documents',
  'Reservation confirmations and screenshots'
];

const examples = {
  destination: 'Puerto Rico',
  origin: 'Dallas, TX',
  budget: 1800,
  travelers: 2,
  pace: 'balanced',
  transport: 'rental car',
  lodging: 'moderate',
  vibe: 'couple',
  mustDo: 'Old San Juan, beach, good food, rainforest if possible',
  restrictions: 'No seafood. Keep the first night easy.'
};

function formatDate(date) {
  return date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}

function parseLocalDate(value) {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function currency(value) {
  return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value || 0);
}

function normalizeDestination(destination) {
  const d = destination.toLowerCase();
  if (d.includes('puerto') || d.includes('san juan')) return 'puerto rico';
  if (d.includes('miami')) return 'miami';
  if (d.includes('new orleans') || d.includes('nola')) return 'new orleans';
  if (d.includes('baton')) return 'baton rouge';
  if (d.includes('orlando')) return 'orlando';
  if (d.includes('new york') || d.includes('nyc')) return 'new york';
  return 'default';
}

function getInterests() {
  return [...document.querySelectorAll('input[name="interest"]:checked')].map(i => i.value);
}

function getTripData() {
  return {
    destination: document.getElementById('destination').value.trim(),
    origin: document.getElementById('origin').value.trim(),
    startDate: document.getElementById('startDate').value,
    endDate: document.getElementById('endDate').value,
    travelers: Number(document.getElementById('travelers').value) || 1,
    budget: Number(document.getElementById('budget').value) || 0,
    pace: document.getElementById('pace').value,
    transport: document.getElementById('transport').value,
    lodging: document.getElementById('lodging').value,
    vibe: document.getElementById('vibe').value,
    interests: getInterests(),
    mustDo: document.getElementById('mustDo').value.trim(),
    restrictions: document.getElementById('restrictions').value.trim()
  };
}

function getTripDays(startDate, endDate) {
  const start = parseLocalDate(startDate);
  const end = parseLocalDate(endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) return [];
  const days = [];
  const cursor = new Date(start);
  while (cursor <= end) {
    days.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return days;
}

function pickActivity(destinationKey, interest, index) {
  const bank = activityBank[destinationKey] || activityBank.default;
  const list = bank[interest] || activityBank.default[interest] || activityBank.default.food;
  return list[index % list.length];
}

function rotate(array, amount) {
  return array.slice(amount).concat(array.slice(0, amount));
}

function paceSlots(pace, dayIndex, totalDays) {
  const firstDay = dayIndex === 0;
  const lastDay = dayIndex === totalDays - 1;

  if (firstDay && totalDays > 1) {
    return [
      { time: '3:00 PM', type: 'arrival', label: 'Arrive, check in, and reset', cost: 0 },
      { time: '5:30 PM', type: 'food', label: 'Easy first-night neighborhood walk', cost: 20 },
      { time: '7:30 PM', type: 'food', label: 'Dinner close to lodging', cost: 35 }
    ];
  }

  if (lastDay && totalDays > 1) {
    return [
      { time: '9:00 AM', type: 'food', label: 'Breakfast and final local stop', cost: 20 },
      { time: '11:00 AM', type: 'shopping', label: 'Souvenir or scenic goodbye stop', cost: 15 },
      { time: '1:00 PM', type: 'departure', label: 'Return to hotel, pack, and depart buffer', cost: 0 }
    ];
  }

  if (pace === 'relaxed') {
    return [
      { time: '9:30 AM', type: 'food', label: 'Slow breakfast near lodging', cost: 18 },
      { time: '11:00 AM', type: 'primary', label: 'Main activity block', cost: 45 },
      { time: '1:30 PM', type: 'food', label: 'Lunch with downtime', cost: 25 },
      { time: '4:00 PM', type: 'secondary', label: 'Light activity or scenic break', cost: 25 },
      { time: '7:00 PM', type: 'food', label: 'Dinner reservation', cost: 38 }
    ];
  }

  if (pace === 'packed') {
    return [
      { time: '8:00 AM', type: 'food', label: 'Early breakfast', cost: 16 },
      { time: '9:00 AM', type: 'primary', label: 'Major activity', cost: 55 },
      { time: '12:00 PM', type: 'food', label: 'Quick lunch in the area', cost: 22 },
      { time: '1:30 PM', type: 'secondary', label: 'Second main stop', cost: 35 },
      { time: '4:30 PM', type: 'third', label: 'Bonus stop or neighborhood walk', cost: 20 },
      { time: '7:30 PM', type: 'food', label: 'Dinner', cost: 40 },
      { time: '9:30 PM', type: 'nightlife', label: 'Optional evening activity', cost: 25 }
    ];
  }

  return [
    { time: '9:00 AM', type: 'food', label: 'Breakfast near lodging', cost: 18 },
    { time: '10:30 AM', type: 'primary', label: 'Main activity block', cost: 48 },
    { time: '1:00 PM', type: 'food', label: 'Lunch in the same area', cost: 24 },
    { time: '2:30 PM', type: 'secondary', label: 'Second activity with travel buffer', cost: 32 },
    { time: '5:00 PM', type: 'rest', label: 'Rest, refresh, or hotel break', cost: 0 },
    { time: '7:00 PM', type: 'food', label: 'Dinner reservation', cost: 38 },
    { time: '8:45 PM', type: 'nightlife', label: 'Optional evening walk or dessert', cost: 18 }
  ];
}

function buildItinerary(data, days) {
  const destinationKey = normalizeDestination(data.destination);
  const interests = data.interests.length ? data.interests : ['food', 'history', 'nature'];
  const mustDoItems = data.mustDo
    ? data.mustDo.split(',').map(item => item.trim()).filter(Boolean)
    : [];

  return days.map((date, dayIndex) => {
    const dayInterests = rotate(interests, dayIndex);
    const slots = paceSlots(data.pace, dayIndex, days.length);
    let activityCursor = 0;

    const items = slots.map((slot, slotIndex) => {
      let title = slot.label;
      let note = 'Keep this block realistic with 20–35 minutes of travel or transition time before the next stop.';
      let cost = slot.cost * Math.max(data.travelers, 1);

      if (slot.type === 'arrival') {
        title = 'Arrive, check in, and get settled';
        note = data.origin ? `Travel from ${data.origin}. Keep the arrival day light so delays do not ruin the plan.` : 'Keep the arrival day light so delays do not ruin the plan.';
      } else if (slot.type === 'departure') {
        title = 'Departure buffer';
        note = 'Leave extra time for checkout, traffic, luggage, fuel, airport security, or RV setup.';
      } else if (slot.type === 'food') {
        const foodPick = pickActivity(destinationKey, 'food', dayIndex + slotIndex);
        title = slotIndex === 0 ? `Breakfast: ${foodPick}` : slot.label.includes('Dinner') ? `Dinner: ${foodPick}` : `Meal stop: ${foodPick}`;
        note = data.restrictions ? `Choose a place that matches: ${data.restrictions}` : 'Pick a restaurant in the same neighborhood as the next activity to avoid wasted travel time.';
      } else if (slot.type === 'rest') {
        title = 'Rest and reset block';
        note = 'This prevents the trip from becoming too rushed and gives room for traffic, naps, changing clothes, or unexpected delays.';
      } else if (slot.type === 'nightlife') {
        const nightPick = pickActivity(destinationKey, 'nightlife', dayIndex + slotIndex);
        title = data.interests.includes('nightlife') ? nightPick : 'Optional dessert, sunset, or easy evening walk';
        note = 'Keep this optional so the day still works if everyone is tired.';
      } else {
        const interest = dayInterests[activityCursor % dayInterests.length];
        const suggested = pickActivity(destinationKey, interest, dayIndex + slotIndex);
        const mustDo = mustDoItems[dayIndex + activityCursor - 1];
        title = mustDo && slot.type === 'primary' ? `Must-do: ${mustDo}` : suggested;
        note = `Built around your ${interest} interest. Add tickets or reservations if needed.`;
        activityCursor++;
      }

      return { ...slot, title, note, cost };
    });

    const theme = dayIndex === 0 && days.length > 1
      ? 'Arrival + easy night'
      : dayIndex === days.length - 1 && days.length > 1
        ? 'Departure + final stop'
        : `${capitalize(dayInterests[0] || 'local')} day`;

    return {
      date,
      dayNumber: dayIndex + 1,
      theme,
      items,
      dayCost: items.reduce((sum, item) => sum + item.cost, 0)
    };
  });
}

function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function calculateBudget(data, days, itinerary) {
  const nights = Math.max(days.length - 1, 1);
  const lodgingRates = { budget: 95, moderate: 165, comfort: 240, luxury: 420 };
  const transportRates = {
    'walking/uber': 35,
    'rental car': 80,
    'public transit': 18,
    rv: 65
  };

  const lodging = lodgingRates[data.lodging] * nights;
  const scheduled = itinerary.reduce((sum, day) => sum + day.dayCost, 0);
  const transport = (transportRates[data.transport] || 45) * days.length;
  const cushion = Math.round((lodging + scheduled + transport) * 0.12);
  const total = lodging + scheduled + transport + cushion;

  return {
    lodging,
    scheduled,
    transport,
    cushion,
    total,
    remaining: data.budget - total
  };
}

function buildRealismNotes(data, days, budget) {
  const notes = [];
  if (data.pace === 'packed') {
    notes.push('Packed pace selected. The plan includes more activities, but keep the evening item optional to avoid burnout.');
  }
  if (budget.remaining < 0) {
    notes.push(`Budget warning: this plan is about ${currency(Math.abs(budget.remaining))} over your budget. Lower lodging style, reduce paid activities, or choose public transit/Uber selectively.`);
  } else {
    notes.push(`Budget check: this plan leaves about ${currency(budget.remaining)} of cushion within your stated budget.`);
  }
  if (days.length <= 2) {
    notes.push('Short trip detected. The planner keeps the schedule focused instead of spreading the trip too thin.');
  }
  if (data.restrictions) {
    notes.push(`Preference check: remember to filter restaurants and activities for: ${data.restrictions}.`);
  }
  return notes;
}

function buildPackingList(data) {
  const list = [...packingBase];
  const destinationKey = normalizeDestination(data.destination);
  if (data.interests.includes('beaches') || destinationKey === 'puerto rico' || destinationKey === 'miami') {
    list.push('Swimsuit, sunscreen, sandals, beach bag, and quick-dry towel');
  }
  if (data.interests.includes('adventure') || data.interests.includes('nature')) {
    list.push('Bug spray, hat, breathable clothes, and small daypack');
  }
  if (data.transport === 'rv') {
    list.push('RV hookup gear, leveling blocks, tire gauge, camp chairs, and campground confirmations');
  }
  if (data.pace === 'packed') {
    list.push('Small crossbody or backpack so you can move quickly between stops');
  }
  return [...new Set(list)];
}

function buildBookingList(data) {
  const list = [
    'Book lodging in the most walkable area that matches your planned activities.',
    `Confirm transportation plan: ${data.transport}.`,
    'Reserve the main paid activity for each full day first.',
    'Make dinner reservations for the busiest nights.',
    'Save offline maps and screenshots of tickets, addresses, and confirmations.'
  ];
  if (data.mustDo) list.unshift(`Book must-do items first: ${data.mustDo}.`);
  if (data.transport === 'rental car') list.push('Check parking cost at hotel and major attractions before booking the car.');
  if (data.transport === 'rv') list.push('Reserve RV parks before finalizing the daily route.');
  return list;
}

function buildStayRecommendation(data) {
  const key = normalizeDestination(data.destination);
  const stay = {
    'puerto rico': 'Stay in Old San Juan for walkability and history, Condado for beach/resort access, or Isla Verde for easier airport and beach logistics.',
    miami: 'Stay in South Beach for beach and nightlife, Brickell for restaurants and city feel, or Coconut Grove/Coral Gables for a calmer base.',
    'new orleans': 'Stay near the French Quarter for walkability, the Warehouse District for balance, or the Garden District for a quieter feel.',
    'baton rouge': 'Stay near Downtown for riverfront/history, near LSU for campus and food, or near I-10/I-12 for easier driving logistics.',
    orlando: 'Stay near the main park area if doing theme parks, International Drive for restaurants and attractions, or Winter Park for a calmer local feel.',
    'new york': 'Stay in Midtown for first-time convenience, Lower Manhattan for history and food, or Brooklyn for a neighborhood-focused trip.',
    default: 'Stay in a walkable area near your top two activities. Avoid saving a small amount on lodging if it adds long daily transportation time.'
  };
  return stay[key] || stay.default;
}

function googleSearchLink(query) {
  return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
}

function renderPlan(data, days, itinerary, budget) {
  const nights = Math.max(days.length - 1, 0);
  const realismNotes = buildRealismNotes(data, days, budget);
  const booking = buildBookingList(data);
  const packing = buildPackingList(data);
  const backups = indoorBackups.slice(0, 5);

  resultTitle.textContent = `${data.destination} plan — ${days.length} day${days.length === 1 ? '' : 's'}`;

  output.innerHTML = `
    <article class="plan-card">
      <h3>Trip summary</h3>
      <div class="summary-grid">
        <div class="metric"><span>Destination</span><strong>${escapeHtml(data.destination)}</strong></div>
        <div class="metric"><span>Dates</span><strong>${formatDate(days[0])} – ${formatDate(days[days.length - 1])}</strong></div>
        <div class="metric"><span>Travelers</span><strong>${data.travelers}</strong></div>
        <div class="metric"><span>Pace</span><strong>${capitalize(data.pace)}</strong></div>
      </div>
    </article>

    <article class="plan-card">
      <h3>Best area to stay</h3>
      <p>${escapeHtml(buildStayRecommendation(data))}</p>
      <p><a class="button secondary" target="_blank" rel="noopener" href="${googleSearchLink(`best area to stay in ${data.destination}`)}">Search stay areas</a></p>
    </article>

    <article class="plan-card">
      <h3>Realism check</h3>
      ${realismNotes.map((note, index) => `<p class="notice ${index === 0 && budget.remaining >= 0 ? 'good-notice' : ''}">${escapeHtml(note)}</p>`).join('')}
    </article>

    <article class="plan-card">
      <h3>Day-by-day itinerary</h3>
      ${itinerary.map(day => `
        <div class="day-card">
          <div class="day-header">
            <h4>Day ${day.dayNumber}: ${escapeHtml(day.theme)}</h4>
            <span>${formatDate(day.date)} · Est. ${currency(day.dayCost)}</span>
          </div>
          ${day.items.map(item => `
            <div class="schedule-row">
              <div class="schedule-time">${item.time}</div>
              <div class="schedule-item">
                <strong>${escapeHtml(item.title)}</strong>
                <p>${escapeHtml(item.note)}</p>
              </div>
              <div class="schedule-cost">${item.cost ? currency(item.cost) : 'Free'}</div>
            </div>
          `).join('')}
        </div>
      `).join('')}
    </article>

    <article class="plan-card">
      <h3>Estimated budget</h3>
      <div class="budget-grid">
        <div class="metric"><span>Lodging ${nights ? `(${nights} nights)` : ''}</span><strong>${currency(budget.lodging)}</strong></div>
        <div class="metric"><span>Meals + activities</span><strong>${currency(budget.scheduled)}</strong></div>
        <div class="metric"><span>Transportation</span><strong>${currency(budget.transport)}</strong></div>
        <div class="metric"><span>Buffer</span><strong>${currency(budget.cushion)}</strong></div>
        <div class="metric"><span>Total estimate</span><strong>${currency(budget.total)}</strong></div>
        <div class="metric"><span>Your budget</span><strong>${currency(data.budget)}</strong></div>
        <div class="metric"><span>Remaining</span><strong>${currency(budget.remaining)}</strong></div>
        <div class="metric"><span>Per traveler</span><strong>${currency(Math.round(budget.total / data.travelers))}</strong></div>
      </div>
    </article>

    <article class="plan-card">
      <h3>Book these first</h3>
      <ol class="check-list">${booking.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ol>
    </article>

    <article class="plan-card">
      <h3>Rainy-day / backup plan</h3>
      <ul class="check-list">${backups.map(item => `<li>${escapeHtml(item)} in or near ${escapeHtml(data.destination)}</li>`).join('')}</ul>
    </article>

    <article class="plan-card">
      <h3>Packing list</h3>
      <ul class="packing-list">${packing.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul>
    </article>

    <article class="plan-card">
      <h3>Useful searches</h3>
      <div class="hero-actions">
        <a class="button secondary" target="_blank" rel="noopener" href="${googleSearchLink(`${data.destination} best restaurants`)}">Restaurants</a>
        <a class="button secondary" target="_blank" rel="noopener" href="${googleSearchLink(`${data.destination} things to do`)}">Activities</a>
        <a class="button secondary" target="_blank" rel="noopener" href="${googleSearchLink(`${data.destination} weather`)}">Weather</a>
        <a class="button secondary" target="_blank" rel="noopener" href="${googleSearchLink(`${data.destination} hotels ${data.lodging}`)}">Hotels</a>
      </div>
    </article>
  `;

  currentPlanText = buildPlainTextPlan(data, days, itinerary, budget, booking, packing, backups, realismNotes);
  currentPlanData = { data, days: days.map(d => d.toISOString()), itinerary, budget, createdAt: new Date().toISOString() };
  savePlan(currentPlanData);
  renderSavedPlans();
}

function buildPlainTextPlan(data, days, itinerary, budget, booking, packing, backups, realismNotes) {
  const lines = [];
  lines.push(`TRIPPILOT PLAN: ${data.destination}`);
  lines.push(`Dates: ${formatDate(days[0])} - ${formatDate(days[days.length - 1])}`);
  lines.push(`Travelers: ${data.travelers}`);
  lines.push(`Budget: ${currency(data.budget)}`);
  lines.push(`Pace: ${capitalize(data.pace)}`);
  lines.push(`Transportation: ${data.transport}`);
  lines.push('');
  lines.push('BEST AREA TO STAY');
  lines.push(buildStayRecommendation(data));
  lines.push('');
  lines.push('REALISM CHECK');
  realismNotes.forEach(note => lines.push(`- ${note}`));
  lines.push('');
  lines.push('ITINERARY');
  itinerary.forEach(day => {
    lines.push(`Day ${day.dayNumber}: ${day.theme} — ${formatDate(day.date)} — Est. ${currency(day.dayCost)}`);
    day.items.forEach(item => lines.push(`  ${item.time}: ${item.title} (${item.cost ? currency(item.cost) : 'Free'}) — ${item.note}`));
    lines.push('');
  });
  lines.push('ESTIMATED BUDGET');
  lines.push(`Lodging: ${currency(budget.lodging)}`);
  lines.push(`Meals + activities: ${currency(budget.scheduled)}`);
  lines.push(`Transportation: ${currency(budget.transport)}`);
  lines.push(`Buffer: ${currency(budget.cushion)}`);
  lines.push(`Total: ${currency(budget.total)}`);
  lines.push(`Remaining: ${currency(budget.remaining)}`);
  lines.push('');
  lines.push('BOOK THESE FIRST');
  booking.forEach((item, index) => lines.push(`${index + 1}. ${item}`));
  lines.push('');
  lines.push('RAINY-DAY BACKUPS');
  backups.forEach(item => lines.push(`- ${item} in or near ${data.destination}`));
  lines.push('');
  lines.push('PACKING LIST');
  packing.forEach(item => lines.push(`- ${item}`));
  return lines.join('\n');
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#039;', '"': '&quot;'
  }[char]));
}

function savePlan(plan) {
  const saved = getSavedPlans();
  const id = `${plan.data.destination}-${plan.data.startDate}-${Date.now()}`;
  const next = [{ id, ...plan }, ...saved].slice(0, 9);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

function getSavedPlans() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function renderSavedPlans() {
  const saved = getSavedPlans();
  if (!saved.length) {
    savedList.innerHTML = '<div class="saved-card"><h3>No saved trips yet</h3><p>Generate a plan and it will show up here.</p></div>';
    return;
  }
  savedList.innerHTML = saved.map(plan => {
    const days = plan.days.map(d => new Date(d));
    return `
      <article class="saved-card">
        <h3>${escapeHtml(plan.data.destination)}</h3>
        <p>${formatDate(days[0])} – ${formatDate(days[days.length - 1])} · ${plan.data.travelers} traveler${plan.data.travelers === 1 ? '' : 's'}</p>
        <p>Estimate: ${currency(plan.budget.total)}</p>
        <button class="button secondary" type="button" data-load-plan="${plan.id}">Load plan</button>
      </article>
    `;
  }).join('');
}

function loadSavedPlan(id) {
  const plan = getSavedPlans().find(item => item.id === id);
  if (!plan) return;
  const days = plan.days.map(d => new Date(d));
  plan.itinerary.forEach((day, index) => day.date = days[index]);
  renderPlan(plan.data, days, plan.itinerary, plan.budget);
  results.hidden = false;
  results.scrollIntoView({ behavior: 'smooth' });
}

form.addEventListener('submit', event => {
  event.preventDefault();
  const data = getTripData();
  const days = getTripDays(data.startDate, data.endDate);

  if (!days.length) {
    alert('Please choose a valid date range.');
    return;
  }

  const itinerary = buildItinerary(data, days);
  const budget = calculateBudget(data, days, itinerary);
  renderPlan(data, days, itinerary, budget);
  results.hidden = false;
  results.scrollIntoView({ behavior: 'smooth' });
});

document.getElementById('loadExample').addEventListener('click', () => {
  const today = new Date();
  const start = new Date(today);
  start.setDate(today.getDate() + 21);
  const end = new Date(start);
  end.setDate(start.getDate() + 3);

  document.getElementById('destination').value = examples.destination;
  document.getElementById('origin').value = examples.origin;
  document.getElementById('budget').value = examples.budget;
  document.getElementById('travelers').value = examples.travelers;
  document.getElementById('pace').value = examples.pace;
  document.getElementById('transport').value = examples.transport;
  document.getElementById('lodging').value = examples.lodging;
  document.getElementById('vibe').value = examples.vibe;
  document.getElementById('mustDo').value = examples.mustDo;
  document.getElementById('restrictions').value = examples.restrictions;
  document.getElementById('startDate').value = start.toISOString().slice(0, 10);
  document.getElementById('endDate').value = end.toISOString().slice(0, 10);

  document.querySelectorAll('input[name="interest"]').forEach(input => {
    input.checked = ['food', 'beaches', 'history', 'nature'].includes(input.value);
  });
});

document.getElementById('copyPlan').addEventListener('click', async () => {
  if (!currentPlanText) return;
  await navigator.clipboard.writeText(currentPlanText);
  alert('Trip plan copied.');
});

document.getElementById('downloadPlan').addEventListener('click', () => {
  if (!currentPlanText || !currentPlanData) return;
  const filename = `${currentPlanData.data.destination.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-trip-plan.txt`;
  const blob = new Blob([currentPlanText], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
});

document.getElementById('printPlan').addEventListener('click', () => window.print());

savedList.addEventListener('click', event => {
  const button = event.target.closest('[data-load-plan]');
  if (!button) return;
  loadSavedPlan(button.dataset.loadPlan);
});

(function initDates() {
  const today = new Date();
  const start = new Date(today);
  start.setDate(today.getDate() + 14);
  const end = new Date(start);
  end.setDate(start.getDate() + 2);
  document.getElementById('startDate').value = start.toISOString().slice(0, 10);
  document.getElementById('endDate').value = end.toISOString().slice(0, 10);
  renderSavedPlans();
})();
