import db from '../src/config/db.js';

const [total] = await db.query('SELECT COUNT(*) AS n FROM referentiel_fonctionnalites');

const parEtat = await db.query(
  `SELECT etat, COUNT(*) AS n FROM referentiel_fonctionnalites
   GROUP BY etat ORDER BY n DESC`
);

console.log(`Le cahier : ${total.n} exigences\n`);
for (const e of parEtat) {
  const pct = Math.round((e.n / total.n) * 100);
  console.log(`  ${e.etat.padEnd(18)} ${String(e.n).padStart(4)}   ${String(pct).padStart(3)} %`);
}

const parDocument = await db.query(
  `SELECT document,
          COUNT(*) AS total,
          COUNT(*) FILTER (WHERE etat = 'LIVREE') AS livree
   FROM referentiel_fonctionnalites
   GROUP BY document ORDER BY document`
);
console.log('');
for (const d of parDocument) {
  console.log(`  ${d.document.padEnd(12)} ${d.livree} / ${d.total} livrées `
    + `(${Math.round((d.livree / d.total) * 100)} %)`);
}

process.exit(0);
