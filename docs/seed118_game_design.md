# seed118 — Game Design (Entwurf)
Version: v0.6-draft · Stand: 2026-11-23 · Status: **Vorschlag, noch nicht kanonisch**

Dieses Dokument beschreibt, wie das Spiel konkret funktioniert: Welten, Items, Maschinen,
Gameloop und Kapitel. Wenn Entscheidungen hier fallen, werden sie in
`seed118_context.md` (Canon) und `seed118_lore.md` übernommen.

---

## 1. Pitch

> Ein ruhiges Factory-Spiel, in dem du die Elemente baust, wie Sterne es tun –
> und herausfindest, warum 117 Sonden vor dir dabei gestorben sind.

Drei Säulen:
1. **Sammeln:** Das Periodensystem ist das Ziel und die sichtbare Fortschrittsanzeige.
2. **Rätsel:** Die Lore wird nie erklärt, nur angedeutet.
3. **Echte Physik, spielerisch:** Jedes Kapitel entspricht einem echten Entstehungsprozess der Elemente.

Gegenspieler ist **die Physik selbst** (Coulomb-Barriere, Eisen-Grenze, Zerfall), nicht ein Feind.

---

## 2. Grundregeln der Simulation

### 2.1 Items = Atomkerne
- Ein Item ist ein Kern mit **Z (Protonen)** und, ab Kapitel II, **N (Neutronen)**.
- Kapitel I: Jedes Element hat ein „Standard-Isotop“. Sonderfälle sind nur **D** (Deuterium),
  **He-3** und **Be-8**, die als Zwischenprodukte vorkommen.
- **Anregung** (ab Kapitel I, Meilenstein 9): Ein Kern kann für eine feste Zeit „angeregt“ sein.
  Angeregte Kerne fusionieren, als stünden sie einen Hitze-Ring weiter innen.
- **Photonen (γ)** sind ein eigenes Item: ein Nebenprodukt der Fusion und der Treibstoff für den Anreger.
  Ein unverbundener Photon-Ausgang gibt sie einfach ab, **nichts verstopft**.
- **Instabile Kerne** haben eine feste **Lebensdauer in Ticks**, nicht zufällig, damit die
  Simulation deterministisch und lesbar bleibt. Nach Ablauf zerfallen sie in den Tochterkern.

### 2.2 Fusionsregel (eine Regel statt 118 Rezepte)
- **Ein Fusor verschmilzt zwei Eingänge: Z_out = Z_a + Z_b.**
- Erlaubt ist die Fusion nur, wenn der **Hitze-Ring**, in dem der Fusor steht, heiß genug ist.
  Der Hitzebedarf steigt mit der Ladung der Partner (Leitidee Coulomb-Barriere ∝ Z_a·Z_b).
  Die konkreten Werte stehen datengetrieben in einer Tabelle.
- In Kapitel I nur bis **Z ≤ 26 (Eisen)**. Darüber kostet Fusion Energie (→ Kapitel IV).
- Folge: Es gibt **mehrere Wege** zum selben Element (z. B. Si = Mg+He = C+O = O+O−He).
  Die günstigen Wege brauchen viele Schritte, die direkten brauchen mehr Hitze.
  Das ersetzt die „Alternativ-Rezepte“ aus Satisfactory.
- Einige Fusionen haben **feste Nebenprodukte** (z. B. He-3+He-3 → He + 2 H).
  Fusoren haben dafür einen zweiten Ausgang.

### 2.3 Felder (räumliche Mechanik)
Ein gemeinsames System für „Wirkung in einem Umkreis“, das zweimal verwendet wird:
- **Hitzefeld** (Kapitel I): konzentrische Ringe um den **Core** und um **Brennkammern**, innen heißer (siehe 2.5).
- **Neutronenfeld** (ab Kapitel II): Fluss um Reaktoren (Neutronenquelle, Spaltung).

Felder werden in jedem Tick aus dem Zustand berechnet (abgeleiteter Zustand, wird nicht
gespeichert; siehe Architektur §5).

