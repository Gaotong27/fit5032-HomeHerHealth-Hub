// data access
let _cache = null;

export async function getAllEvents() {
  if (_cache) return _cache;
  
  const data = (await import('../data/events.json')).default;
  _cache = data;
  return data;
}

export async function getEventBySlug(slug) {
  const list = await getAllEvents();
  return list.find(e => e.slug === slug);
}
