/* ==========================================================================
   Shotlist «Was ich noch erleben will» – wortgleich aus index.html.
   done: true = in der alten Website mit data-done als erledigt markiert.
   Besucher konnten Punkte lokal abhaken (localStorage «jb2-shotlist2») –
   diese Funktion folgt in Phase 3 mit demselben Speicherschlüssel.
   ========================================================================== */

export interface ShotItem { text: string; done?: boolean }
export interface ShotGroup { group: string; items: ShotItem[] }

export const shotlist = {
    title: 'Meine Shotlist',
    hint: 'Was ich noch erleben will',
    groups: [
        { group: 'Reisen', items: [
            { text: 'Kasachstan' }, { text: 'Hainan' }, { text: 'Weihnachtsinsel' }, { text: 'Falklandinseln' },
            { text: 'Island' }, { text: 'Färöer Inseln' }, { text: 'Grönland' }, { text: 'Neufundland' },
            { text: 'Spitzbergen' }, { text: 'Hebriden' }, { text: 'Patagonien' }, { text: 'Lofoten im Winter' },
            { text: 'Nordkap' }, { text: 'Azoren', done: true }, { text: 'Kirgisistan' },
            { text: 'Atacama-Wüste' }, { text: 'Neuseeland' }, { text: 'Alaska' }, { text: 'Mongolei' },
            { text: 'Antarktis' }
        ] },
        { group: 'Erleben', items: [
            { text: '50 km Megamarsch', done: true }, { text: 'Ponta do Pico besteigen' }, { text: 'Wildcampen in Schottland' },
            { text: 'Von Kiruna nach Narvik' }, { text: 'Barrhorn besteigen' }, { text: 'Nordlichter fotografieren' },
            { text: 'Ein Champions-League-Spiel fotografieren' }, { text: 'Eine Nacht in einer SAC-Hütte über 3000 m' },
            { text: 'Mit der Drohne über einen Gletscher' }, { text: 'Sonnenaufgang auf dem Säntis' },
            { text: 'Einen Halbmarathon laufen' }, { text: 'Interrail ohne Plan' },
            { text: 'Ein eigenes Fotobuch drucken' }, { text: 'Die ganze Welt entdecken' }
        ] },
        { group: 'Haben wollen', items: [
            { text: 'Sony FX30' }, { text: 'Ganz weisse Schuhe' }, { text: 'Täglich ein Tomaten-Mozzarella-Sandwich' }, { text: 'Red Bull Sugarfree' },
            { text: 'Ein 70-200 mm f/2.8' }, { text: 'Einen richtigen Gimbal' }, { text: 'Ein Schnittpult mit echten Fadern' },
            { text: 'Einen Monitor, der Farben ehrlich zeigt' }, { text: 'Eine Polaroid-Kamera' }
        ] }
    ] satisfies ShotGroup[]
};