### 2.4 Energie
- **Kapitel I:** Hitze ist die einzige „Energie“. Bänder, Kollektoren und Fusoren laufen
  ohne Strom, damit es ruhig bleibt wie bei shapez.
- **Ab Kapitel III:** **Energie** ist ein globaler Vorrat am Core, gespeist durch Spaltung.
  Verbraucher sind der Beschleuniger und der Materialisierer.
- Es gibt **keine Stromausfälle als Strafe**. Fehlt Energie, arbeitet eine Maschine langsamer.

### 2.5 Core-Stufen und Brennkammern
**Der Core ist die Hitzequelle.** Am Anfang ist er **kalt** und erzeugt keinen Ring.

1. Man liefert H ab → **Core-Stufe 1**: Der Core zündet, um ihn entsteht der erste Hitze-Ring.
2. Dort stellt man Fusoren auf, die das nächste Element erzeugen. Das liefert man ab, und die nächste Stufe wird frei.
3. **Mit jeder Stufe wird der Core heißer.** Innen kommt ein neuer, heißester Ring dazu, und alle
   bisherigen Ringe rücken eine Ringbreite nach außen. Bestehende Maschinen stehen danach höchstens
   heißer, nie kälter. **Es geht also nie etwas kaputt.**
4. Die Stufen sind **dauerhaft** freigeschaltet und kosten keinen Brennstoff, damit der Core ruhig bleibt.

| Core-Stufe | innerster Ring | freigeschaltet durch | ermöglicht z. B. |
|---|---|---|---|
| 0 | – (kalt) | Start | nur Fördern und Liefern |
| 1 | H-Brennen | H | H+H → D, D+H → He-3 |
| 2 | He-Brennen | He | He+He → Be-8 → C, C+He → O |
| 3 | C-Brennen | N · O | C+C → Ne/Na/Mg |
| 4 | O-Brennen | Ne · Na · Mg | O+O → Si |
| 5 | Si-Brennen | Si · S | Leiter bis Fe |

Das ist auch physikalisch stimmig: Ein Sternkern wird mit jeder Brennstufe heißer, und ein Eisenkern
kann nicht mehr fusionieren, er kollabiert zur Supernova. Das ist unsere *Final Ignition*.

**Brennkammer** (ab Meilenstein 8): Wer weiter weg bauen will, stellt eine Brennkammer auf.
- Sie wird mit **Brennstoff** gefüllt und erzeugt dann einen **kleinen Hitze-Ring** um sich.
- Die Stufe hängt vom Brennstoff ab (H = 1, He = 2, C = 3, O = 4, Si = 5). Sie ist
  **höchstens so hoch wie die aktuelle Core-Stufe**.
- Sie verbraucht laufend Brennstoff. Ist sie leer, wird sie kalt, und die Maschinen darin pausieren,
  ohne weitere Strafe.
- **Die Abwägung:** nah am Core gratis, aber eng, oder draußen mit Platz, aber Brennstoff-Kosten.

**Bewusst nicht drin:** keine Masse, keine Temperatur-Simulation. Stufe und Ring sind einfache Zahlen.

---

## 3. Welt & Ressourcen

| Ressource | Vorkommen | Kapitel |
|---|---|---|
| Wasserstoff-Nebel | überall, unendlich (bereits im Worldgen) | I |
| Helium-Nebel | selten, weit vom Start, eine Abkürzung zur pp-Kette | I (Belohnung für Erkunden) |
| Trümmerfeld (Supernova-Überrest) | sehr selten, gemischte schwere Kerne in Spuren (u. a. Th, U) | III |

Rohstoffe sind **unendlich**, wie bei shapez: kein Druck durch Erschöpfung.
Trümmerfelder liefern ein **Gemisch**, das sortiert werden muss (ähnlich wie Fulgora in Factorio).

---

## 4. Maschinen & Freischalt-Rhythmus

### 4.0 Prinzip: Eigenschaften → Verben
shapez verändert **Formen** (drehen, schneiden, stapeln, färben). Wir verändern **Kerne**.
Jede Eigenschaft eines Kerns bringt eigene Verben und damit eigene Maschinen:

