<template>
  <section class="clinics-page">
    <!-- left: map -->
    <div id="map" class="map"></div>

    <!-- Right: sidebar (compact) -->
    <aside class="sidebar">
      <header class="sidebar-header">
        <h2>Nearby Clinics</h2>
        <p class="muted">Find nearby places, get routes & trip info.</p>
      </header>

      <!-- Controls (compact, with search + search button) -->
      <div class="controls">
        <!-- Search row -->
        <div class="search-row">
          <input
            v-model.trim="keyword"
            @keyup.enter="searchNearby"
            class="input"
            type="text"
            placeholder="clinic / hospital / pharmacy"
            aria-label="Search places of interest"
          />
          <button class="icon-btn" @click="searchNearby" title="Search nearby">
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              <path d="M10.5 4a6.5 6.5 0 1 1 0 13 6.5 6.5 0 0 1 0-13zm0 2a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9zM16 15l4.5 4.5"
                    fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>

        <div class="row compact">
          <div class="stack">
            <label class="label small">Travel mode</label>
            <select v-model="profile" class="select small" @change="reRouteIfSelected">
              <option value="driving-traffic">Driving</option>
              <option value="walking">Walking</option>
              <option value="cycling">Cycling</option>
            </select>
          </div>
        </div>

        <div v-if="userDenied" class="warn">
          Location permission denied. Using default (Melbourne CBD).
        </div>
      </div>

      <!-- Trip information -->
      <div v-if="tripInfo" class="trip">
        <div class="trip-title">Trip information</div>
        <div class="trip-line">
          <span>Distance</span><strong>{{ tripInfo.distanceKm.toFixed(2) }} km</strong>
        </div>
        <div class="trip-line">
          <span>Duration</span><strong>{{ Math.round(tripInfo.durationMin) }} min</strong>
        </div>
        <div class="trip-actions">
          <button class="mini" @click="openExternalNav" :disabled="!selectedPlace">
            Open in Maps
          </button>
        </div>
      </div>

      <!-- Results list (sorted by distance) -->
      <div class="list">
        <div class="list-header">
          <span>Results</span>
          <span class="muted">{{ places.length }} found</span>
        </div>

        <ul class="items">
          <li
            v-for="(p, idx) in places"
            :key="p.id || idx"
            class="item"
            :class="{ active: selectedId === p.id }"
            @click="selectPlace(p)"
          >
            <div class="item-title">{{ p.name }}</div>
            <div class="item-sub ellipsis">{{ p.address }}</div>

            <div class="item-contacts" v-if="p.tel || p.website">
              <a v-if="p.tel" class="mini link" :href="`tel:${p.tel}`" @click.stop>Call</a>
              <a v-if="p.website" class="mini link" :href="p.website" target="_blank" rel="noopener" @click.stop>Website</a>
            </div>

            <div class="item-meta">
              <span>{{ p.distanceKm.toFixed(2) }} km away</span>
              <div class="actions">
                <button class="mini" @click.stop="routeTo(p)">Route</button>
                <button class="mini" @click.stop="openExternalNavFromItem(p)">Open in Maps</button>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </aside>
  </section>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'
import mapboxgl from 'mapbox-gl'
import axios from 'axios'
import 'mapbox-gl/dist/mapbox-gl.css'

// === Config ===
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || 'REPLACE_WITH_YOUR_TOKEN'
mapboxgl.accessToken = MAPBOX_TOKEN

// === State ===
const map = ref(null)
const userDenied = ref(false)
// default search params
const keyword = ref('clinic')
const profile = ref('driving-traffic')

const userPos = ref({ lng: 144.9631, lat: -37.8136 }) // default: Melbourne CBD
const places = ref([])
const markers = ref([])
const userMarker = ref(null)

const routeLayerId = 'route-line'
const routeSourceId = 'route'
const selectedId = ref(null)
const selectedPlace = computed(() => places.value.find(x => x.id === selectedId.value) || null)
const tripInfo = ref(null)

