import { LatLng, LatLngBounds } from "leaflet";

export const VästeråsLatLng = new LatLng(59.6152385, 16.5454105)

export const VästeråsExtremities = {
    bottom: 59.585804,
    left: 16.466103,
    right: 16.624718,
    top: 59.644673,
}

export const VästeråsBounds = new LatLngBounds(
    [VästeråsExtremities.bottom, VästeråsExtremities.left], // SW: [lat, lng]
    [VästeråsExtremities.top, VästeråsExtremities.right],   // NE: [lat, lng]
)