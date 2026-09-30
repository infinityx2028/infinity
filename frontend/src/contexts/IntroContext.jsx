import React, { createContext, useContext } from 'react';

export const IntroContext = createContext({
  isIntroActive: false,
  introPhase: 'completed' // 'initial' | 'revealing' | 'completed'
});

export const useIntro = () => useContext(IntroContext);
