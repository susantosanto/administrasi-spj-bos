# 🎨 Smart Prompt Builder — Konsep Premium
*Dibuat: 26 Juli 2026 | Status: CONCEPT DESIGN*

---

## 📋 Daftar Isi

1. [Filosofi Desain](#1-filosofi-desain)
2. [Smart Prompt Builder](#2-smart-prompt-builder)
3. [Visual Selector System](#3-visual-selector-system)
4. [Template Prompts](#4-template-prompts)
5. [Premium UI Components](#5-premium-ui-components)
6. [Implementasi](#6-implementasi)

---

## 1. Filosofi Desain

### 🎯 Prinsip Utama

```
╔═════════════════════════════════════════════════════════════╗
║  SMART PROMPT BUILDER — DESIGN PRINCIPLES                   ║
╠═════════════════════════════════════════════════════════════╣
║                                                             ║
║  1️⃣ ZERO-TYPING PHILOSOPHY                                 ║
║     User TIDAK PERLU menulis prompt panjang                ║
║     Cukup PILIH dari opsi visual yang tersedia             ║
║                                                             ║
║  2️⃣ PROGRESSIVE DISCLOSURE                                 ║
║     Tampilkan opsi sederhana dulu                          ║
║     Opsi lanjutan muncul saat user klik "Edit Lanjutan"   ║
║                                                             ║
║  3️⃣ VISUAL-FIRST                                           ║
║     Setiap pilihan punya ICON dan PREVIEW                  ║
║     User bisa "melihat" sebelum generate                   ║
║                                                             ║
║  4️⃣ SMART DEFAULTS                                         ║
║     Setiap aktivitas sudah punya preset terbaik            ║
║     User bisa generate LANGSUNG tanpa ubah apapun         ║
║                                                             ║
║  5️⃣ LIVE PREVIEW                                           ║
║     Prompt terlihat secara real-time saat user memilih     ║
║     User tahu persis apa yang akan dihasilkan              ║
║                                                             ║
╚═════════════════════════════════════════════════════════════╝
```

---

## 2. Smart Prompt Builder

### 2.1 Visual Concept

```
┌─────────────────────────────────────────────────────────────┐
│  📸 Generate Foto Dokumentasi                                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  🎯 LANGKAH 1: Pilih Kegiatan                        │   │
│  │                                                     │   │
│  │  ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐          │   │
│  │  │  👥   │ │  🍱   │ │  📦   │ │  🔧   │          │   │
│  │  │ Rapat │ │ MAMIN │ │  ATK  │ │Pemelih│          │   │
│  │  │   ●   │ │       │ │       │ │       │          │   │
│  │  └───────┘ └───────┘ └───────┘ └───────┘          │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  👔 LANGKAH 2: Pilih Pakaian                         │   │
│  │                                                     │   │
│  │  ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐          │   │
│  │  │  👔   │ │  👕   │ │  👘   │ │  🏫   │          │   │
│  │  │B Formal│ │Batik │ │Casual │ │Seragam│          │   │
│  │  │   ●   │ │       │ │       │ │       │          │   │
│  │  └───────┘ └───────┘ └───────┘ └───────┘          │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  🏢 LANGKAH 3: Pilih Suasana                         │   │
│  │                                                     │   │
│  │  ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐          │   │
│  │  │  🏫   │ │  🌳   │ │  🏛️   │ │  🏠   │          │   │
│  │  │R.Rapat│ │Outdoor│ │Aula   │ │Kantor │          │   │
│  │  │   ●   │ │       │ │       │ │       │          │   │
│  │  └───────┘ └───────┘ └───────┘ └───────┘          │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  👥 LANGKAH 4: Siapa yang Hadir?                     │   │
│  │                                                     │   │
│  │  ┌─────────────────────────────────────────────┐   │   │
│  │  │ ☑ Guru (3-5 orang)                         │   │   │
│  │  │ ☑ Kepala Sekolah                           │   │   │
│  │  │ ☐ Siswa                                    │   │   │
│  │  │ ☐ Staf TU                                   │   │   │
│  │  └─────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  💡 LANGKAH 5: Gaya Foto (Optional)                 │   │
│  │                                                     │   │
│  │  ┌───────┐ ┌───────┐ ┌───────┐                     │   │
│  │  │  📷   │ │  🎬   │ │  📸   │                     │   │
│  │  │Formal │ │Candid │ │Dokumnt│                     │   │
│  │  │   ●   │ │       │ │       │                     │   │
│  │  └───────┘ └───────┘ └───────┘                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ════════════════════════════════════════════════════════  │
│                                                             │
│  📝 PROMPT YANG DIHASILKAN:                                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Generate a photorealistic documentation photo:      │   │
│  │ A teacher meeting in Indonesian school meeting      │   │
│  │ room. Teachers wearing formal white shirts,         │   │
│  │ 3-5 people sitting around a table, whiteboard      │   │
│  │ in background, formal atmosphere, natural          │   │
│  │ lighting, candid style, high quality.              │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  [🖼️ Upload Foto Wajah]                             │   │
│  │                                                     │   │
│  │  ┌─────────────────────────────────────────────┐   │   │
│  │  │  👤                                          │   │   │
│  │  │  Drag & drop selfie atau klik untuk upload   │   │   │
│  │  └─────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                                                     │   │
│  │  [✨ Generate Foto Dokumentasi]                     │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Visual Selector System

### 3.1 Activity Selector (Kegiatan)

```jsx
// src/components/dokumentasi/smart-prompt/ActivitySelector.jsx

const ACTIVITIES = {
  rapat: {
    id: 'rapat',
    name: 'Rapat Guru',
    icon: 'groups',
    emoji: '👥',
    color: 'blue',
    description: 'Meeting / rapat di ruang rapat',
    defaultPrompt: 'A teacher leading a meeting in Indonesian school meeting room',
    defaultScene: 'meeting_room',
    defaultPeople: ['guru', 'kepala_sekolah'],
  },
  mamin: {
    id: 'mamin',
    name: 'Makan Minum',
    icon: 'restaurant',
    emoji: '🍱',
    color: 'orange',
    description: 'Serah terima nasi box / snack box',
    defaultPrompt: 'A teacher receiving catering boxes for school event',
    defaultScene: 'hallway',
    defaultPeople: ['guru'],
  },
  atk: {
    id: 'atk',
    name: 'Serah Terima ATK',
    icon: 'inventory_2',
    emoji: '📦',
    color: 'green',
    description: 'Alat tulis kantor / perlengkapan',
    defaultPrompt: 'A teacher receiving office supplies package',
    defaultScene: 'classroom',
    defaultPeople: ['guru'],
  },
  pemeliharaan: {
    id: 'pemeliharaan',
    name: 'Pemeliharaan',
    icon: 'build',
    emoji: '🔧',
    color: 'purple',
    description: 'Perbaikan / maintenance fasilitas',
    defaultPrompt: 'A teacher supervising maintenance work in school',
    defaultScene: 'outdoor',
    defaultPeople: ['guru'],
  },
}

export default function ActivitySelector({ selected, onSelect }) {
  return (
    <div className="space-y-3">
      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
        <span className="text-lg">🎯</span>
        Pilih Kegiatan
      </label>
      
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Object.values(ACTIVITIES).map((activity) => (
          <button
            key={activity.id}
            onClick={() => onSelect(activity.id)}
            className={`
              group relative flex flex-col items-center gap-2 p-4 rounded-2xl
              border-2 transition-all duration-300
              ${selected === activity.id
                ? `border-${activity.color}-500 bg-${activity.color}-50 shadow-lg scale-105`
                : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
              }
            `}
          >
            {/* Emoji */}
            <span className="text-3xl group-hover:scale-110 transition-transform">
              {activity.emoji}
            </span>
            
            {/* Name */}
            <span className={`
              font-medium text-sm
              ${selected === activity.id 
                ? `text-${activity.color}-700` 
                : 'text-gray-700'
              }
            `}>
              {activity.name}
            </span>
            
            {/* Selected indicator */}
            {selected === activity.id && (
              <span className={`
                absolute -top-2 -right-2 w-6 h-6 rounded-full
                bg-${activity.color}-500 text-white flex items-center justify-center
                text-sm font-bold shadow-md
              `}>
                ✓
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
```

### 3.2 Clothing Selector (Pakaian)

```jsx
// src/components/dokumentasi/smart-prompt/ClothingSelector.jsx

const CLOTHINGS = {
  formal_white: {
    id: 'formal_white',
    name: 'Baju Formal Putih',
    emoji: '👔',
    prompt: 'wearing formal white shirt and black pants',
  },
  batik: {
    id: 'batik',
    name: 'Batik',
    emoji: '👘',
    prompt: 'wearing traditional Indonesian batik shirt',
  },
  casual: {
    id: 'casual',
    name: 'Casual',
    emoji: '👕',
    prompt: 'wearing casual smart outfit',
  },
  uniform: {
    id: 'uniform',
    name: 'Seragam Guru',
    emoji: '🏫',
    prompt: 'wearing teacher uniform (khaki/brown)',
  },
  koko: {
    id: 'koko',
    name: 'Baju Koko',
    emoji: '🕌',
    prompt: 'wearing white koko shirt (Muslim attire)',
  },
}

export default function ClothingSelector({ selected, onSelect }) {
  return (
    <div className="space-y-3">
      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
        <span className="text-lg">👔</span>
        Pilih Pakaian
      </label>
      
      <div className="flex flex-wrap gap-3">
        {Object.values(CLOTHINGS).map((clothing) => (
          <button
            key={clothing.id}
            onClick={() => onSelect(clothing.id)}
            className={`
              flex items-center gap-2 px-4 py-3 rounded-xl
              border-2 transition-all duration-200
              ${selected === clothing.id
                ? 'border-primary bg-primary/10 shadow-md'
                : 'border-gray-200 bg-white hover:border-gray-300'
              }
            `}
          >
            <span className="text-2xl">{clothing.emoji}</span>
            <span className={`
              font-medium text-sm
              ${selected === clothing.id ? 'text-primary' : 'text-gray-700'}
            `}>
              {clothing.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
```

### 3.3 Scene Selector (Suasana)

```jsx
// src/components/dokumentasi/smart-prompt/SceneSelector.jsx

const SCENES = {
  meeting_room: {
    id: 'meeting_room',
    name: 'Ruang Rapat',
    emoji: '🏫',
    prompt: 'in school meeting room with whiteboard and conference table',
    lighting: 'natural lighting from windows',
  },
  classroom: {
    id: 'classroom',
    name: 'Ruang Kelas',
    emoji: '📚',
    prompt: 'in a classroom with desks and educational posters',
    lighting: 'bright classroom lighting',
  },
  hallway: {
    id: 'hallway',
    name: 'Koridor Sekolah',
    emoji: '🚪',
    prompt: 'in school hallway with lockers and bulletin boards',
    lighting: 'natural daylight',
  },
  outdoor: {
    id: 'outdoor',
    name: 'Halaman Sekolah',
    emoji: '🌳',
    prompt: 'outdoor in school courtyard with trees and garden',
    lighting: 'natural sunlight',
  },
  auditorium: {
    id: 'auditorium',
    name: 'Aula',
    emoji: '🏛️',
    prompt: 'in school auditorium with stage and seating area',
    lighting: 'indoor lighting',
  },
  office: {
    id: 'office',
    name: 'Ruang Guru',
    emoji: '💼',
    prompt: 'in teachers office with desks and computers',
    lighting: 'office lighting',
  },
}

export default function SceneSelector({ selected, onSelect }) {
  return (
    <div className="space-y-3">
      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
        <span className="text-lg">🏢</span>
        Pilih Suasana / Tempat
      </label>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {Object.values(SCENES).map((scene) => (
          <button
            key={scene.id}
            onClick={() => onSelect(scene.id)}
            className={`
              flex items-center gap-3 p-4 rounded-xl
              border-2 transition-all duration-200
              ${selected === scene.id
                ? 'border-primary bg-primary/10 shadow-md'
                : 'border-gray-200 bg-white hover:border-gray-300'
              }
            `}
          >
            <span className="text-2xl">{scene.emoji}</span>
            <span className={`
              font-medium text-sm
              ${selected === scene.id ? 'text-primary' : 'text-gray-700'}
            `}>
              {scene.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
```

### 3.4 People Selector (Orang yang Hadir)

```jsx
// src/components/dokumentasi/smart-prompt/PeopleSelector.jsx

import { useState } from 'react'

const PEOPLE_TYPES = {
  guru: {
    id: 'guru',
    name: 'Guru',
    emoji: '👨‍🏫',
    prompt: '3-5 teachers',
    defaultCount: 4,
  },
  kepala_sekolah: {
    id: 'kepala_sekolah',
    name: 'Kepala Sekolah',
    emoji: '👨‍💼',
    prompt: 'school principal',
    defaultCount: 1,
  },
  siswa: {
    id: 'siswa',
    name: 'Siswa',
    emoji: '👨‍🎓',
    prompt: 'students',
    defaultCount: 5,
  },
  staf_tu: {
    id: 'staf_tu',
    name: 'Staf TU',
    emoji: '👩‍💻',
    prompt: 'administrative staff',
    defaultCount: 2,
  },
}

export default function PeopleSelector({ selected, onSelect }) {
  const [counts, setCounts] = useState({
    guru: 4,
    kepala_sekolah: 1,
    siswa: 0,
    staf_tu: 0,
  })

  const handleToggle = (personId) => {
    const isSelected = selected.includes(personId)
    
    if (isSelected) {
      onSelect(selected.filter(id => id !== personId))
    } else {
      onSelect([...selected, personId])
    }
  }

  const handleCountChange = (personId, count) => {
    setCounts(prev => ({
      ...prev,
      [personId]: count
    }))
  }

  return (
    <div className="space-y-3">
      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
        <span className="text-lg">👥</span>
        Siapa yang Hadir?
      </label>
      
      <div className="grid grid-cols-2 gap-3">
        {Object.values(PEOPLE_TYPES).map((person) => {
          const isSelected = selected.includes(person.id)
          
          return (
            <div
              key={person.id}
              className={`
                p-4 rounded-xl border-2 transition-all duration-200
                ${isSelected
                  ? 'border-primary bg-primary/10'
                  : 'border-gray-200 bg-white'
                }
              `}
            >
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => handleToggle(person.id)}
                  className="w-5 h-5 rounded text-primary focus:ring-primary"
                />
                <span className="text-2xl">{person.emoji}</span>
                <span className={`
                  font-medium
                  ${isSelected ? 'text-primary' : 'text-gray-700'}
                `}>
                  {person.name}
                </span>
              </label>
              
              {isSelected && (
                <div className="mt-3 flex items-center gap-2 pl-8">
                  <span className="text-sm text-gray-500">Jumlah:</span>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={counts[person.id]}
                    onChange={(e) => handleCountChange(person.id, parseInt(e.target.value))}
                    className="w-16 px-2 py-1 border border-gray-300 rounded-lg text-sm
                               focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                  <span className="text-sm text-gray-500">orang</span>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
```

### 3.5 Photo Style Selector (Gaya Foto)

```jsx
// src/components/dokumentasi/smart-prompt/PhotoStyleSelector.jsx

const STYLES = {
  formal: {
    id: 'formal',
    name: 'Formal',
    emoji: '📸',
    prompt: 'formal posed photo, everyone looking at camera',
  },
  candid: {
    id: 'candid',
    name: 'Candid',
    emoji: '🎬',
    prompt: 'candid photo, natural interactions, documentary style',
  },
  documentary: {
    id: 'documentary',
    name: 'Dokumenter',
    emoji: '📰',
    prompt: 'documentary style photo, authentic and natural',
  },
}

export default function PhotoStyleSelector({ selected, onSelect }) {
  return (
    <div className="space-y-3">
      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
        <span className="text-lg">✨</span>
        Gaya Foto
      </label>
      
      <div className="flex gap-3">
        {Object.values(STYLES).map((style) => (
          <button
            key={style.id}
            onClick={() => onSelect(style.id)}
            className={`
              flex-1 flex flex-col items-center gap-2 p-4 rounded-xl
              border-2 transition-all duration-200
              ${selected === style.id
                ? 'border-primary bg-primary/10 shadow-md'
                : 'border-gray-200 bg-white hover:border-gray-300'
              }
            `}
          >
            <span className="text-2xl">{style.emoji}</span>
            <span className={`
              font-medium text-sm
              ${selected === style.id ? 'text-primary' : 'text-gray-700'}
            `}>
              {style.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
```

---

## 4. Template Prompts

### 4.1 Smart Prompt Builder Logic

```jsx
// src/services/smartPromptBuilder.js

import { ACTIVITIES } from '../components/dokumentasi/smart-prompt/ActivitySelector'
import { CLOTHINGS } from '../components/dokumentasi/smart-prompt/ClothingSelector'
import { SCENES } from '../components/dokumentasi/smart-prompt/SceneSelector'
import { PEOPLE_TYPES } from '../components/dokumentasi/smart-prompt/PeopleSelector'
import { STYLES } from '../components/dokumentasi/smart-prompt/PhotoStyleSelector'

export function buildSmartPrompt(selections) {
  const {
    activity,
    clothing,
    scene,
    people,
    style,
    customPrompt
  } = selections

  // Jika user input custom prompt, gunakan itu
  if (customPrompt) {
    return customPrompt
  }

  // Build prompt dari selections
  const parts = []
  
  // 1. Activity base
  const activityData = ACTIVITIES[activity]
  if (activityData) {
    parts.push(activityData.defaultPrompt)
  }

  // 2. Clothing
  const clothingData = CLOTHINGS[clothing]
  if (clothingData) {
    parts.push(clothingData.prompt)
  }

  // 3. Scene
  const sceneData = SCENES[scene]
  if (sceneData) {
    parts.push(sceneData.prompt)
    parts.push(sceneData.lighting)
  }

  // 4. People
  if (people && people.length > 0) {
    const peopleDescriptions = people.map(personId => {
      const person = PEOPLE_TYPES[personId]
      return person ? person.prompt : ''
    }).filter(Boolean)
    
    if (peopleDescriptions.length > 0) {
      parts.push(peopleDescriptions.join(' and '))
    }
  }

  // 5. Style
  const styleData = STYLES[style]
  if (styleData) {
    parts.push(styleData.prompt)
  }

  // Combine into full prompt
  const basePrompt = `Generate a photorealistic documentation photo: ${parts.join('. ')}.`
  
  return `${basePrompt} High quality, natural lighting, suitable for school documentation.`
}

export function getDefaultSelections(activityId) {
  const activity = ACTIVITIES[activityId]
  
  if (!activity) {
    return {
      activity: 'rapat',
      clothing: 'formal_white',
      scene: 'meeting_room',
      people: ['guru', 'kepala_sekolah'],
      style: 'formal',
    }
  }

  return {
    activity: activityId,
    clothing: 'formal_white',
    scene: activity.defaultScene,
    people: activity.defaultPeople,
    style: 'formal',
  }
}
```

### 4.2 Pre-built Prompt Templates

```javascript
// src/services/promptTemplates.js

export const PROMPT_TEMPLATES = {
  rapat: {
    formal: `Generate a photorealistic documentation photo: A teacher leading a meeting in Indonesian school meeting room. Teachers wearing formal white shirts, 3-5 people sitting around a table, whiteboard in background, formal atmosphere, natural lighting from windows, everyone looking at camera, high quality.`,
    
    candid: `Generate a photorealistic documentation photo: A teacher leading a meeting in Indonesian school meeting room. Teachers wearing formal white shirts, 3-5 people sitting around a table, whiteboard in background, candid shot showing natural interactions, documentary style, natural lighting, high quality.`,
    
    batik: `Generate a photorealistic documentation photo: A teacher leading a meeting in Indonesian school meeting room. Teachers wearing traditional Indonesian batik shirts, 3-5 people sitting around a table, whiteboard in background, formal atmosphere, natural lighting from windows, high quality.`,
  },
  
  mamin: {
    formal: `Generate a photorealistic documentation photo: A teacher receiving catering boxes (nasi box/snack box) for school event. School hallway background, formal attire, daytime, natural lighting, documentary style, everyone looking at camera, high quality.`,
    
    candid: `Generate a photorealistic documentation photo: A teacher receiving catering boxes (nasi box/snack box) for school event. School hallway background, casual atmosphere, daytime, natural lighting, candid shot, high quality.`,
  },
  
  atk: {
    formal: `Generate a photorealistic documentation photo: A teacher receiving office supplies (ATK) package. School classroom background, boxes of supplies on table, formal attire, daytime, natural lighting, documentary style, high quality.`,
  },
  
  pemeliharaan: {
    formal: `Generate a photorealistic documentation photo: A teacher supervising maintenance work in school. School building background, formal attire, daytime, natural lighting, documentary style, high quality.`,
  },
}
```

---

## 5. Premium UI Components

### 5.1 Live Prompt Preview

```jsx
// src/components/dokumentasi/smart-prompt/LivePromptPreview.jsx

import { useState } from 'react'

export default function LivePromptPreview({ prompt, onEdit }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editedPrompt, setEditedPrompt] = useState(prompt)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
          <span className="text-lg">📝</span>
          Prompt yang Dihasilkan
        </label>
        
        <button
          onClick={() => {
            setIsEditing(!isEditing)
            if (!isEditing) {
              setEditedPrompt(prompt)
            }
          }}
          className="text-xs text-primary hover:underline flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-sm">
            {isEditing ? 'check' : 'edit'}
          </span>
          {isEditing ? 'Selesai' : 'Edit Manual'}
        </button>
      </div>
      
      <div className={`
        rounded-xl border-2 p-4 transition-all duration-200
        ${isEditing 
          ? 'border-primary bg-white' 
          : 'border-gray-200 bg-gray-50'
        }
      `}>
        {isEditing ? (
          <textarea
            value={editedPrompt}
            onChange={(e) => {
              setEditedPrompt(e.target.value)
              onEdit(e.target.value)
            }}
            rows={4}
            className="w-full bg-transparent resize-none focus:outline-none
                       text-sm text-gray-700"
            placeholder="Edit prompt manually..."
          />
        ) : (
          <p className="text-sm text-gray-700 leading-relaxed">
            {prompt}
          </p>
        )}
      </div>
      
      <p className="text-xs text-gray-500">
        💡 Prompt ini akan digunakan untuk generate gambar. 
        {isEditing ? ' Edit sesuai kebutuhan.' : ' Klik "Edit Manual" untuk kustomisasi.'}
      </p>
    </div>
  )
}
```

### 5.2 Quick Presets

```jsx
// src/components/dokumentasi/smart-prompt/QuickPresets.jsx

const QUICK_PRESETS = [
  {
    id: 'rapat_formal',
    name: 'Rapat Formal',
    emoji: '👔',
    description: 'Rapat guru baju formal, ruang rapat',
    selections: {
      activity: 'rapat',
      clothing: 'formal_white',
      scene: 'meeting_room',
      people: ['guru', 'kepala_sekolah'],
      style: 'formal',
    },
  },
  {
    id: 'rapat_batik',
    name: 'Rapat Batik',
    emoji: '👘',
    description: 'Rapat guru baju batik, ruang rapat',
    selections: {
      activity: 'rapat',
      clothing: 'batik',
      scene: 'meeting_room',
      people: ['guru', 'kepala_sekolah'],
      style: 'formal',
    },
  },
  {
    id: 'mamin_candid',
    name: 'MAMIN Candid',
    emoji: '🍱',
    description: 'Serah terima makanan, suasana candid',
    selections: {
      activity: 'mamin',
      clothing: 'casual',
      scene: 'hallway',
      people: ['guru'],
      style: 'candid',
    },
  },
  {
    id: 'atk_formal',
    name: 'ATK Formal',
    emoji: '📦',
    description: 'Serah terima ATK, suasana formal',
    selections: {
      activity: 'atk',
      clothing: 'formal_white',
      scene: 'classroom',
      people: ['guru'],
      style: 'formal',
    },
  },
]

export default function QuickPresets({ onSelect }) {
  return (
    <div className="space-y-3">
      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
        <span className="text-lg">⚡</span>
        Quick Presets
      </label>
      
      <div className="flex gap-3 overflow-x-auto pb-2">
        {QUICK_PRESETS.map((preset) => (
          <button
            key={preset.id}
            onClick={() => onSelect(preset.selections)}
            className="flex-shrink-0 flex items-center gap-3 px-4 py-3 rounded-xl
                       border-2 border-gray-200 bg-white hover:border-primary hover:bg-primary/5
                       transition-all duration-200 min-w-[180px]"
          >
            <span className="text-2xl">{preset.emoji}</span>
            <div className="text-left">
              <p className="font-medium text-sm text-gray-700">{preset.name}</p>
              <p className="text-xs text-gray-500">{preset.description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
```

---

## 6. Implementasi

### 6.1 Main Smart Prompt Builder Component

```jsx
// src/components/dokumentasi/smart-prompt/SmartPromptBuilder.jsx

import { useState, useEffect } from 'react'
import ActivitySelector from './ActivitySelector'
import ClothingSelector from './ClothingSelector'
import SceneSelector from './SceneSelector'
import PeopleSelector from './PeopleSelector'
import PhotoStyleSelector from './PhotoStyleSelector'
import LivePromptPreview from './LivePromptPreview'
import QuickPresets from './QuickPresets'
import { buildSmartPrompt, getDefaultSelections } from '../../services/smartPromptBuilder'

export default function SmartPromptBuilder({ 
  onPromptChange,
  onGenerate,
  isGenerating 
}) {
  // Selections state
  const [selections, setSelections] = useState({
    activity: 'rapat',
    clothing: 'formal_white',
    scene: 'meeting_room',
    people: ['guru', 'kepala_sekolah'],
    style: 'formal',
  })
  
  // Generated prompt
  const [prompt, setPrompt] = useState('')
  const [customPrompt, setCustomPrompt] = useState('')
  const [isCustomMode, setIsCustomMode] = useState(false)

  // Update prompt when selections change
  useEffect(() => {
    if (!isCustomMode) {
      const newPrompt = buildSmartPrompt(selections)
      setPrompt(newPrompt)
      onPromptChange?.(newPrompt)
    }
  }, [selections, isCustomMode])

  // Handle quick preset selection
  const handlePresetSelect = (presetSelections) => {
    setSelections(presetSelections)
    setIsCustomMode(false)
  }

  // Handle custom prompt edit
  const handleCustomPromptEdit = (newPrompt) => {
    setCustomPrompt(newPrompt)
    setIsCustomMode(true)
    onPromptChange?.(newPrompt)
  }

  return (
    <div className="space-y-6">
      {/* Quick Presets */}
      <QuickPresets onSelect={handlePresetSelect} />
      
      <div className="border-t border-gray-200 pt-6">
        {/* Step 1: Activity */}
        <ActivitySelector
          selected={selections.activity}
          onSelect={(activity) => setSelections(prev => ({ ...prev, activity }))}
        />
        
        {/* Step 2: Clothing */}
        <div className="mt-6">
          <ClothingSelector
            selected={selections.clothing}
            onSelect={(clothing) => setSelections(prev => ({ ...prev, clothing }))}
          />
        </div>
        
        {/* Step 3: Scene */}
        <div className="mt-6">
          <SceneSelector
            selected={selections.scene}
            onSelect={(scene) => setSelections(prev => ({ ...prev, scene }))}
          />
        </div>
        
        {/* Step 4: People */}
        <div className="mt-6">
          <PeopleSelector
            selected={selections.people}
            onSelect={(people) => setSelections(prev => ({ ...prev, people }))}
          />
        </div>
        
        {/* Step 5: Photo Style */}
        <div className="mt-6">
          <PhotoStyleSelector
            selected={selections.style}
            onSelect={(style) => setSelections(prev => ({ ...prev, style }))}
          />
        </div>
      </div>
      
      {/* Live Prompt Preview */}
      <div className="border-t border-gray-200 pt-6">
        <LivePromptPreview
          prompt={isCustomMode ? customPrompt : prompt}
          onEdit={handleCustomPromptEdit}
        />
      </div>
    </div>
  )
}
```

### 6.2 Updated Main Page

```jsx
// src/pages/DokumentasiAIPage.jsx (Updated with SmartPromptBuilder)

import { useState } from 'react'
import FaceUploader from '../components/dokumentasi/FaceUploader'
import SmartPromptBuilder from '../components/dokumentasi/smart-prompt/SmartPromptBuilder'
import ResultPreview from '../components/dokumentasi/ResultPreview'
import PrintPreview from '../components/dokumentasi/PrintPreview'
import { generateDocumentationImage } from '../services/imageGenerator'

export default function DokumentasiAIPage() {
  const [view, setView] = useState('upload')
  const [faceImage, setFaceImage] = useState(null)
  const [prompt, setPrompt] = useState('')
  const [generatedImage, setGeneratedImage] = useState(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState(null)
  const [activity, setActivity] = useState(null)
  
  const [schoolInfo, setSchoolInfo] = useState({
    name: 'SD NEGERI 1 JAKARTA',
    address: 'Jl. Pendidikan No. 123, Jakarta Selatan',
    phone: '(021) 12345678',
    email: 'sdn1jkt@smp.belajar.id',
  })

  const handleGenerate = async () => {
    if (!faceImage) {
      alert('Upload foto wajah terlebih dahulu!')
      return
    }

    setIsGenerating(true)
    setError(null)

    try {
      const image = await generateDocumentationImage({
        prompt,
        faceImage,
        provider: 'gemini',
      })
      
      setGeneratedImage(image)
      setView('result')
    } catch (err) {
      setError(err.message || 'Gagal generate gambar')
    } finally {
      setIsGenerating(false)
    }
  }

  // ... (other handlers remain the same)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">auto_awesome</span>
            Generate Foto Dokumentasi
          </h1>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left: Smart Prompt Builder */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <SmartPromptBuilder
                onPromptChange={setPrompt}
                onGenerate={handleGenerate}
                isGenerating={isGenerating}
              />
            </div>
          </div>
          
          {/* Right: Upload & Generate */}
          <div className="space-y-6">
            {/* Face Upload */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <FaceUploader onImageUpload={setFaceImage} />
            </div>
            
            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={!faceImage || isGenerating}
              className="w-full flex items-center justify-center gap-2 bg-primary text-white 
                         py-4 rounded-xl font-semibold text-lg hover:bg-primary/90 
                         transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
                         shadow-lg shadow-primary/25"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                  Generating...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">auto_awesome</span>
                  Generate Foto
                </>
              )}
            </button>
            
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm">
                ❌ {error}
              </div>
            )}
            
            {/* Tips */}
            <div className="bg-blue-50 rounded-2xl p-6">
              <h4 className="font-medium text-blue-900 mb-2">💡 Tips</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Pilih kegiatan, pakaian, suasana</li>
                <li>• Centang orang yang hadir</li>
                <li>• Upload foto selfie</li>
                <li>• Klik Generate!</li>
              </ul>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  )
}
```

---

## 📋 Checklist Implementasi

### Phase 1: Smart Prompt Builder (Hari 1-2)
- [ ] ActivitySelector.jsx
- [ ] ClothingSelector.jsx
- [ ] SceneSelector.jsx
- [ ] PeopleSelector.jsx
- [ ] PhotoStyleSelector.jsx

### Phase 2: Prompt Logic (Hari 3)
- [ ] smartPromptBuilder.js
- [ ] LivePromptPreview.jsx
- [ ] QuickPresets.jsx

### Phase 3: Integration (Hari 4)
- [ ] SmartPromptBuilder.jsx (main)
- [ ] Update DokumentasiAIPage.jsx
- [ ] Test end-to-end

### Phase 4: Polish (Hari 5)
- [ ] Animations
- [ ] Responsive design
- [ ] UX refinements

---

## 🎯 Fitur Premium yang Dihasilkan

```
╔═════════════════════════════════════════════════════════════╗
║  ✅ SMART PROMPT BUILDER — PREMIUM FEATURES                 ║
╠═════════════════════════════════════════════════════════════╣
║                                                             ║
║  ⚡ QUICK PRESETS                                           ║
║     ├── 1-klik untuk konfigurasi populer                   ║
║     ├── Rapat Formal, Rapat Batik, dll                     ║
║     └── Instant setup tanpa pilih manual                   ║
║                                                             ║
║  🎯 VISUAL SELECTORS                                       ║
║     ├── Activity: Icon + Emoji                             ║
║     ├── Clothing: Icon + Emoji                             ║
║     ├── Scene: Icon + Emoji                                ║
║     ├── People: Checkbox + Counter                         ║
║     └── Style: Icon + Emoji                                ║
║                                                             ║
║  📝 LIVE PROMPT PREVIEW                                    ║
║     ├── Real-time prompt update                            ║
║     ├── Visual feedback                                    ║
║     └── Manual edit option                                 ║
║                                                             ║
║  🧠 SMART DEFAULTS                                         ║
║     ├── Auto-fill berdasarkan aktivitas                    ║
║     ├── Recommended settings                               ║
║     └── One-click generate                                 ║
║                                                             ║
║  ✨ ZERO-TYPING                                            ║
║     ├── User TIDAK PERLU menulis                          ║
║     ├── Cukup PILIH dari opsi visual                      ║
║     └── Generate langsung                                  ║
║                                                             ║
╚═════════════════════════════════════════════════════════════╝
```

---

## 💰 Estimasi Waktu

| Komponen | Waktu |
|:---|---:|
| Visual Selectors (5 komponen) | 2-3 hari |
| Smart Prompt Builder Logic | 1 hari |
| Quick Presets | 0.5 hari |
| Live Prompt Preview | 0.5 hari |
| Integration & Testing | 1 hari |
| **Total** | **5-6 hari** |

---

## 🎯 Kesimpulan

> **Smart Prompt Builder — Premium Features:**
> 
> 1. **Zero-Typing:** User cukup PILIH, tidak perlu TULIS
> 2. **Quick Presets:** 1-klik untuk konfigurasi populer
> 3. **Visual Selectors:** Icon + Emoji untuk semua pilihan
> 4. **Live Preview:** Prompt terlihat real-time
> 5. **Smart Defaults:** Auto-fill berdasarkan aktivitas
>
> **User Experience: SANGAT MUDAH & PREMIUM!** 🎉

---

*Kurs: Rp 16.000/USD (per 26 Juli 2026)*
