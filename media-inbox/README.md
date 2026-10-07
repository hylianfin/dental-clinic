# Upload the clinic's photos here

This folder exists for one reason: **photos attached in the chat do not reach the
build environment**, so they cannot be processed. Files uploaded here *do* arrive.

## How to use it

1. Open this folder on GitHub — note the branch in the URL
   (`arena/028af228-dental-clinic`, the branch this site is being built on):
   <https://github.com/Kaydenn07/dental-clinic/tree/arena/028af228-dental-clinic/media-inbox>
2. Click **Add file → Upload files**. If GitHub shows the `main` branch in the
   branch selector, switch it to `arena/028af228-dental-clinic` first.
3. Drag the photos in (all of them at once is fine) and click **Commit changes**.
4. Leave the default file names if you like — nothing else is needed.

They are picked up, processed with `npm run media:setup`, moved into the
git-ignored `media-source/` folder, and **deleted from here** — so this folder
should normally be empty. Nothing in it is ever published as-is.

## What is most useful, in order

| Priority | What | Notes |
|---|---|---|
| 1 | The doctor's photo (the Radio El Bahdia picture) | The About page portrait is cropped from it — the person on the right. |
| 2 | The five patient before/after sheets | Published on the gallery, with the green promotional band trimmed off. |
| 3 | Photos of the real treatment room / reception | They replace the four *illustrative views* currently on the gallery. |
| 4 | A still from the television appearance | Optional; the site only links to the video today. |
| 5 | The logo artwork, if it exists as a file | Otherwise the site keeps its own navy-and-gold mark. |

## Naming (optional, but it helps)

- `radio-station.jpg` — the doctor photo
- `case-01.jpg` … `case-05.jpg` — the patient sheets, in the order you want them shown
- `reception.jpg`, `treatment-room.jpg`, `sterilisation.jpg`, `waiting-area.jpg` — interiors
- `nabd-el-seha.jpg` — the television still

Any common image format works (`.jpg`, `.png`, `.heic` is **not** supported —
if the file is `.heic`, export it as `.jpg` first).
