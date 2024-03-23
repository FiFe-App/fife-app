# FiFe App

Sziasztok fifék!!
Köszi hogy itt vagytok és érdekel a projekt:)

## A FiFe App lokális (webes) futtatásának előkészületei

1. Node js (v16) telepítése
2. `npm install` parancs futtatása a `fife-app` könyvtárban

## Kliens futtatása production szerverrel:`npm run web_prod`

## Kliens futtatása lokális szerverrel:
1. `npm install netlify-cli -g`
2. Belépés CD paranccsal a `fife-app/functions` könyvtárba.
3. telepítés: `npm install`
4. szerver futtatása: `netlify functions:serve --functions ../functions -p 8888`
5. `npm run web`

## A projekt felépítése

### /app

A különböző oldalak vagyis routok könyvtára (mindegyik a `pages` mappába mutat).
`_layout.jsx` fájl minden más oldal forrása.

### /pages

Az oldalak kódját tartalmazza, mappákba rendezve.

### /firebase

`firebase.js` A Firebase-el kapcsolatos kódokat tartalmazza

### /lib

A redux tárat, kategóriákat és sokszor használt függvényeket tartalmaz.

### /functions

A backend szerver forráskódját tartalmazza.

puszi<3