// === Utils ===
function distanceKm(a, b) {
  const toRad = d => (d * Math.PI) / 180
  const R = 6371
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const lat1 = toRad(a.lat)
  const lat2 = toRad(b.lat)
  const h = Math.sin(dLat/2)**2 + Math.cos(lat1)*Math.cos(lat2)*Math.sin(dLng/2)**2
  return 2 * R * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h))
}
function extractContact(props = {}) {
  const tel = props.tel || props['contact:phone'] || props.phone || null
  let website = props.website || props.url || props['contact:website'] || null
  if (website && !/^https?:\/\//i.test(website)) website = `https://${website}`
  return { tel, website }
}

function initMap(center) {
  map.value = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v12',
    center: [center.lng, center.lat],
    zoom: 13,
  })

  userMarker.value = new mapboxgl.Marker({ color: '#1e90ff' })
    .setLngLat([center.lng, center.lat])
    .setPopup(new mapboxgl.Popup().setText('You are here'))
    .addTo(map.value)

  map.value.addControl(new mapboxgl.GeolocateControl({ positionOptions: { enableHighAccuracy: true }, trackUserLocation: false, fitBoundsOptions: { maxZoom: 15 } }), 'bottom-right')
}

function clearMarkers() {
  markers.value.forEach(m => m.remove())
  markers.value = []
}

function addPlaceMarker(place) {
  const marker = new mapboxgl.Marker({ color: '#e11d48' })
    .setLngLat([place.lng, place.lat])
    .setPopup(new mapboxgl.Popup().setHTML(`
      <strong>${place.name}</strong><br/>
      ${place.address}<br/>
      ${place.tel ? `☎ <a href="tel:${place.tel}">${place.tel}</a><br/>` : ''}
      ${place.website ? `🌐 <a href="${place.website}" target="_blank" rel="noopener">Website</a>` : ''}
    `))
    .addTo(map.value)
  markers.value.push(marker)
}

// === Mixed search (Mapbox Geocoding + OSM fallback) ===
async function searchNearby() {
  if (!map.value) return
  tripInfo.value = null
  selectedId.value = null
  removeRoute()

  const kwInput = (keyword.value || 'clinic').toLowerCase().trim()
  const { lng, lat } = userPos.value

  const b = map.value.getBounds()
  const sw = b.getSouthWest()
  const ne = b.getNorthEast()
  const bbox = `${sw.lng},${sw.lat},${ne.lng},${ne.lat}`

  const keywords = Array.from(new Set([
    kwInput,
    'clinic','hospital','pharmacy','medical centre','health service','gp',
    'medical clinic','family clinic','urgent care','physio','dentist'
  ]))

  const categories = ['clinic','hospital','pharmacy','doctor','dentist','physiotherapist','medical']
  const mapboxCategoryUrl =
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(kwInput)}.json` +
    `?bbox=${bbox}&limit=50&country=AU&language=en` +
    `&proximity=${lng},${lat}` +
    `&categories=${encodeURIComponent(categories.join(','))}` +
    `&access_token=${MAPBOX_TOKEN}`

  const mapboxKeywordUrl = (w) =>
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(w)}.json` +
    `?bbox=${bbox}&limit=50&country=AU&language=en&proximity=${lng},${lat}&access_token=${MAPBOX_TOKEN}`

  const nominatimUrl = (w) =>
    `https://nominatim.openstreetmap.org/search?format=json&limit=50` +
    `&q=${encodeURIComponent(w)}&viewbox=${bbox}&bounded=1&addressdetails=1`

  try {
    let feats = []
    try {
      const r = await axios.get(mapboxCategoryUrl)
      feats = feats.concat(r.data?.features || [])
    } catch (_) {}

    const mapboxKw = await Promise.all(
      keywords.map(w => axios.get(mapboxKeywordUrl(w)).catch(() => ({ data: { features: [] } })))
    )
    mapboxKw.forEach(r => { feats = feats.concat(r.data?.features || []) })

    if (feats.length < 10) {
      const osmKw = await Promise.all(
        keywords.map(w => axios.get(nominatimUrl(w), { headers: { 'Accept-Language': 'en' } })
          .catch(() => ({ data: [] })))
      )
      osmKw.forEach(({ data: arr = [] }) => {
        arr.forEach(it => {
          const flng = parseFloat(it.lon)
          const flat = parseFloat(it.lat)
          feats.push({
            id: `osm-${it.place_id}`,
            text: it.display_name?.split(',')[0],
            place_name: it.display_name,
            geometry: { coordinates: [flng, flat] },
            properties: {}
          })
        })
      })
    }

    const seen = new Set()
    const rows = feats.map(f => {
      const [flng, flat] = f.geometry.coordinates
      const name = f.text || f.place_name?.split(',')[0] || kwInput
      const address = f.place_name
      const key = `${name}|${address}|${flng.toFixed(5)},${flat.toFixed(5)}`
      const d = distanceKm({ lng, lat }, { lng: flng, lat: flat })
      const contact = extractContact(f.properties || {})
      return { id: f.id, name, address, lng: flng, lat: flat, distanceKm: d, tel: contact.tel, website: contact.website, _key: key }
    })
    .filter(x => {
      if (seen.has(x._key)) return false
      seen.add(x._key)
      return x.distanceKm <= 20
    })
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .map(({ _key, ...rest }) => rest)

    places.value = rows
    clearMarkers()
    rows.forEach(addPlaceMarker)
    if (rows.length > 0) selectedId.value = rows[0].id
    else alert(`No places found nearby.`)
  } catch (e) {
    console.error('Mixed search error:', e)
    alert('Failed to search nearby places.')
  }
}