| Eigenschaft | Verben | Maschinen |
|---|---|---|
| Protonen Z | verschmelzen · zerschlagen · β-Zerfall | Fusor · Spalter · (Zeit) |
| Neutronen N | bestrahlen · zerfallen | Bestrahler · (Zeit) |
| Anregung | anregen (Photon rein) · abregen (Photon raus) | Anreger |
| Ladung (Kap. IV) | ionisieren | Ionenquelle |
| Gemisch / Masse | sortieren · trennen | Weiche-Filter · Separator |
| Ort | fördern · transportieren · über Leere schießen | Kollektor · Band · Tunnel · Massetreiber |

**Regeln:**
- **Jeder Meilenstein bringt etwas Neues:** eine Maschine, einen Modus, eine Mechanik, ein Gebiet oder ein Komfort-Werkzeug.
- **Etwa alle 2–3 Meilensteine kommt ein neues Verb** (eine neue Maschine).
- Kein Meilenstein verlangt nur „mehr vom Gleichen“, ohne dass ein neues Werkzeug hilft.
  „Skalieren“ ist erlaubt, wenn gleichzeitig Blueprints oder Upgrades kommen.

### 4.1 Logistik (9)
| Maschine | Funktion | Modi / Stufen | ab |
|---|---|---|---|
| **Kollektor** | fördert aus Nebel-Feldern | Rate-Upgrades | I |
| **Band** | transportiert | Tempo-Upgrades | I |
| **Weiche** | teilt / führt zusammen | *Verteilen* · *Filter* · *Priorität* · *Überlauf* · *Isotopen-Filter* (II) | I |
| **Tunnel** | unterquert Bauten | Reichweite | I |
| **Speicher** | puffert; Zerfall läuft weiter, dient also als Abklingbecken | – | I |
| **Senke** | vernichtet | – | I |
| **Massetreiber** | schießt Items geradlinig über leeren Raum zu einem Fänger | Reichweite | I |
| **Core-Andockport** | zusätzliche Eingänge am Core | – | III |
| **Sensor / Zähler** | einfache Logik: zählen, schalten, Weichen steuern | – | II |

### 4.2 Verarbeitung (8)
| Maschine | Funktion | ab |
|---|---|---|
| **Fusor** | 2 Eingänge → Summe (+ Nebenprodukt, + Photon). Braucht einen passenden Hitze-Ring. | I |
| **Spalter** | *Spallation* (C/N/O + H → Li/Be/B + He); ab III Modus *Spaltung* | I |
| **Anreger** | Kern + Photon → angeregter Kern (Timer). Erlaubt Fusion einen Ring weiter außen, damit entlastet er die engen inneren Ringe. | I |
| **Bestrahler** | +1 Neutron pro Durchlauf, muss im Neutronenfeld stehen | II |
| **Separator** | trennt Gemische nach Masse (Trümmerfeld, Spaltfragmente, Beschleuniger-Produkte) | III |
| **Ionenquelle** | macht aus Kernen einen Strahl (Projektil für den Beschleuniger) | IV |
| **Target-Presse** | presst schwere Kerne zu einem Target (Ziel für den Beschleuniger) | IV |
| **Materialisierer** | Energie → Protonen/Neutronen (E = mc²), endlose Senke | Endgame |

### 4.3 Felder, Energie, Spezial
| Maschine | Modi / Stufen | ab |
|---|---|---|
| **Brennkammer** | mit Brennstoff gefüllt → kleiner Hitze-Ring, höchstens Core-Stufe (siehe 2.5) | I (M8) |
| **Reaktor** | *Neutronenquelle* (II) · *Spaltung* (III) | II |
| **Core** | S.E.E.D. 118 selbst; **Hitzequelle mit Stufen 0–5** (siehe 2.5), Lieferungen, Meilensteine, Upgrade-Shop | Start |
| **Beschleuniger** | großer Bau: Strahl (Ionenquelle) + Target → superschwerer Kern; viel Energie | IV |

