/**
 * FOUR MOVES FROM THE FAHRTKOSTEN THREAD. Original Skillcase content.
 *
 *   test a rule against its practical effect       → argue
 *   separate a special case from the normal case    → structure
 *   support a demand with a comparison               → justify
 *   admit uncertainty about your own claim            → concede
 */

const EXPRESSIONS = [
  {
    id: "auf_dem_papier_fair_in_der_praxis_anders",
    produceContext: "Eine Regel klingt in der Theorie gerecht, funktioniert in der Praxis aber anders. Sagen Sie beides.",
    produceHint: "Erst die Theorie anerkennen, dann die praktische Realität dagegensetzen.",
    citation: "Auf dem Papier klingt das fair, in der Praxis sieht es anders aus.",
    gloss: "on paper that sounds fair, in practice it looks different",
    who: "Thorsten_B",
    occurrence: "Auf dem Papier klingt das fair — Frühschicht ist objektiv am schwierigsten mit dem Bus zu erreichen. In der Praxis sieht es allerdings anders aus, wie du sagst",
    capability: "argue",
    does: "Sie erkennen die Logik einer Regel an und zeigen gleichzeitig, dass sie in der Realität nicht das erreicht, was sie soll.",
    notThis: "Es ist keine Behauptung, dass die Regel unehrlich gemeint war. Der Widerspruch betrifft die Wirkung, nicht die Absicht.",
    pattern: /auf\s+dem\s+papier\s+klingt\s+das\s+fair\b[\s\S]{0,150}?\bin\s+der\s+praxis\s+sieht\s+es\s+(allerdings\s+)?anders\s+aus\b/i,
    frame: /auf\s+dem\s+papier\b[\s\S]{0,180}?\banders\s+aus\b/i,
    novelty: 3, minWords: 9,
    help: {
      absent: "Benutzen Sie „Auf dem Papier klingt das fair, in der Praxis sieht es anders aus.“",
      frame: "Beide Hälften müssen stehen: die Theorie UND die abweichende Praxis.",
      good: "Genau: Sie erkennen die Logik an und zeigen trotzdem den praktischen Unterschied.",
    },
  },

  {
    id: "eher_die_ausnahme_als_der_normalfall",
    produceContext: "Etwas, das heute üblich ist, war früher selten. Erklären Sie diesen Unterschied.",
    produceHint: "Nennen Sie den damaligen Status als Ausnahme, im Gegensatz zu heute.",
    citation: "Das war eher die Ausnahme als der Normalfall.",
    gloss: "that was more the exception than the norm",
    who: "Carola_Personalabteilung",
    occurrence: "Das war damals wirklich eher die Ausnahme als der Normalfall. Dass sich das inzwischen geändert hat, ist mir ehrlich gesagt neu.",
    capability: "structure",
    does: "Sie ordnen einen früheren Zustand als selten ein, um zu erklären, warum eine alte Regel auf einer Annahme beruht, die heute nicht mehr zutrifft.",
    notThis: "Es ist keine Verteidigung der aktuellen Regel. Es erklärt nur, warum sie damals sinnvoll erschien.",
    pattern: /eher\s+die\s+ausnahme\s+als\s+der\s+normalfall\b/i,
    frame: /eher\s+die\s+ausnahme\s+als\s+der\s+normalfall\b[^.!?]{0,60}/i,
    novelty: 3, minWords: 6,
    help: {
      absent: "Benutzen Sie „Das war eher die Ausnahme als der Normalfall.“",
      frame: "Die Formel steht meist für sich, oft mit einem Kontrast zu „heute“ danach.",
      good: "Genau: Sie erklären, warum eine alte Regel auf veralteten Annahmen beruht.",
    },
  },

  {
    id: "anderswo_wird_das_laengst_so_gemacht",
    produceContext: "Sie fordern eine Änderung und stützen sie mit dem Hinweis, dass andere Orte das bereits erfolgreich anders machen.",
    produceHint: "Nennen Sie ein konkretes Beispiel, bevor Sie den Vergleich ziehen.",
    citation: "Anderswo wird das längst so gemacht.",
    gloss: "elsewhere it's already done that way",
    who: "Ben_bewerbung",
    occurrence: "Bei meinem letzten Arbeitgeber gab es einen Zuschuss für alle Schichten mit eingeschränkter ÖPNV-Anbindung, unabhängig von der Uhrzeit. Anderswo wird das längst so gemacht — es scheint also durchaus machbar zu sein.",
    capability: "justify",
    does: "Sie stützen eine Forderung mit einem konkreten Vergleichsbeispiel, das zeigt, dass die geforderte Praxis nicht nur denkbar, sondern real umsetzbar ist.",
    notThis: "Es ist kein Beweis, dass es bei Ihnen genauso funktionieren muss. Es zeigt nur, dass es grundsätzlich machbar ist.",
    pattern: /anderswo\s+wird\s+das\s+längst\s+so\s+gemacht\b/i,
    frame: /anderswo\s+wird\s+das\s+längst\s+so\s+gemacht\b[^.!?]{0,60}/i,
    novelty: 3, minWords: 6,
    help: {
      absent: "Benutzen Sie „Anderswo wird das längst so gemacht“ nach einem konkreten Beispiel.",
      frame: "Am besten mit einem konkreten Vergleichsbeispiel davor.",
      good: "Genau: Sie zeigen, dass die Forderung nicht nur theoretisch machbar ist.",
    },
  },

  {
    id: "ganz_sicher_bin_ich_mir_da_selbst_nicht",
    produceContext: "Sie haben eine Position geäußert, sind sich aber bei einem Detail selbst nicht ganz sicher. Räumen Sie das ein.",
    produceHint: "Ehrlich bleiben, statt Sicherheit vorzutäuschen.",
    citation: "Ganz sicher bin ich mir allerdings nicht, ob …",
    gloss: "I'm not entirely sure, though, whether …",
    who: "Monika_R",
    occurrence: "Ganz sicher bin ich mir allerdings nicht, ob eine Anpassung wirklich so einfach ist, wie Bens Beispiel klingt.",
    capability: "concede",
    does: "Sie räumen eine eigene Unsicherheit ein, ohne Ihre gesamte Position aufzugeben. Das macht eine Diskussion ehrlicher.",
    notThis: "Es ist kein Widerruf der eigenen Position. Nur ein einzelnes Detail wird als unsicher markiert.",
    pattern: /ganz\s+sicher\s+bin\s+ich\s+mir\s+allerdings\s+nicht\b[^.!?]{0,20}\bob\b/i,
    frame: /ganz\s+sicher\s+bin\s+ich\s+mir\b[^.!?]{0,100}/i,
    novelty: 2, minWords: 6,
    help: {
      absent: "Benutzen Sie „Ganz sicher bin ich mir da selbst nicht.“",
      frame: "Am besten mit einem konkreten Detail davor oder danach, bei dem die Unsicherheit besteht.",
      good: "Genau: Sie bleiben ehrlich über die Grenzen der eigenen Position.",
    },
  },
];

const BY_ID = new Map(EXPRESSIONS.map(e => [e.id, e]));

module.exports = { EXPRESSIONS, BY_ID, SOURCE_ID: "src_fahrtkosten" };