// === Select / Route / External navigation ===
function selectPlace(p) {
  selectedId.value = p.id
  map.value.flyTo({ center: [p.lng, p.lat], zoom: 15, speed: 0.8 })
}

async function routeTo(p) {
  const place = p || selectedPlace.value || places.value[0]
  if (!place) { alert('No place to route to.'); return }
  if (place.distanceKm > 80) { alert('Destination is too far for routing.'); return }

  selectedId.value = place.id
  tripInfo.value = null
  removeRoute()

  const start = `${userPos.value.lng},${userPos.value.lat}`
  const end = `${place.lng},${place.lat}`
  const url =
    `https://api.mapbox.com/directions/v5/mapbox/${profile.value}/${start};${end}` +
    `?geometries=geojson&overview=full&access_token=${MAPBOX_TOKEN}`

  try {
    const { data } = await axios.get(url)
    const route = data?.routes?.[0]
    if (!route) { alert('No route found.'); return }

    const geojson = {
      type: 'FeatureCollection',
      features: [{ type: 'Feature', geometry: route.geometry }],
    }

    if (map.value.getSource(routeSourceId)) {
      map.value.getSource(routeSourceId).setData(geojson)
    } else {
      map.value.addSource(routeSourceId, { type: 'geojson', data: geojson })
      map.value.addLayer({
        id: routeLayerId,
        type: 'line',
        source: routeSourceId,
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-width': 5, 'line-opacity': 0.9 },
      })
    }

    const coords = route.geometry.coordinates
    const bounds = coords.reduce((b, c) => b.extend(c), new mapboxgl.LngLatBounds(coords[0], coords[0]))
    map.value.fitBounds(bounds, { padding: 60 })

    tripInfo.value = {
      distanceKm: route.distance / 1000,
      durationMin: route.duration / 60,
    }
  } catch (err) {
    console.error('Directions error:', err)
    alert('Failed to get route.')
  }
}

function reRouteIfSelected() {
  const p = places.value.find(x => x.id === selectedId.value)
  if (p) routeTo(p)
}

function removeRoute() {
  if (!map.value) return
  if (map.value.getLayer(routeLayerId)) map.value.removeLayer(routeLayerId)
  if (map.value.getSource(routeSourceId)) map.value.removeSource(routeSourceId)
}

// Open in Maps
function openExternalNav() {
  const place = selectedPlace.value || places.value[0]
  if (!place) { alert('Please select a place from the list first.'); return }

  const o = `${userPos.value.lat},${userPos.value.lng}`
  const d = `${place.lat},${place.lng}`

  const gm = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(o)}&destination=${encodeURIComponent(d)}&travelmode=${mapProfileToTravel(profile.value)}`
  const am = `https://maps.apple.com/?saddr=${encodeURIComponent(o)}&daddr=${encodeURIComponent(d)}&dirflg=${appleFlag(profile.value)}`

  const isiOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream
  window.open(isiOS ? am : gm, '_blank', 'noopener')
}

function openExternalNavFromItem(p) {
  selectedId.value = p.id
  openExternalNav()
}

function mapProfileToTravel(pf) {
  if (pf.includes('walking')) return 'walking'
  if (pf.includes('cycling')) return 'bicycling'
  return 'driving'
}
function appleFlag(pf) {
  if (pf.includes('walking')) return 'w'
  if (pf.includes('cycling')) return 'c'
  return 'd'
}

// Fly to user location
function flyToUser() {
  if (!map.value) return
  const { lng, lat } = userPos.value
  map.value.flyTo({ center: [lng, lat], zoom: 15, speed: 0.8 })
  if (userMarker.value) userMarker.value.togglePopup()
}