Gesamt: **21 Gebäude + rund 12 Modi/Stufen**, verteilt über alle vier Kapitel.

### 4.4 Maschinen werden besser: zwei Ebenen
**Grundsatz:** Gebäude kosten nichts (wie bei shapez). Fortschritt entsteht über Upgrades
und bessere Bauteile, nicht über das Herstellen von Gebäuden.

**Ebene 1: globale Upgrades (wie shapez)**
- Gekauft im Upgrade-Shop am Core, bezahlt mit überschüssigen Elementen.
- Gilt **sofort für alle** Gebäude eines Typs. Kein Umbauen, bestehende Layouts bleiben gültig.
- Linien: Bandtempo · Kollektor-Rate · Fusor-Tempo · Core-Ringbreite · Brennkammer-Radius · Massetreiber-Reichweite (später: Bestrahler-Tempo, Separator-Tempo).
- Kosten steigen pro Stufe und verlangen nach und nach **schwerere** Elemente.
  So bleibt jedes Element auch nach seinem Meilenstein gefragt.

**Ebene 2: Maschinen-Stufen (Mk II, Mk III …, wie in Factorio)**
- Neue **Varianten** mit mehr Ein-/Ausgängen, mehr Spuren oder mehreren Schritten in einem Gebäude.
  Die alten Varianten bleiben gültig.
- **Ersetzen-Werkzeug:** zieht ein Rechteck auf und tauscht Mk I gegen Mk II, Ausrichtung und
  Einstellungen bleiben erhalten (gleiche Grundfläche) bzw. werden passend eingesetzt.
- Größere Varianten haben **mehr Ports**. Das verlangt bewusst neue Layouts, denn hier entsteht der Grund, umzubauen.

| Variante | Was sie besser macht | ab (Kap. I Meilenstein) |
|---|---|---|
| **Kollektor Mk II** (2×2) | deckt 4 Nebel-Felder ab, ein Ausgang | 6 |
| **Fusor Mk II** (2×1) | zwei Spuren parallel: 4 Eingänge, 2 Ausgänge | 8 |
| **Weiche Mk II** | 1 Eingang → 3 Ausgänge, Filter mit mehreren Regeln | 10 |
| **Ketten-Fusor** (2×2) | ganze pp-Kette in einem Gebäude: H rein, He raus, Recycling intern | 12 |
| **Fusor Mk III** (2×2) | 4 Spuren, interner Puffer | Kap. II |
| **Bestrahler Mk II** | +2 n pro Durchlauf | Kap. II |
| **Brennkammer Mk II** | größerer Ring, Brennstoff-Puffer | Kap. I (M12) |
| **Reaktor Mk II** | stärkeres Neutronenfeld | Kap. II |

Der Ketten-Fusor ist bewusst ein Meisterschafts-Moment: Das erste Rätsel des Spiels
(pp-Kette mit Recycling) schrumpft später auf ein einzelnes Gebäude, das man nur noch stempelt.

### 4.5 Blueprints
**Pflicht-Feature**, weil Skalieren erst damit Spaß macht.

| Stufe | Funktion | ab |
|---|---|---|
| Kopieren / Einfügen | Bereich markieren → kopieren → drehen → platzieren | Kap. I, Meilenstein 4 |
| Blueprint-Bibliothek | speichern, benennen, Vorschau-Bild | Kap. I, Meilenstein 11 |
| Teilen per Text-Code | Blueprint als kurzer Text, z. B. für Discord oder Reddit | Kap. I, Meilenstein 11 |
| Ersetzen-Werkzeug | Mk-Stufen tauschen (siehe 4.4) | mit der ersten Mk-II-Variante |

- Blueprints enthalten Gebäude, Rotation **und Einstellungen** (z. B. Filterregeln).
- Platzieren ist kostenlos (Gebäude kosten nichts). Teile, die nicht passen, werden als Geist
  angezeigt und übersprungen, nicht blockiert.
- Teilbare Codes sind auch **Community-Marketing**: Leute zeigen ihre kompakten Ring-Layouts.

