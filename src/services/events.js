import { firebaseApp } from "@/services/firebase";
import {
  getFirestore, collection, doc, getDoc, getDocs,
  query, orderBy
} from "firebase/firestore";

let _cache = null;
const db = getFirestore(firebaseApp);
const col = collection(db, "events");

// Firestore Document to UI Event
function toUiEvent(d) {
  const x = d.data() || {};
  return {
    id: d.id,
    slug: d.id,
    title: x.title || "",
    summary: x.summary || "",
    location: x.location || "",
    date: x.startAt?.toDate?.()
      ? x.startAt.toDate().toISOString().slice(0, 10)
      : (x.date || ""),
    imageUrl: x.imageUrl || "",
    image: x.image || "",
    capacity: Number(x.capacity ?? 0),
    registrations: Number(x.bookedCount ?? x.registrations ?? 0),
    description: x.description || "",
    status: x.status || "open",
  };
}

export async function getAllEvents() {
  if (_cache) return _cache;
  const snap = await getDocs(query(col, orderBy("startAt", "asc")));
  _cache = snap.docs.map(toUiEvent);
  return _cache;
}

export async function getEventBySlug(slug) {
  const d = await getDoc(doc(db, "events", String(slug)));
  if (d.exists()) return toUiEvent(d);
  const list = await getAllEvents();
  return list.find(e => e.slug === slug);
}