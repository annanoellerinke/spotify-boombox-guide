# Artwork, lettering, and credits

The working example separates the photographed objects from editable text:

| Layer | File or implementation |
| --- | --- |
| Chrome boombox with a blank cassette label | `boombox.png` |
| One cream tape with a blank name strip | `cassette.png`, reused for each playlist |
| Playlist names and red doodles | Live HTML text and inline SVG |
| Paper insert, printed bands, rules, and song list | HTML and CSS in `index.html`, `styles.css`, and `character.css` |
| Play, Pause, Stop, Previous, and Next | Accessible buttons positioned over the boombox image |
| Example screenshot | `preview.jpg`; documentation only |

The two PNGs were generated and edited from Anna's approved mockup using an image-generation tool. Original inspiration photographs and private design files are not included. These images contain no song audio. Use your own permitted references for a new design and keep any third-party logos or artwork within the permission you have for them.

## Creating a different object

First agree on the overall look. Then create or edit the object assets separately so labels and interactions remain editable. If the tool cannot produce true transparency, ask it to correct the asset before building overlays.

Boombox prompt to adapt:

```text
Create a photographic website asset of a wide, low vintage boombox, perfectly
front-facing and horizontal. Raised handle, polished silver chrome body,
two large black mesh speakers, smaller upper speakers, dark frequency tuner,
cream control strip, analog knobs, and visible transport buttons. Include a
cream cassette in the center deck with its handwriting strip left blank.
Use soft even light and clean, believable materials. True transparent
background, including the opening through the handle. No floor, webpage,
extra objects, dirt, dramatic cast shadow, or handwritten playlist title.
Keep a small clear margin around the complete object.
```

Cassette prompt to adapt:

```text
Create one realistic cream plastic cassette, flat and straight-on, perfectly
horizontal. Include molded details, small chrome corner screws, chrome reels
inside a dark tape window, red and black printed label bands, and a cream
ruled name strip at the top. Leave the name strip blank for editable text.
True transparent background, no floor, external cast shadow, angled view,
boombox, paper insert, dirt, or extra objects. Keep the whole cassette visible.
```

For an approved existing mockup, ask the image tool to preserve that exact object and remove the surrounding scene and handwritten title. A new generation will not necessarily reproduce the same shape or button positions. Review the result and reposition the HTML controls to fit the actual image.

## Fonts

| Font | Use | License file |
| --- | --- | --- |
| Bevan regular | Heading and printed owner branding | [bevan-OFL.txt](bevan-OFL.txt) |
| Gaegu regular and bold | Red handwritten song names and tape labels | [gaegu-OFL.txt](gaegu-OFL.txt) |
| Source Serif 4 | Supporting captions and controls | [sourceserif4-OFL.txt](sourceserif4-OFL.txt) |
| Patrick Hand | Earlier base-style fallback; overridden by Gaegu in this version | [patrickhand-OFL.txt](patrickhand-OFL.txt) |

These fonts were distributed through Google Fonts under the included SIL Open Font License. Preserve their copyright notices and license files when redistributing them. The code calls Bevan “Cassette Print” and Gaegu “Tape Marker” through CSS font-family aliases; the font files themselves are unmodified.

The handwriting is a font with small deterministic letter variations, not a reproduction of one person's handwriting. Titles and accessible labels preserve the original words. A custom or commercial font should only replace it when the user supplies an appropriate webfont license.