---

## 5. Gameloop

### Mikro (Sekunden)
Bauen → Band verbinden → zusehen, wie es fließt → Engpass entdecken → umbauen.

### Meso (Minuten): Meilensteine
1. Der Core verlangt eine Menge eines Elements (z. B. 30 × He).
2. Der Spieler findet den Weg (Regel + Hitze), baut ihn und automatisiert ihn.
3. Lieferung erfüllt → **Feld im Periodensystem leuchtet auf** + eine Freischaltung
   (Core-Stufe, Maschinen-Modus, Maschine) + manchmal ein Log-Fragment.
4. **Upgrades** (siehe 4.4) kosten überschüssige Elemente (Bandtempo, Kollektor-Rate, Fusor-Tempo,
   **Core-Ringbreite**). Damit bleibt jedes Element auch nach seinem Meilenstein nützlich.

Mehrere Meilensteine sind gleichzeitig offen, damit der Spieler die Reihenfolge wählen kann.

### Makro (Stunden): Kapitel
Jedes Kapitel bringt **eine neue Mechanik** und endet mit einem **Lore-Wendepunkt**.

### Meta
- Der Speicherstand-Bildschirm zeigt das Periodensystem mit allen freigeschalteten Elementen.
- Nach der Kampagne: Endlos-Modus „Genesis“ (siehe §8).

---

## 6. Kapitel

### Kapitel I — Zündung (H → Fe, 1–26) · *Browser-Version*
**Neue Mechanik:** Fusion + Hitze-Ringe. **Gefühl:** lernen, Ordnung, erste Optimierung.

Meilensteine dürfen auch **Zwischenprodukte** verlangen (D, He-3, Photonen), nicht nur Elemente.
Das ergibt mehr kleine Ziele und mehr Freischaltungen.

| # | Ziel | Weg | Neu: Art | Neu: was |
|---|---|---|---|---|
| 1 | H | Kollektor auf Nebel → Core | Grundlagen | Kollektor, Band, Core |
| 2 | D | H+H → D | **Verb** | **Fusor**, **Core-Stufe 1** (Core zündet, erster Ring) |
| 3 | He | D+H→He-3 · He-3+He-3→He+2H | Logistik | **Weiche** (verteilen/zusammenführen) für die Recycling-Schleife |
| 4 | He (Rate) | dasselbe, aber mehr pro Minute | System | **Upgrade-Shop** öffnet (Band, Kollektor, Fusor) + **Kopieren/Einfügen** |
| 5 | C | He+He→**Be-8** (zerfällt sofort) · Be-8+He→C | Mechanik | **Core-Stufe 2**, **Direktkopplung** Fusor→Fusor, **Tunnel** |
| 6 | N · O | C+H→N · C+He→O (Reihenfolge frei) | Modus | Weiche-Modus **Filter** |
| 7 | Li · Be · B | C/N/O + H → Li/Be/B + He | **Verb** | **Spalter** (zerschlagen) |
| 8 | Ne · Na · Mg | C+C → fester Mix aus Ne/Na/Mg | **Verb** + Mechanik | **Core-Stufe 3**, **Brennkammer**, **Mix-Ausgänge**, **Speicher**, **Fusor Mk II** |
| 9 | F · Al · P | O+H · Mg+H · Si+H | **Verb** | **Photonen** werden sichtbar, **Anreger** |
| 10 | Si · S | Mg+He · O+O | Raum + Logistik | **Core-Stufe 4**, **Helium-Nebel** entdeckt (weit weg) → **Massetreiber** |
| 11 | Cl · Ar · K · Ca | +H / +He | Komfort | **Core-Stufe 5**, **Blueprint-Bibliothek + Teilen** |
| 12 | Sc … Mn (gleichzeitig, mit Rate) | Leiter-Modul bauen und stempeln | Modus | Weiche-Modi **Priorität** + **Überlauf**, **Brennkammer Mk II**, **Ketten-Fusor** |
| 13 | **Fe** | Cr+He → Fe | Lore | **Kapitelende** |