// Custom Recenter Control
class RecenterControl {
  onAdd(m) {
    this._map = m
    const group = document.createElement('div')
    group.className = 'mapboxgl-ctrl-group mapboxgl-ctrl'
    const btn = document.createElement('button')
    btn.type = 'button'
    btn.className = 'mapboxgl-ctrl-icon hhh-recenter-btn'
    btn.title = 'Back to my location'
    btn.addEventListener('click', flyToUser)
    group.appendChild(btn)
    this._container = group
    return group
  }
  onRemove() { this._container?.remove(); this._map = undefined }
}

// Lifecycle
onMounted(() => {
  const start = (pos) => {
    userPos.value = pos
    initMap(userPos.value)
    map.value.once('load', () => searchNearby())
  }

  if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(
      (pos) => start({ lng: pos.coords.longitude, lat: pos.coords.latitude }),
      () => { userDenied.value = true; start(userPos.value) },
      { enableHighAccuracy: true, timeout: 8000 }
    )
  } else {
    userDenied.value = true
    start(userPos.value)
  }
})
</script>

<style scoped>
/* Layout: fixed to viewport; page doesn't scroll; list scrolls internally */
.clinics-page {
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: 12px;
  height: calc(100dvh - 64px);
  padding: 12px;
  overflow: hidden;
}

.map {
  width: 100%;
  height: 100%;
  border-radius: 14px;
  overflow: hidden;
}

/* Right pane: compact spacing & typography */
.sidebar {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-height: 0;
}

.sidebar-header h2 { margin: 0 0 2px 0; font-size: 22px; line-height: 1.1; }
.muted { color: #6b7280; font-size: 12px; margin: 0; }

/* Controls: travel mode + search row */
.controls {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 8px 10px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
}

/* Search row */
.search-row {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 8px;
  align-items: center;
}
.input {
  width: 100%;
  padding: 9px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  outline: none;
}
.icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 10px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  background: #fff;
  cursor: pointer;
}

/* Make the input and select the same height */
.input,
.select.small {
  height: 40px;                
  padding: 0 12px;            
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  font-size: 14px;
  line-height: 1.2;
  box-sizing: border-box;
}

/* Match the icon button height as well */
.icon-btn {
  width: 40px;
  height: 40px;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  background: #fff;
  cursor: pointer;
  box-sizing: border-box;
}

/* Travel mode row */
.row.compact { display: flex; align-items: flex-end; justify-content: space-between; gap: 8px; }
.stack { display: flex; flex-direction: column; gap: 4px; }
.label.small { font-size: 12px; font-weight: 600; color: #374151; }
.select.small { padding: 8px 10px; border: 1px solid #e5e7eb; border-radius: 10px; font-size: 14px; }

/* Trip card (compact) */
.trip { flex-shrink: 0; border: 1px solid #e5e7eb; border-radius: 12px; padding: 10px 12px; }
.trip-title { font-weight: 700; margin-bottom: 6px; }
.trip-line { display: flex; justify-content: space-between; margin: 2px 0; }
.trip-actions { margin-top: 6px; }

/* List: internal scroll + compact items */
.list { flex: 1 1 auto; overflow-y: auto; border: 1px solid #e5e7eb; border-radius: 12px; min-height: 0; }
.list-header { display: flex; justify-content: space-between; align-items: center; padding: 8px 10px; border-bottom: 1px solid #f3f4f6; }
.items { list-style: none; padding: 0; margin: 0; }
.item { padding: 8px 10px; border-bottom: 1px solid #f3f4f6; cursor: pointer; }
.item-title { font-weight: 600; font-size: 14px; }
.item-sub { font-size: 12px; color: #6b7280; margin: 2px 0 6px; }
.ellipsis { overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; line-clamp: 2; -webkit-box-orient: vertical; }
.item-contacts { display: flex; gap: 8px; margin-bottom: 6px; }
.item-meta { display: flex; justify-content: space-between; align-items: center; font-size: 12px; }
.item.active { background: #f9fafb; }
.mini { padding: 6px 10px; border: 1px solid #e5e7eb; background: white; border-radius: 8px; cursor: pointer; }
.link { text-decoration: none; }

/* Mobile: one column, keep internal scroll */
@media (max-width: 960px) {
  .clinics-page { grid-template-columns: 1fr; height: 100dvh; }
  .map { height: 50vh; }
  .sidebar { min-height: 0; }
  .list { flex: 1; }
}

/* padding for bottom-right Mapbox controls */
:deep(.mapboxgl-ctrl-bottom-right) { margin: 8px; }

</style>