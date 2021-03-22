import features from './features.js';

export function featureLoadFeatures(state) {
  if (!state.features.length) state.features = features;
  // state.features = features;
}