**Takt:** Jeder Meilenstein bringt etwas Neues. Neue Verben kommen bei 2, 7, 8, 9 und 10
(Fusor, Spalter, Brennkammer, Anreger, Massetreiber), also etwa alle 2–3 Meilensteine.

**Lernkurve:** Zwei Regeln (+H und +He) decken die meisten Elemente ab. Dazu kommen
Sonderfälle als „Aha“-Momente: pp-Kette mit Recycling, Be-8 zerfällt sofort, C+C-Mix, Photonen.
Das Periodensystem füllt sich **nicht der Reihe nach**: Li/Be/B bleiben lange leer, und
genau das macht neugierig.

**Ende von Kapitel I:** Eisen wird geliefert. ARCH leitet die *Final Ignition* ein, also die
Supernova, in der sich der Core selbst opfert. Die Zündung **bleibt aus**. Kein Effekt,
nur ein Log. Danach ändert sich eine Wortwahl in der UI und das Spiel läuft einfach weiter.

### Kapitel II — Geduld (Co → Bi, 27–83)
**Neue Mechanik:** Neutroneneinfang + Zerfall (s-Prozess). **Gefühl:** ruhig, lange Linien.
- Reaktor-Modus *Neutronenquelle* erzeugt ein Neutronenfeld. **Bestrahler** im Feld geben +1 n.
- Ein instabiles Isotop zerfällt nach seiner Lebensdauer → **Z+1**.
- **Kernidee: die Einfang-Linie.** Ein langes, gewundenes Band läuft im Wechsel durch Bestrahler
  und Wartestrecken. **Die Bandlänge ist der Timer.** Mit Filtern zweigt man die gewünschten
  Elemente ab. Das bildet räumlich den echten s-Prozess-Pfad nach.
- **Engpässe:** An den „magischen Zahlen“ (N = 50, 82) braucht es mehr Durchläufe (Sr, Ba, Pb).
- **Tc (43) und Pm (61)** sind schon instabil, eine Vorschau auf Kapitel III.
- **Lanthanoide** sehen fast gleich aus, das macht sie zu einem Präzisions-Sortier-Meilenstein.
- Meilensteine fassen hier **Gruppen** zusammen statt Einzelelemente, damit es nicht monoton wird.

**Neu in Kapitel II** (in dieser Reihenfolge):
Reaktor-Modus *Neutronenquelle* + **Bestrahler** (Verb) → Isotopen-Anzeige + Weiche-Modus *Isotopen-Filter*
→ Zerfall als Mechanik („die Bandlänge ist der Timer“) → **Sensor/Zähler** (Verb, Logik)
→ Engpässe an den magischen Zahlen → Tc/Pm instabil (Mechanik) → Mehrfach-Bestrahler-Upgrade
→ Lanthanoide als Präzisions-Sortier-Meilenstein → Massetreiber Stufe 2.

**Ende:** Bismut (83), das letzte stabile Element → **Hauptende**.

### Kapitel III — Zerfall (Po → Fm, 84–100)
**Neue Mechanik:** Halbwertszeiten auf dem Band + Spaltung als Energie.
- Einstieg: ein **Trümmerfeld** liefert Spuren von Th/U → der erste **Spaltreaktor**.
- Spaltung erzeugt **Energie**, ein **starkes Neutronenfeld** (mehrere Einfänge pro Durchlauf) und
  **Spaltfragmente**. Die Fragmente sind Elemente aus Kapitel II und lassen sich recyceln.
- Brüten: U + n → Pu usw.
- **Kurze Lebensdauern:** Die Produktion muss nah am Core stehen, deshalb werden die Core-Ports knapp.
- Abfall ist hier **wertvoll**: Er zerfällt im Speicher über Zerfallsreihen zu Blei.

**Neu in Kapitel III:** Trümmerfeld + **Separator** (Verb) → Reaktor-Modus *Spaltung* + **Energie-Vorrat**
→ Spalter-Modus *Spaltung* → Brüten (Mechanik) → Lebensdauer-Anzeige auf dem Band
→ **Core-Andockport** (Platz am Core) → Zerfallsreihen im Speicher.

