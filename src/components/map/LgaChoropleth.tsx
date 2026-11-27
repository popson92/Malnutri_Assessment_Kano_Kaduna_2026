import { useEffect, useState, useMemo, useCallback } from 'react'
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet'
import type { Layer, LeafletMouseEvent } from 'leaflet'
import type { Feature, FeatureCollection } from 'geojson'
import type { LgaSummary } from '@/types'
import { lgaFromBoundaryName } from '@/config/geo'

interface Props {
  lgaData: LgaSummary[]
  metric: 'completed' | 'visited' | 'sampled' | 'qualityFlags'
}

const GEOJSON_PATH = '/kano_kaduna_lga.geojson'
const PALETTE = ['#E8F2FC', '#65A5DF', '#438AC9', '#3678B9', '#2A5F94']

function getColor(value: number, max: number): string {
  if (max === 0 || value === 0) return '#F1F5F9'
  const idx = Math.min(Math.floor((value / max) * PALETTE.length), PALETTE.length - 1)
  return PALETTE[idx]
}

function findSummary(lgaMap: Map<string, LgaSummary>, feature: Feature): LgaSummary | undefined {
  const name = feature.properties?.name as string
  const state = feature.properties?.state as string
  if (!name || !state) return undefined
  const mapping = lgaFromBoundaryName(state, name)
  return mapping ? lgaMap.get(mapping.koboCode) : undefined
}

export default function LgaChoropleth({ lgaData, metric }: Props) {
  const [geojson, setGeojson] = useState<FeatureCollection | null>(null)

  useEffect(() => {
    fetch(GEOJSON_PATH)
      .then(r => r.json())
      .then(setGeojson)
      .catch(() => {})
  }, [])

  const lgaMap = useMemo(() => {
    const m = new Map<string, LgaSummary>()
    for (const l of lgaData) m.set(l.lga, l)
    return m
  }, [lgaData])

  const maxVal = useMemo(() => {
    let mx = 0
    for (const l of lgaData) {
      const v = l[metric]
      if (v > mx) mx = v
    }
    return mx
  }, [lgaData, metric])

  const style = useCallback((feature: Feature | undefined) => {
    if (!feature) return { fillColor: '#F1F5F9', weight: 1, opacity: 1, color: '#fff', fillOpacity: 0.7 }
    const summary = findSummary(lgaMap, feature)
    const val = summary ? summary[metric] : 0
    return {
      fillColor: getColor(val, maxVal),
      weight: 1,
      opacity: 1,
      color: '#fff',
      fillOpacity: 0.75,
    }
  }, [lgaMap, metric, maxVal])

  const onEachFeature = useCallback((feature: Feature, layer: Layer) => {
    const name = feature.properties?.name as string
    const state = feature.properties?.state as string
    const summary = findSummary(lgaMap, feature)

    const tooltip = summary
      ? `<strong>${name}</strong> (${state})<br/>Target: ${summary.sampled}<br/>Visited: ${summary.visited}<br/>Completed: ${summary.completed}<br/>CG Done: ${summary.caregiverCompleted}`
      : `<strong>${name}</strong> (${state})`

    layer.bindTooltip(tooltip)
    layer.on({
      mouseover: (e: LeafletMouseEvent) => {
        e.target.setStyle({ weight: 2, color: '#3678B9', fillOpacity: 0.9 })
        e.target.bringToFront()
      },
      mouseout: (e: LeafletMouseEvent) => {
        e.target.setStyle({ weight: 1, color: '#fff', fillOpacity: 0.75 })
      },
    })
  }, [lgaMap])

  if (!geojson) {
    return (
      <div className="flex items-center justify-center h-80 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
        <p className="text-sm text-muted">Loading map boundaries...</p>
      </div>
    )
  }

  return (
    <div className="relative">
      <MapContainer
        center={[10.5, 8.0]}
        zoom={7}
        scrollWheelZoom={false}
        style={{ height: 420, borderRadius: '0.5rem' }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png"
        />
        <GeoJSON key={metric} data={geojson} style={style} onEachFeature={onEachFeature} />
      </MapContainer>
      <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur rounded-lg px-3 py-2 text-[10px] shadow-sm border border-border z-[1000]">
        <p className="font-medium text-ink mb-1 capitalize">{metric}</p>
        <div className="flex items-center gap-1">
          <span className="text-muted">0</span>
          {PALETTE.map((c, i) => (
            <div key={i} className="w-5 h-3 rounded-sm" style={{ backgroundColor: c }} />
          ))}
          <span className="text-muted">{maxVal}</span>
        </div>
      </div>
    </div>
  )
}
