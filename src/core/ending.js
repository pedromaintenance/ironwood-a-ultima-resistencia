// Canonical epilogue thresholds and narrative from the original Canvas app.js
// renderEnding(). Pure: no DOM, RNG, saved-state mutations or rendering.
export function campaignEnding(state) {
  if (!state || state.phase !== 'ending') return null;
  const n = Number(state.stats?.trees || 0);
  const p = Number(state.stats?.rescued || 0);
  const kind = n > 25 ? 'cicatrizes' :
    p >= 5 && state.losses <= 1 ? 'solidariedade' : 'resistencia';
  const titles = {
    cicatrizes: 'A Vitória das Cinzas',
    solidariedade: 'A Floresta de Todos',
    resistencia: 'A Última Chama Livre',
  };
  const descriptions = {
    cicatrizes: 'A Corte recua, mas o preço queimou o coração do bosque. Os sobreviventes terão de aprender a reconstruir a natureza que usaram como arma.',
    solidariedade: 'Os faróis reacendem e os refugiados encontram refúgio. Elara proclama: nenhuma floresta pertence aos senhores que apenas sabem cobrá-la.',
    resistencia: 'A campeã caiu. Ironwood permanece de pé, embora a guerra ainda esteja longe de terminar. A resistência tornou-se uma possibilidade real.',
  };
  return {
    kind, title: titles[kind], description: descriptions[kind],
    wins: state.wins, casts: state.casts,
    trees: n, rescued: p, losses: state.losses,
  };
}