### Kapitel IV — Letzte Atome (Md → Og, 101–118)
**Neue Mechanik:** Beschleuniger (Schwerionen-Fusion), Energie als Kosten.
- Echte Rezepte, die **alle Kapitel verbinden**: z. B. Bi + Zn → Nh, Pu + Ca → Fl, Cf + Ca → **Og**.
  Ca-48 ist ein neutronenreiches Ca, braucht also Kapitel I + II.
- Ausbeute: einzelne Atome. Lebensdauer: Sekundenbruchteile → **der Beschleuniger muss direkt am Core andocken.**
- **Neu in Kapitel IV:** **Ionenquelle** (Verb) → **Target-Presse** (Verb) → **Beschleuniger**
  → Separator-Modus *Einzelatom* → **Materialisierer** (Endgame).
  Das entspricht dem echten Ablauf: Strahl + Target + Trennung der Produkte.
- **Ende:** Element 118 geliefert. Keine Zündung, keine Feier. Leben entsteht, eine einzelne Pflanze.

---

## 7. Lore-Anpassungen (Vorschlag)

| Bisher | Vorschlag | Warum |
|---|---|---|
| Final Ignition nach 118 Elementen | **Final Ignition bei Eisen** = Supernova des Cores | So entstehen schwere Elemente in der Natur. 001–117 haben sie „auf einmal“ erzeugt und sind dabei gestorben. |
| Core = abgesetztes Konstrukt *oder* S.E.E.D. selbst (widersprüchlich) | **Core = S.E.E.D. 118 selbst** (verwandelt) | Die ausbleibende Selbstzerstörung betrifft dann die Spielfigur direkt. |
| Twist: Opfer war nicht nötig | bleibt, wird konkreter: **Geduld (s-Prozess) statt Explosion (r-Prozess)** | Mechanik und Botschaft sind dasselbe: Fortsetzung statt Opfer |
| Hauptende 40–60 Elemente | **Hauptende Bi (83)**, wahres Ende 118 | natürliche Grenze „letztes stabiles Element“ |

Trümmerfelder: offen lassen, ob es natürliche Überreste sind oder ob mehr dahintersteckt.

### Beispiel-Logs (Ton: prozedural, trocken)
```
ARCH Genesis Log #1043
Unit 118: arrival confirmed. Core deployment: complete.

Element 002 confirmed. Supervisory review: pending.

Element 026 confirmed. Final ignition sequence: initiated.
Final ignition: not executed. Cause: not recorded.
Escalation path: unavailable.

Units 001–117: final ignition executed. Outcome: not evaluated.
```

---

## 8. Spielmodi

| Modus | Inhalt | Wann |
|---|---|---|
| **Kampagne** | Kapitel I–IV mit Lore | Browser: Kap. I, PC: alle |
| **Sandbox** | alles freigeschaltet, keine Ziele | früh (kostet kaum Aufwand) |
| **Genesis (Endlos)** | nach der Kampagne Energie bzw. Materie in „Genesis“ investieren, unendliche Stufen; später speist das den globalen Genesis-Zähler (Backend) | nach Kap. IV |
| **Reaktor-Rätsel** | feste Zutaten, kleine Fläche, Ziel erreichen; Wertung nach Fläche, Maschinen und Durchsatz (wie Opus Magnum); später Bestenliste | PC-Extra |
| *Lebenszyklus* (Idee) | die Schalen des Sterns verschieben sich mit der Zeit | zurückgestellt, zu viel Druck |

---

## 9. Darstellung (Anforderungen, Stil macht Daniel)

