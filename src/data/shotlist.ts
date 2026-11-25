/* ==========================================================================
   Shotlist «Was ich noch erleben will» – Deutsch und Englisch.
   done: true = in der alten Website mit data-done als erledigt markiert.
   Der deutsche Text dient als Speicher-Schlüssel (localStorage «jb2-shotlist2»),
   damit abgehakte Punkte in beiden Sprachen gleich bleiben.
   ========================================================================== */
import type { Lang } from '../i18n/ui';

export interface ShotItem { de: string; en: string; done?: boolean }
export interface ShotGroup { group: Record<Lang, string>; items: ShotItem[] }

export const shotlist = {
    title: { de: 'Meine Shotlist', en: 'My shot list' },
    hint: { de: 'Was ich noch erleben will', en: 'Things I still want to experience' },
    groups: [
        { group: { de: 'Reisen', en: 'Travel' }, items: [
            { de: 'Kasachstan', en: 'Kazakhstan' }, { de: 'Hainan', en: 'Hainan' }, { de: 'Weihnachtsinsel', en: 'Christmas Island' },
            { de: 'Falklandinseln', en: 'Falkland Islands' }, { de: 'Island', en: 'Iceland' }, { de: 'Färöer Inseln', en: 'Faroe Islands' },
            { de: 'Grönland', en: 'Greenland' }, { de: 'Neufundland', en: 'Newfoundland' }, { de: 'Spitzbergen', en: 'Svalbard' },
            { de: 'Hebriden', en: 'Hebrides' }, { de: 'Patagonien', en: 'Patagonia' }, { de: 'Lofoten im Winter', en: 'Lofoten in winter' },
            { de: 'Nordkap', en: 'North Cape' }, { de: 'Azoren', en: 'Azores', done: true }, { de: 'Kirgisistan', en: 'Kyrgyzstan' },
            { de: 'Atacama-Wüste', en: 'Atacama Desert' }, { de: 'Neuseeland', en: 'New Zealand' }, { de: 'Alaska', en: 'Alaska' },
            { de: 'Mongolei', en: 'Mongolia' }, { de: 'Antarktis', en: 'Antarctica' }
        ] },
        { group: { de: 'Erleben', en: 'Experiences' }, items: [
            { de: '50 km Megamarsch', en: '50 km Megamarsch hike', done: true }, { de: 'Ponta do Pico besteigen', en: 'Climb Ponta do Pico' },
            { de: 'Wildcampen in Schottland', en: 'Wild camping in Scotland' }, { de: 'Von Kiruna nach Narvik', en: 'From Kiruna to Narvik' },
            { de: 'Barrhorn besteigen', en: 'Climb the Barrhorn' }, { de: 'Nordlichter fotografieren', en: 'Photograph the northern lights' },
            { de: 'Ein Champions-League-Spiel fotografieren', en: 'Photograph a Champions League match' },
            { de: 'Eine Nacht in einer SAC-Hütte über 3000 m', en: 'Spend a night in an SAC hut above 3,000 m' },
            { de: 'Mit der Drohne über einen Gletscher', en: 'Fly a drone over a glacier' }, { de: 'Sonnenaufgang auf dem Säntis', en: 'Sunrise on the Säntis' },
            { de: 'Einen Halbmarathon laufen', en: 'Run a half marathon' }, { de: 'Interrail ohne Plan', en: 'Interrail without a plan' },
            { de: 'Ein eigenes Fotobuch drucken', en: 'Print my own photo book' }, { de: 'Die ganze Welt entdecken', en: 'Explore the whole world' }
        ] },
        { group: { de: 'Haben wollen', en: 'Wish list' }, items: [
            { de: 'Sony FX30', en: 'Sony FX30' }, { de: 'Ganz weisse Schuhe', en: 'All-white sneakers' },
            { de: 'Täglich ein Tomaten-Mozzarella-Sandwich', en: 'A tomato-mozzarella sandwich every day' }, { de: 'Red Bull Sugarfree', en: 'Red Bull Sugarfree' },
            { de: 'Ein 70-200 mm f/2.8', en: 'A 70–200 mm f/2.8' }, { de: 'Einen richtigen Gimbal', en: 'A proper gimbal' },
            { de: 'Ein Schnittpult mit echten Fadern', en: 'An editing console with real faders' },
            { de: 'Einen Monitor, der Farben ehrlich zeigt', en: 'A monitor that shows colours honestly' }, { de: 'Eine Polaroid-Kamera', en: 'A Polaroid camera' }
        ] }
    ] satisfies ShotGroup[]
};