- Flache, geometrische 2D-Vektorgrafik. Der Code zeichnet Platzhalter, damit Grafik nie blockiert.
- Elemente sind auf einen Blick unterscheidbar: Form/Farbe nach Gruppe oder Periode, Symbol beim Heranzoomen.
- Isotope bekommen eine kleine Markierung. **Instabile Kerne zeigen ihre Restlebensdauer** (z. B. einen schrumpfenden Ring).
- Hitze-Ringe sind deutlich sichtbar (glühende konzentrische Kreise) → jede Fabrik sieht aus wie ein Stern.
- Das Neutronenfeld ist klar von der Hitze unterscheidbar (z. B. ein Punktraster).

### 9.1 Zoom-Stufen: „Platinen-Look“
Wie bei shapez soll eine Fabrik von weitem wie eine **Computer-Platine** aussehen. Unser
Unterschied: Die Platine liegt auf einem glühenden Stern, die Hitze-Ringe bleiben sichtbar.

| Zoom | Darstellung |
|---|---|
| **Nah** | volle Details: Element-Symbole auf den Items, Animationen, Port-Pfeile, Restlebensdauer |
| **Mittel** | Maschinen als vereinfachte Formen, Items als farbige Punkte, keine Texte |
| **Fern (Platine)** | Bänder als dünne leuchtende **Leiterbahnen**, Maschinen als dunkle **Chips** mit Pins an den Ports, der Fluss als Lichtpuls entlang der Bahnen; Hitze-Ringe als Glühen, Nebel als weicher Farbhauch |

Anforderungen für die Grafik:
- Jede Maschine braucht **drei Darstellungen** (nah / mittel / fern) mit klarer Silhouette.
- Ports sitzen immer an Kachelkanten, dadurch entstehen von selbst „Pins“ und rechtwinklige „Leiterbahnen“.
- Die Fern-Ansicht ist zugleich der **Performance-Modus**: Chunks werden als fertige Bilder
  gezeichnet, statt jedes Item einzeln, wichtig für den Browser.

## 10. UI
- Bauleiste, Rotation, Abriss.
- Info-Panel: Was macht diese Maschine *hier*? (z. B. „C + He → O · braucht Ring 2 · steht in Ring 2 ✓“)
- Periodensystem-Panel: Fortschritt, offene Meilensteine, gelieferte Mengen.
- Log-Terminal: ARCH- und S.E.E.D.-Logs, optional und nicht linear.
- Blueprint-Leiste, Ersetzen-Werkzeug, Upgrade-Shop am Core.

---

## 11. Umsetzung auf die bestehende Simulation

Schon vorhanden: Grid, Chunks, Worldgen (H), Bauen/Abriss, Ports, Save v1, Determinismus-Tests.

Fehlt in dieser Reihenfolge:
1. Item-Modell (Z, N, Lebensdauer) + Item-Speicher.
2. Transport-System (Band, Port → Port, empfängergesteuert; siehe Architektur §5.1–5.2).
3. Kollektor- und Core-System (Förderung, Lieferung, Zähler).
4. Meilenstein- und Freischalt-Zustand (→ Save v2).
5. Feld-System (Hitze) + Core-Stufen + Fusor mit Regel-Tabelle, danach Brennkammer.
6. Zerfall (deterministische Lebensdauer) + Anregung (gleiche Timer-Mechanik).
7. Upgrades (globale Multiplikatoren im Zustand, gespeichert) + Maschinen-Varianten (eigene Definitionen).
8. Maschinen-Einstellungen als Zustand + Command `ConfigureStructure` (für Filter, Blueprints).
9. Blueprints: Liste aus (Definition, relative Position, Rotation, Einstellungen) → wird zu
   normalen `PlaceStructure`-Commands. Das bleibt deterministisch, und die Drehlogik (`rotateOffsets`) existiert schon.
10. Logs.

## 12. Offene Fragen
- Vier Kapitel wie oben, oder Kap. III + IV zusammenlegen?
- Freie Fusionsregel (jede Summe erlaubt) oder doch eine feste Rezeptliste?
- Liefermengen pro Meilenstein (Kurve) → beim Prototyp festlegen.
- Photonen als eigenes Item, oder reicht der Anreger mit Brennstoff (H)?
- Wie viel Spielzeit soll Kapitel I haben? (Schätzung: 3–6 Stunden)
